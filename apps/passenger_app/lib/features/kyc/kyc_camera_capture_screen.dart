import 'dart:io';
import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import '../../core/theme/app_colors.dart';

class KycCameraCaptureScreen extends StatefulWidget {
  final String photoType; // 'front', 'back', 'selfie'

  const KycCameraCaptureScreen({super.key, required this.photoType});

  @override
  State<KycCameraCaptureScreen> createState() => _KycCameraCaptureScreenState();
}

class _KycCameraCaptureScreenState extends State<KycCameraCaptureScreen> {
  CameraController? _controller;
  List<CameraDescription>? _cameras;
  int _selectedCameraIndex = 0;
  bool _isInitializing = true;
  bool _isCapturing = false;
  XFile? _capturedPhoto;

  bool get _isSelfie => widget.photoType == 'selfie';

  @override
  void initState() {
    super.initState();
    _initCameras();
  }

  Future<void> _initCameras() async {
    try {
      _cameras = await availableCameras();
      if (_cameras == null || _cameras!.isEmpty) {
        setState(() => _isInitializing = false);
        return;
      }

      // Para selfie: buscar cámara frontal por defecto
      // Para documento: buscar cámara trasera por defecto
      final targetDirection = _isSelfie ? CameraLensDirection.front : CameraLensDirection.back;

      int targetIndex = _cameras!.indexWhere((c) => c.lensDirection == targetDirection);
      if (targetIndex == -1) {
        // Fallback a cualquier cámara disponible
        targetIndex = 0;
      }

      _selectedCameraIndex = targetIndex;
      await _initController(_cameras![targetIndex]);
    } catch (e) {
      debugPrint('❌ [Camera] Error al inicializar cámaras: $e');
      setState(() => _isInitializing = false);
    }
  }

  Future<void> _initController(CameraDescription cameraDesc) async {
    _controller?.dispose();
    _controller = CameraController(
      cameraDesc,
      ResolutionPreset.high,
      enableAudio: false,
      imageFormatGroup: ImageFormatGroup.jpeg,
    );

    try {
      await _controller!.initialize();
      if (!mounted) return;
      setState(() => _isInitializing = false);
    } catch (e) {
      debugPrint('❌ [Camera] Error en controller initialize: $e');
      if (!mounted) return;
      setState(() => _isInitializing = false);
    }
  }

  void _switchCamera() {
    if (_cameras == null || _cameras!.length < 2) return;
    setState(() => _isInitializing = true);
    _selectedCameraIndex = (_selectedCameraIndex + 1) % _cameras!.length;
    _initController(_cameras![_selectedCameraIndex]);
  }

  Future<void> _takePicture() async {
    if (_controller == null || !_controller!.value.isInitialized || _isCapturing) return;

    try {
      setState(() => _isCapturing = true);
      final XFile photo = await _controller!.takePicture();
      setState(() {
        _capturedPhoto = photo;
        _isCapturing = false;
      });
    } catch (e) {
      debugPrint('❌ [Camera] Error al tomar foto: $e');
      setState(() => _isCapturing = false);
    }
  }

  void _retakePicture() {
    setState(() {
      _capturedPhoto = null;
    });
  }

