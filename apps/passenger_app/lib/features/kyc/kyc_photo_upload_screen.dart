import 'dart:io';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/app_routes.dart';
import 'kyc_repository.dart';
import 'kyc_camera_capture_screen.dart';
import 'package:core_models/core_models.dart';

class KycPhotoUploadScreen extends StatefulWidget {
  final Map<String, dynamic> formData;

  const KycPhotoUploadScreen({super.key, required this.formData});

  @override
  State<KycPhotoUploadScreen> createState() => _KycPhotoUploadScreenState();
}

class _KycPhotoUploadScreenState extends State<KycPhotoUploadScreen> {
  final KycRepository _kycRepo = KycRepository();

  File? _frontImageFile;
  File? _backImageFile;
  File? _selfieImageFile;

  bool _isSubmitting = false;

  DocumentType get _docType => widget.formData['docType'] as DocumentType;
  bool get _needsBackImage => _docType != DocumentType.passport;

  bool get _canSubmit =>
      _frontImageFile != null &&
      (_needsBackImage ? _backImageFile != null : true) &&
      _selfieImageFile != null;

  /// Abre la cámara nativa en vivo dentro de la app:
  /// - Para 'selfie' -> selecciona por defecto la CÁMARA FRONTAL
  /// - Para 'front' y 'back' -> selecciona por defecto la CÁMARA TRASERA
  Future<void> _capturePhoto(String photoType) async {
    final File? capturedFile = await Navigator.push<File>(
      context,
      MaterialPageRoute(
        builder: (context) => KycCameraCaptureScreen(photoType: photoType),
      ),
    );

    if (capturedFile != null) {
      setState(() {
        if (photoType == 'front') _frontImageFile = capturedFile;
        if (photoType == 'back') _backImageFile = capturedFile;
        if (photoType == 'selfie') _selfieImageFile = capturedFile;
      });

      debugPrint('📸 [KYC] Foto $photoType guardada: ${capturedFile.path}');
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('✅ Foto ${photoType.toUpperCase()} lista'),
          backgroundColor: AppColors.success,
          duration: const Duration(seconds: 2),
        ),
      );
    }
  }

  Future<void> _submitAll() async {
    setState(() => _isSubmitting = true);

    debugPrint('🚀 [KycUploadScreen] Iniciando carga de fotos a S3/MinIO...');

    // 1. Solicitar URLs prefirmadas
    final urlsResponse = await _kycRepo.requestUploadUrls(_docType);
    final sessionId = urlsResponse['verification_session_id'];
    final urls = urlsResponse['upload_urls'];

    // 2. Subir imagen frontal
    if (_frontImageFile != null && urls != null && urls['front'] != null) {
      final uploadUrl = urls['front']['uploadUrl'];
      if (uploadUrl != null) {
        await _kycRepo.uploadFileToUrl(uploadUrl, _frontImageFile!);
      }
    }

    // 3. Subir imagen trasera si aplica
    if (_needsBackImage && _backImageFile != null && urls != null && urls['back'] != null) {
      final uploadUrl = urls['back']['uploadUrl'];
      if (uploadUrl != null) {
        await _kycRepo.uploadFileToUrl(uploadUrl, _backImageFile!);
      }
    }

    // 4. Subir selfie
    if (_selfieImageFile != null && urls != null && urls['selfie'] != null) {
      final uploadUrl = urls['selfie']['uploadUrl'];
      if (uploadUrl != null) {
        await _kycRepo.uploadFileToUrl(uploadUrl, _selfieImageFile!);
      }
    }

    final frontKey = (urls != null && urls['front'] != null) ? urls['front']['key'] : 'front.jpg';
    final backKey = (_needsBackImage && urls != null && urls['back'] != null) ? urls['back']['key'] : null;
    final selfieKey = (urls != null && urls['selfie'] != null) ? urls['selfie']['key'] : 'selfie.jpg';

    // 5. Enviar confirmación a la API
    final res = await _kycRepo.submitVerification(
      sessionId: sessionId,
      docType: _docType,
      docNumber: widget.formData['docNumber'],
      birthDate: widget.formData['birthDate'],
      frontKey: frontKey ?? 'front.jpg',
      backKey: backKey,
      selfieKey: selfieKey ?? 'selfie.jpg',
    );

    if (!mounted) return;
    setState(() => _isSubmitting = false);

    if (res['success']) {
      Navigator.pushNamedAndRemoveUntil(
        context,
        AppRoutes.kycStatus,
        (route) => route.isFirst,
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(res['error'] ?? 'Error al enviar verificación'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Fotografías del Documento'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Toca cada tarjeta para abrir la cámara correspondiente y capturar tus fotos:',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 14, height: 1.4),
            ),
            const SizedBox(height: 24),

            // Foto Frontal
            _buildPhotoCard(
              title: 'Foto Frontal del Documento',
              subtitle: 'Cámara Trasera (Cara con foto y datos)',
              capturedFile: _frontImageFile,
              icon: Icons.camera_rear_outlined,
              onTap: () => _capturePhoto('front'),
            ),
            const SizedBox(height: 16),

            // Foto Reverso si aplica
            if (_needsBackImage) ...[
              _buildPhotoCard(
                title: 'Foto Posterior / Reverso',
                subtitle: 'Cámara Trasera (Parte trasera del documento)',
                capturedFile: _backImageFile,
                icon: Icons.camera_rear_outlined,
                onTap: () => _capturePhoto('back'),
              ),
              const SizedBox(height: 16),
            ],

            // Selfie con Prueba de Vida
            _buildPhotoCard(
              title: 'Selfie con Prueba de Vida',
              subtitle: 'Cámara Frontal (Rostro visible sin accesorios)',
              capturedFile: _selfieImageFile,
              icon: Icons.camera_front_outlined,
              onTap: () => _capturePhoto('selfie'),
            ),

            const SizedBox(height: 36),

            // Botón Enviar Verificación
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              onPressed: _canSubmit && !_isSubmitting ? _submitAll : null,
              child: _isSubmitting
                  ? const SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                    )
                  : const Text(
                      'Enviar Verificación',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildPhotoCard({
    required String title,
    required String subtitle,
    required File? capturedFile,
    required IconData icon,
    required VoidCallback onTap,
  }) {
    final hasPhoto = capturedFile != null;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: hasPhoto ? AppColors.success : Colors.white.withOpacity(0.1),
            width: hasPhoto ? 1.8 : 1,
          ),
        ),
        child: Row(
          children: [
            // Vista previa de la foto o icono de cámara
            Container(
              width: 65,
              height: 65,
              decoration: BoxDecoration(
                color: hasPhoto ? Colors.black : AppColors.primary.withOpacity(0.12),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: hasPhoto ? AppColors.success : AppColors.primary.withOpacity(0.3),
                ),
              ),
              child: hasPhoto
                  ? ClipRRect(
                      borderRadius: BorderRadius.circular(11),
                      child: Image.file(capturedFile, fit: BoxFit.cover),
                    )
                  : Icon(icon, color: AppColors.primaryLight, size: 30),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 15),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    hasPhoto ? '✓ Foto lista (Toca para repetir)' : subtitle,
                    style: TextStyle(
                      color: hasPhoto ? AppColors.success : AppColors.textSecondary,
                      fontSize: 12,
                      fontWeight: hasPhoto ? FontWeight.w600 : FontWeight.normal,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              hasPhoto ? Icons.check_circle_rounded : Icons.camera_alt_outlined,
              color: hasPhoto ? AppColors.success : AppColors.textSecondary,
              size: 24,
            ),
          ],
        ),
      ),
    );
  }
}
