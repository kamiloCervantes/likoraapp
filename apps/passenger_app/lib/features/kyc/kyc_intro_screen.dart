import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/app_routes.dart';

class KycIntroScreen extends StatelessWidget {
  const KycIntroScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Verificación de Edad'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 20),
              Center(
                child: Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.15),
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.primary, width: 2),
                  ),
                  child: const Icon(
                    Icons.verified_user_outlined,
                    size: 56,
                    color: AppColors.primaryLight,
                  ),
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                'Cumplimiento Legal +18',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              Text(
                'Para comprar bebidas alcohólicas y licores en Likora, la ley exige verificar tu documento oficial y mayoría de edad.',
                style: TextStyle(
                  fontSize: 15,
                  color: AppColors.textSecondary,
                  height: 1.4,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              _buildBenefitItem(
                Icons.security_outlined,
                'Protección de Datos Cifrada',
                'Tus documentos son protegidos con encriptación de grado militar AES-256.',
              ),
              const SizedBox(height: 16),
              _buildBenefitItem(
                Icons.flash_on_outlined,
                'Proceso Rápido (1 Minuto)',
                'Solo necesitas fotografiar tu DNI/Pasaporte y tomarte una selfie.',
              ),
              const SizedBox(height: 16),
              _buildBenefitItem(
                Icons.check_circle_outline,
                'Verificación Única',
                'Solo se realiza una vez y te habilitará compras inmediatas.',
              ),
              const Spacer(),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                onPressed: () {
                  Navigator.pushNamed(context, AppRoutes.kycForm);
                },
                child: const Text(
                  'Comenzar Verificación',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                ),
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBenefitItem(IconData icon, String title, String description) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: AppColors.primaryLight, size: 28),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 15)),
                const SizedBox(height: 4),
                Text(description, style: TextStyle(color: AppColors.textSecondary, fontSize: 13, height: 1.3)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
