import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;
import 'package:shared_ui/shared_ui.dart';
import '../../core/services/driver_tracking_service.dart';
import '../../core/config/driver_config.dart';

class DeliveryVerificationSheet extends StatefulWidget {
  final DriverTrackingService trackingService;

  const DeliveryVerificationSheet({
    super.key,
    required this.trackingService,
  });

  @override
  State<DeliveryVerificationSheet> createState() => _DeliveryVerificationSheetState();
}

class _DeliveryVerificationSheetState extends State<DeliveryVerificationSheet> {
  final ImagePicker _picker = ImagePicker();
  final TextEditingController _receiverNameCtrl = TextEditingController(text: 'Camilo Cervantes');
  final TextEditingController _receiverIdNumberCtrl = TextEditingController(text: '1020485921');
  final TextEditingController _notesCtrl = TextEditingController(text: 'Entregado en recepción principal a conformidad.');

  String _relationship = 'TITULAR';
  bool _isAdultVerified = true;
  String? _idImageBase64;
  List<int>? _imageBytes;
  bool _isSubmitting = false;

  // Imagen sintética de demostración para pruebas sin cámara física
  static const String demoIdBase64 =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

  Future<void> _pickImage(ImageSource source) async {
    try {
      final XFile? file = await _picker.pickImage(
        source: source,
        maxWidth: 1024,
        maxHeight: 1024,
        imageQuality: 85,
      );

      if (file != null) {
        final bytes = await file.readAsBytes();
        setState(() {
          _imageBytes = bytes;
          _idImageBase64 = 'data:image/jpeg;base64,${base64Encode(bytes)}';
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('No se pudo acceder a la cámara o galería: $e')),
        );
      }
    }
  }

  void _useDemoId() {
    setState(() {
      _idImageBase64 = demoIdBase64;
      _imageBytes = null;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('ID de verificación de demostración seleccionado')),
    );
  }