  void _confirmPicture() {
    if (_capturedPhoto != null) {
      Navigator.pop(context, File(_capturedPhoto!.path));
    }
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_isInitializing) {
      return const Scaffold(
        backgroundColor: Colors.black,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(color: AppColors.primary),
              SizedBox(height: 16),
              Text('Inicializando cámara...', style: TextStyle(color: Colors.white)),
            ],
          ),
        ),
      );
    }

    if (_controller == null || !_controller!.value.isInitialized) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(title: const Text('Cámara no disponible')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.videocam_off_outlined, size: 60, color: AppColors.error),
                const SizedBox(height: 16),
                const Text(
                  'No se pudo acceder a la cámara en este dispositivo.',
                  style: TextStyle(color: Colors.white, fontSize: 16),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Volver'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    // Si ya se tomó la foto, mostrar pantalla de revisión
    if (_capturedPhoto != null) {
      return Scaffold(
        backgroundColor: Colors.black,
        body: SafeArea(
          child: Column(
            children: [
              Expanded(
                child: Container(
                  margin: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppColors.primary, width: 2),
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: Image.file(File(_capturedPhoto!.path), fit: BoxFit.cover, width: double.infinity),
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
                child: Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        icon: const Icon(Icons.refresh, color: Colors.white),
                        label: const Text('Repetir', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          side: const BorderSide(color: Colors.white38),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                        onPressed: _retakePicture,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: ElevatedButton.icon(
                        icon: const Icon(Icons.check, color: Colors.white),
                        label: const Text('Usar Foto', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.success,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                        onPressed: _confirmPicture,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      );
    }

    // Visor en vivo con HUD personalizado
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Vista previa de cámara
          CameraPreview(_controller!),

          // Máscara HUD de encuadre
          _buildViewfinderOverlay(),

          // Barra Superior con Título y Botón Cerrar
          Positioned(
            top: 40,
            left: 16,
            right: 16,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.white, size: 28),
                  onPressed: () => Navigator.pop(context),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.black54,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.white24),
                  ),
                  child: Text(
                    _isSelfie
                        ? '📸 Cámara Frontal (Selfie)'
                        : (widget.photoType == 'front' ? '📄 Anverso del Documento' : '📄 Reverso del Documento'),
                    style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.flip_camera_android_rounded, color: Colors.white, size: 28),
                  onPressed: _switchCamera,
                ),
              ],
            ),
          ),

          // Botón de Disparo Inferior
          Positioned(
            bottom: 30,
            left: 0,
            right: 0,
            child: Column(
              children: [
                Text(
                  _isSelfie ? 'Ubica tu rostro dentro del círculo' : 'Encuadra el documento dentro del marco',
                  style: const TextStyle(color: Colors.white, fontSize: 13, shadows: [Shadow(color: Colors.black, blurRadius: 4)]),
                ),
                const SizedBox(height: 16),
                GestureDetector(
                  onTap: _takePicture,
                  child: Container(
                    width: 76,
                    height: 76,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 4),
                      color: _isCapturing ? AppColors.primary : Colors.white24,
                    ),
                    child: Center(
                      child: Container(
                        width: 58,
                        height: 58,
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildViewfinderOverlay() {
    return LayoutBuilder(
      builder: (context, constraints) {
        return CustomPaint(
          size: Size(constraints.maxWidth, constraints.maxHeight),
          painter: _ViewfinderPainter(isSelfie: _isSelfie),
        );
      },
    );
  }
}

class _ViewfinderPainter extends CustomPainter {
  final bool isSelfie;

  _ViewfinderPainter({required this.isSelfie});

  @override
  void paint(Canvas canvas, Size size) {
    final backgroundPaint = Paint()
      ..color = Colors.black.withOpacity(0.55)
      ..style = PaintingStyle.fill;

    final borderPaint = Paint()
      ..color = const Color(0xFF7F17E6)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.0;

    final path = Path()..addRect(Rect.fromLTWH(0, 0, size.width, size.height));

    Rect cutoutRect;
    if (isSelfie) {
      // Marco oval para selfie
      final ovalWidth = size.width * 0.72;
      final ovalHeight = ovalWidth * 1.35;
      cutoutRect = Rect.fromCenter(
        center: Offset(size.width / 2, size.height * 0.42),
        width: ovalWidth,
        height: ovalHeight,
      );
      final ovalPath = Path()..addOval(cutoutRect);
      final combinedPath = Path.combine(PathOperation.difference, path, ovalPath);
      canvas.drawPath(combinedPath, backgroundPaint);
      canvas.drawOval(cutoutRect, borderPaint);
    } else {
      // Marco rectangular para documento
      final docWidth = size.width * 0.88;
      final docHeight = docWidth * 0.63;
      cutoutRect = Rect.fromCenter(
        center: Offset(size.width / 2, size.height * 0.42),
        width: docWidth,
        height: docHeight,
      );
      final rrect = RRect.fromRectAndRadius(cutoutRect, const Radius.circular(16));
      final rectPath = Path()..addRRect(rrect);
      final combinedPath = Path.combine(PathOperation.difference, path, rectPath);
      canvas.drawPath(combinedPath, backgroundPaint);
      canvas.drawRRect(rrect, borderPaint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
