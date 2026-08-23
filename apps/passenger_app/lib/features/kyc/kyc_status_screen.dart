import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/app_routes.dart';

class KycStatusScreen extends StatelessWidget {
  final String status; // PENDING_REVIEW, VERIFIED, REJECTED
  final String? rejectionReason;

  const KycStatusScreen({
    super.key,
    this.status = 'PENDING_REVIEW',
    this.rejectionReason,
  });

  @override
  Widget build(BuildContext context) {
    final isVerified = status == 'VERIFIED';
    final isRejected = status == 'REJECTED';
    final isPending = status == 'PENDING_REVIEW';

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Estado de Verificación'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Spacer(),
              Center(
                child: Container(
                  width: 110,
                  height: 110,
                  decoration: BoxDecoration(
                    color: isVerified
                        ? AppColors.success.withOpacity(0.15)
                        : (isRejected ? AppColors.error.withOpacity(0.15) : AppColors.warning.withOpacity(0.15)),
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: isVerified ? AppColors.success : (isRejected ? AppColors.error : AppColors.warning),
                      width: 2.5,
                    ),
                  ),
                  child: Icon(
                    isVerified ? Icons.verified : (isRejected ? Icons.cancel_outlined : Icons.hourglass_top_rounded),
                    size: 60,
                    color: isVerified ? AppColors.success : (isRejected ? AppColors.error : AppColors.warning),
                  ),
                ),
              ),
              const SizedBox(height: 28),
              Text(
                isVerified
                    ? '¡Identidad Verificada!'
                    : (isRejected ? 'Verificación Rechazada' : 'Verificación en Proceso'),
                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              Text(
                isVerified
                    ? 'Cumples con todos los requisitos legales. Ya puedes comprar y recibir bebidas alcohólicas.'
                    : (isRejected
                        ? (rejectionReason ?? 'Tu documento no pudo ser validado. Por favor intenta nuevamente con fotos nítidas.')
                        : 'Nuestro equipo está revisando tu documento. Este proceso toma normalmente menos de 10 minutos.'),
                style: TextStyle(fontSize: 15, color: AppColors.textSecondary, height: 1.4),
                textAlign: TextAlign.center,
              ),
              const Spacer(),
              if (isRejected)
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  onPressed: () {
                    Navigator.pushReplacementNamed(context, AppRoutes.kycForm);
                  },
                  child: const Text('Reintentar Verificación', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                ),
              if (isVerified || isPending)
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  onPressed: () {
                    Navigator.pushNamedAndRemoveUntil(context, AppRoutes.mainNav, (r) => false);
                  },
                  child: const Text('Ir a la Tienda', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