  Future<void> _submitVerification() async {
    if (_idImageBase64 == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: Colors.redAccent,
          content: Text('Debes tomar una foto al documento de identidad del cliente antes de continuar.'),
        ),
      );
      return;
    }

    if (_receiverNameCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: Colors.redAccent,
          content: Text('Ingresa el nombre de la persona que recibe el pedido.'),
        ),
      );
      return;
    }

    if (!_isAdultVerified) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: Colors.redAccent,
          content: Text('Debes confirmar que el receptor es mayor de edad (+18 años).'),
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    final s = widget.trackingService;
    final payload = {
      'order_id': s.orderId,
      'driver_id': s.driverId,
      'driver_name': s.driverName,
      'receiver_name': _receiverNameCtrl.text.trim(),
      'receiver_id_number': _receiverIdNumberCtrl.text.trim(),
      'receiver_relationship': _relationship,
      'id_image_url': _idImageBase64,
      'delivery_latitude': s.latitude,
      'delivery_longitude': s.longitude,
      'delivery_address': 'Calle 10 #42-28, El Poblado, Medellín',
      'delivery_accuracy': s.accuracy,
      'verification_status': 'VERIFICADO',
      'is_adult_verified': _isAdultVerified,
      'notes': _notesCtrl.text.trim(),
    };

    final url = '${DriverConfig.apiBaseUrl}/deliveries/verify';

    try {
      final res = await http.post(
        Uri.parse(url),
        headers: {'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true'},
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 10));

      if (res.statusCode == 200 || res.statusCode == 201) {
        // Actualizar estado local del repartidor
        s.setDeliveryStatus('ENTREGADO');
        s.stopTransmitting();

        if (mounted) {
          Navigator.pop(context, true);
          _showSuccessDialog();
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              backgroundColor: Colors.redAccent,
              content: Text('Error del servidor al registrar entrega (${res.statusCode}): ${res.body}'),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: Colors.redAccent,
            content: Text('Error de conexión al enviar acta de entrega: $e'),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1B1B26),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: LikoraColors.success.withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.check_circle_rounded, color: LikoraColors.success, size: 54),
            ),
            const SizedBox(height: 16),
            const Text(
              '¡Entrega Verificada y Guardada!',
              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 17),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'El acta con la foto del documento de identidad, ubicación GPS exacta y datos del receptor fueron guardados exitosamente en la base de datos de Likora.',
              style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 12),
              textAlign: TextAlign.center,
            ),
          ],
        ),
        actions: [
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: LikoraColors.primary),
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Entendido', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final s = widget.trackingService;

    return Container(
      height: MediaQuery.of(context).size.height * 0.90,
      decoration: const BoxDecoration(
        color: Color(0xFF14131E),
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          // Header Drag Handle
          const SizedBox(height: 12),
          Container(
            width: 44,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.white24,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 12),

          // Header Title
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: LikoraColors.primary.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.badge_rounded, color: LikoraColors.primary, size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Acta de Entrega & Verificación de ID',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      Text(
                        'Pedido #${s.orderId} • Registro de Conformidad Legal',
                        style: const TextStyle(color: Colors.white60, fontSize: 11),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded, color: Colors.white70),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
          const Divider(color: Colors.white10),

          // Body Scroll
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 1. Photo of ID Container
                  _buildIdPhotoSection(),
                  const SizedBox(height: 18),

                  // 2. Receiver Details
                  _buildReceiverDetailsSection(),
                  const SizedBox(height: 18),

                  // 3. Delivery GPS Telemetry Summary
                  _buildGpsProofSection(s),
                  const SizedBox(height: 18),

                  // 4. Age Verification & Notes
                  _buildVerificationCheckboxes(),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),

          // Submit Action Footer
          Container(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
            decoration: const BoxDecoration(
              color: Color(0xFF1A1926),
              border: Border(top: BorderSide(color: Colors.white10)),
            ),
            child: SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: LikoraColors.primary,
                  foregroundColor: Colors.black,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  elevation: 4,
                ),
                icon: _isSubmitting
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                      )
                    : const Icon(Icons.verified_rounded, size: 22),
                label: Text(
                  _isSubmitting ? 'Guardando en Base de Datos...' : 'Confirmar y Guardar Entrega',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                ),
                onPressed: _isSubmitting ? null : _submitVerification,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildIdPhotoSection() {
    final hasPhoto = _idImageBase64 != null;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1D2B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: hasPhoto ? LikoraColors.success.withValues(alpha: 0.6) : Colors.white12,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.camera_alt_rounded, color: LikoraColors.primary, size: 18),
                  SizedBox(width: 8),
                  Text(
                    'Foto del Documento de Identidad',
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                ],
              ),
              if (hasPhoto)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: LikoraColors.success.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.check, color: LikoraColors.success, size: 12),
                      SizedBox(width: 4),
                      Text('Capturado', style: TextStyle(color: LikoraColors.success, fontSize: 10, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),

          // Photo Preview / Placeholder Frame
          if (hasPhoto) ...[
            Container(
              height: 160,
              width: double.infinity,
              decoration: BoxDecoration(
                color: const Color(0xFF13131A),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: LikoraColors.success.withValues(alpha: 0.4)),
              ),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  if (_imageBytes != null)
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.memory(
                        _imageBytes! as dynamic,
                        width: double.infinity,
                        height: 160,
                        fit: BoxFit.cover,
                      ),
                    )
                  else
                    // Preset demo card
                    Container(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.credit_card_rounded, color: LikoraColors.primary, size: 48),
                          const SizedBox(height: 8),
                          const Text(
                            'CÉDULA DE CIUDADANÍA • VERIFICADA',
                            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                          ),
                          Text(
                            'Nombre: ${_receiverNameCtrl.text} • Doc: ${_receiverIdNumberCtrl.text}',
                            style: const TextStyle(color: Colors.white60, fontSize: 11),
                          ),
                        ],
                      ),
                    ),
                  Positioned(
                    top: 8,
                    right: 8,
                    child: IconButton(
                      style: IconButton.styleFrom(
                        backgroundColor: Colors.black54,
                        padding: const EdgeInsets.all(6),
                      ),
                      icon: const Icon(Icons.refresh_rounded, color: Colors.white, size: 18),
                      tooltip: 'Volver a tomar',
                      onPressed: () => _pickImage(ImageSource.camera),
                    ),
                  ),
                ],
              ),
            ),
          ] else ...[
            Container(
              height: 130,
              width: double.infinity,
              decoration: BoxDecoration(
                color: const Color(0xFF171722),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white10, style: BorderStyle.solid),
              ),
              child: const Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.document_scanner_rounded, color: Colors.white38, size: 36),
                  SizedBox(height: 8),
                  Text(
                    'Enfoca la cédula o documento del cliente',
                    style: TextStyle(color: Colors.white70, fontSize: 12),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Requerido por normativa legal para entrega de licores',
                    style: TextStyle(color: Colors.white38, fontSize: 10),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 12),

          // Camera Action Buttons
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    foregroundColor: LikoraColors.primary,
                    side: const BorderSide(color: LikoraColors.primary),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  icon: const Icon(Icons.camera_alt, size: 16),
                  label: const Text('Tomar Foto', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  onPressed: () => _pickImage(ImageSource.camera),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.white70,
                    side: const BorderSide(color: Colors.white24),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  icon: const Icon(Icons.photo_library_outlined, size: 16),
                  label: const Text('Galería', style: TextStyle(fontSize: 12)),
                  onPressed: () => _pickImage(ImageSource.gallery),
                ),
              ),
              const SizedBox(width: 8),
              IconButton(
                style: IconButton.styleFrom(
                  backgroundColor: const Color(0xFF262635),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                tooltip: 'Simular ID para pruebas',
                icon: const Icon(Icons.smart_toy_outlined, color: Colors.amber, size: 18),
                onPressed: _useDemoId,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildReceiverDetailsSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1D2B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.person_pin_rounded, color: LikoraColors.primary, size: 18),
              SizedBox(width: 8),
              Text(
                'Datos de la Persona que Recibe',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Receiver Name
          TextField(
            controller: _receiverNameCtrl,
            style: const TextStyle(color: Colors.white, fontSize: 13),
            decoration: InputDecoration(
              labelText: 'Nombre Completo del Receptor',
              labelStyle: const TextStyle(color: Colors.white60, fontSize: 12),
              filled: true,
              fillColor: const Color(0xFF151520),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
              prefixIcon: const Icon(Icons.person_outline, color: Colors.white38, size: 18),
            ),
          ),
          const SizedBox(height: 10),

          // Receiver ID Number
          TextField(
            controller: _receiverIdNumberCtrl,
            keyboardType: TextInputType.number,
            style: const TextStyle(color: Colors.white, fontSize: 13),
            decoration: InputDecoration(
              labelText: 'Número de Identificación (Cédula / ID)',
              labelStyle: const TextStyle(color: Colors.white60, fontSize: 12),
              filled: true,
              fillColor: const Color(0xFF151520),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
              prefixIcon: const Icon(Icons.credit_card_outlined, color: Colors.white38, size: 18),
            ),
          ),
          const SizedBox(height: 10),

          // Relationship Selector
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              color: const Color(0xFF151520),
              borderRadius: BorderRadius.circular(10),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: _relationship,
                dropdownColor: const Color(0xFF222230),
                isExpanded: true,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                icon: const Icon(Icons.keyboard_arrow_down_rounded, color: Colors.white54),
                items: const [
                  DropdownMenuItem(value: 'TITULAR', child: Text('Titular del Pedido')),
                  DropdownMenuItem(value: 'FAMILIAR', child: Text('Familiar / Cónyuge')),
                  DropdownMenuItem(value: 'PORTERIA', child: Text('Portería / Recepción')),
                  DropdownMenuItem(value: 'OTRO', child: Text('Amigo o Autorizado')),
                ],
                onChanged: (val) {
                  if (val != null) setState(() => _relationship = val);
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGpsProofSection(DriverTrackingService s) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF171624),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.location_searching_rounded, color: LikoraColors.primary, size: 16),
              SizedBox(width: 8),
              Text(
                'Evidencia de Ubicación GPS de Entrega',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Coordenadas: [${s.latitude.toStringAsFixed(6)}, ${s.longitude.toStringAsFixed(6)}]',
            style: const TextStyle(color: Colors.white70, fontSize: 11, fontFamily: 'monospace'),
          ),
          const SizedBox(height: 2),
          const Text(
            'Dirección: Calle 10 #42-28, El Poblado, Medellín',
            style: TextStyle(color: Colors.white70, fontSize: 11),
          ),
          const SizedBox(height: 2),
          Text(
            'Repartidor: ${s.driverName} (${s.vehiclePlate}) • Precisión GPS: ${s.accuracy.toStringAsFixed(1)}m',
            style: const TextStyle(color: Colors.white54, fontSize: 10),
          ),
        ],
      ),
    );
  }

  Widget _buildVerificationCheckboxes() {
    return Column(
      children: [
        // Adult Checkbox
        CheckboxListTile(
          contentPadding: EdgeInsets.zero,
          value: _isAdultVerified,
          activeColor: LikoraColors.success,
          title: const Text(
            'Verificación de Mayoría de Edad (+18 Años)',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
          ),
          subtitle: const Text(
            'Confirmo haber verificado que la fecha de nacimiento del documento cumple con la ley para entrega de bebidas alcohólicas.',
            style: TextStyle(color: Colors.white54, fontSize: 10),
          ),
          onChanged: (val) {
            setState(() => _isAdultVerified = val ?? true);
          },
        ),
        const SizedBox(height: 8),

        // Notes Input
        TextField(
          controller: _notesCtrl,
          maxLines: 2,
          style: const TextStyle(color: Colors.white, fontSize: 12),
          decoration: InputDecoration(
            labelText: 'Observaciones / Notas de Entrega (Opcional)',
            labelStyle: const TextStyle(color: Colors.white54, fontSize: 11),
            filled: true,
            fillColor: const Color(0xFF1E1D2B),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
          ),
        ),
      ],
    );
  }
}
