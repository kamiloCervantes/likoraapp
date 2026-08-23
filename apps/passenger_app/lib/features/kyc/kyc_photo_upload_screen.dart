import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/app_routes.dart';
import '../../data/app_state.dart';
import 'kyc_repository.dart';
import 'package:core_models/core_models.dart';

class KycPhotoUploadScreen extends StatefulWidget {
  final Map<String, dynamic> formData;

  const KycPhotoUploadScreen({super.key, required this.formData});

  @override
  State<KycPhotoUploadScreen> createState() => _KycPhotoUploadScreenState();
}

class _KycPhotoUploadScreenState extends State<KycPhotoUploadScreen> {
  final KycRepository _kycRepo = KycRepository();
  bool _frontUploaded = false;
  bool _backUploaded = false;
  bool _selfieUploaded = false;
  bool _isSubmitting = false;

  DocumentType get _docType => widget.formData['docType'] as DocumentType;
  bool get _needsBackImage => _docType != DocumentType.passport;

  bool get _canSubmit =>
      _frontUploaded && (_needsBackImage ? _backUploaded : true) && _selfieUploaded;

  Future<void> _simulateCapture(String type) async {
    // Simula captura de cámara y subida a URL prefirmada
    setState(() {
      if (type == 'front') _frontUploaded = true;
      if (type == 'back') _backUploaded = true;
      if (type == 'selfie') _selfieUploaded = true;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Foto $type cargada y validada')),
    );
  }

  Future<void> _submitAll() async {
    setState(() => _isSubmitting = true);

    final urls = await _kycRepo.requestUploadUrls(_docType);
    final sessionId = urls['verification_session_id'];

    final res = await _kycRepo.submitVerification(
      sessionId: sessionId,
      docType: _docType,
      docNumber: widget.formData['docNumber'],
      birthDate: widget.formData['birthDate'],
      frontKey: urls['upload_urls']['front']['key'],
      backKey: _needsBackImage ? urls['upload_urls']['back']['key'] : null,
      selfieKey: urls['upload_urls']['selfie']['key'],
    );

    setState(() => _isSubmitting = false);

    if (res['success']) {
      // Actualizar estado local en AppState
      final appState = AppStateProvider.of(context);
      if (appState.currentUser != null) {
        // Actualiza el estado local de KYC
      }

      Navigator.pushNamedAndRemoveUntil(
        context,
        AppRoutes.kycStatus,
        (route) => route.isFirst,
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(res['error'] ?? 'Error al enviar verificación')),
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
            Text(
              'Asegúrate de que los textos sean legibles y sin reflejos',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
            ),
            const SizedBox(height: 24),
            _buildPhotoCard(
              title: 'Foto Frontal del Documento',
              subtitle: 'Muestra la cara del documento con tu foto y datos',
              isUploaded: _frontUploaded,
              onTap: () => _simulateCapture('front'),
            ),
            if (_needsBackImage) ...[
              const SizedBox(height: 16),
              _buildPhotoCard(
                title: 'Foto Posterior / Reverso',
                subtitle: 'Muestra la parte trasera de tu documento',
                isUploaded: _backUploaded,
                onTap: () => _simulateCapture('back'),
              ),
            ],
            const SizedBox(height: 16),
            _buildPhotoCard(
              title: 'Selfie con Prueba de Vida',
              subtitle: 'Tómate una selfie con rostro visible y bien iluminado',
              isUploaded: _selfieUploaded,
              icon: Icons.face_outlined,
              onTap: () => _simulateCapture('selfie'),
            ),
            const SizedBox(height: 32),
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
                  : const Text('Enviar Verificación', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPhotoCard({
    required String title,
    required String subtitle,
    required bool isUploaded,
    IconData icon = Icons.camera_alt_outlined,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isUploaded ? AppColors.success : Colors.white.withOpacity(0.1),
            width: isUploaded ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                color: isUploaded ? AppColors.success.withOpacity(0.15) : AppColors.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                isUploaded ? Icons.check_circle : icon,
                color: isUploaded ? AppColors.success : AppColors.primaryLight,
                size: 26,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 15)),
                  const SizedBox(height: 4),
                  Text(subtitle, style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                ],
              ),
            ),
            Icon(Icons.chevron_right, color: AppColors.textSecondary),
          ],
        ),
      ),
    );
  }
}
