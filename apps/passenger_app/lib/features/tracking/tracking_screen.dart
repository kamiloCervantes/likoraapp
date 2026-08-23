import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/app_routes.dart';
import '../../data/app_state.dart';
import '../../data/models/order_model.dart';

class TrackingScreen extends StatelessWidget {
  const TrackingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final appState = AppStateProvider.of(context);
    final activeOrder = appState.activeTrackedOrder ??
        OrderModel(
          id: 'ORD-9821',
          orderDate: '2026-08-07 10:15',
          items: [],
          subtotal: 36.00,
          tax: 5.76,
          shippingFee: 3.50,
          total: 45.26,
          shippingAddress: 'Av. Reforma #1234, Apt 4B, Ciudad de México',
          status: OrderStatus.onTheWay,
          deliveryPerson: DeliveryPersonModel(
            name: 'Carlos Mendoza',
            role: 'Repartidor',
            vehicle: 'Motocicleta',
            plateNumber: 'ABC-123',
            rating: 4.5,
            avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&q=80',
          ),
        );

    final driver = activeOrder.deliveryPerson;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Seguimiento del Pedido'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Column(
        children: [
          // Full Vector / Simulated Map Container
          Expanded(
            flex: 4,
            child: Stack(
              children: [
                // Simulated Map Graphic Background
                Container(
                  width: double.infinity,
                  decoration: const BoxDecoration(
                    color: Color(0xFF1E2638),
                    image: DecorationImage(
                      image: NetworkImage('https://maps.wikimedia.org/osm-intl/13/2411/3079.png'),
                      fit: BoxFit.cover,
                      opacity: 0.6,
                    ),
                  ),
                ),

                // Simulated Route Line & Marker
                Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primary.withOpacity(0.5),
                              blurRadius: 15,
                              spreadRadius: 5,
                            ),
                          ],
                        ),
                        child: const Icon(Icons.two_wheeler_rounded, color: Colors.white, size: 28),
                      ),
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.cardBg,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text(
                          'Carlos está a 8 minutos',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Bottom Sheet: Repartidor details & Order Status Stepper
          Expanded(
            flex: 6,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(24, 16, 24, 16),
              decoration: const BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Handle Bar
                    Center(
                      child: Container(
                        width: 40,
                        height: 4,
                        decoration: BoxDecoration(
                          color: AppColors.border,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Title
                    const Text(
                      'Información del Repartidor',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                    const SizedBox(height: 16),

                    // Driver info card (Carlos Mendoza)
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 28,
                          backgroundColor: AppColors.cardBg,
                          backgroundImage: driver?.avatarUrl != null && driver!.avatarUrl.isNotEmpty
                              ? NetworkImage(driver.avatarUrl)
                              : null,
                          child: driver?.avatarUrl == null || driver!.avatarUrl.isEmpty
                              ? const Icon(Icons.person, color: Colors.white)
                              : null,
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                driver?.name ?? 'Carlos Mendoza',
                                style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 16),
                              ),
                              Text(
                                driver?.role ?? 'Repartidor',
                                style: const TextStyle(color: AppColors.textMuted, fontSize: 13),
                              ),
                            ],
                          ),
                        ),
                        ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            minimumSize: const Size(110, 42),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          icon: const Icon(Icons.chat_bubble_outline_rounded, size: 18),
                          label: const Text('Chat'),
                          onPressed: () => Navigator.pushNamed(context, AppRoutes.chat),
                        ),
                      ],
                    ),

                    const SizedBox(height: 20),

                    // Driver metrics grid (Motocicleta, Placas, Rating)
                    Row(
                      children: [
                        Expanded(child: _buildMetricTile(Icons.two_wheeler_rounded, driver?.vehicle ?? 'Motocicleta', 'Vehículo')),
                        const SizedBox(width: 10),
                        Expanded(child: _buildMetricTile(Icons.badge_outlined, driver?.plateNumber ?? 'ABC-123', 'Placas')),
                        const SizedBox(width: 10),
                        Expanded(child: _buildMetricTile(Icons.star_rounded, '${driver?.rating ?? 4.5} estrellas', 'Ranking')),
                      ],
                    ),

                    const SizedBox(height: 24),

                    // Order Status Stepper
                    const Text(
                      'Estado del Pedido',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                    const SizedBox(height: 16),

                    _buildStepRow(
                      icon: Icons.check_circle_rounded,
                      title: 'Pedido Recibido',
                      isCompleted: true,
                      isActive: false,
                    ),
                    _buildStepLine(isCompleted: true),
                    _buildStepRow(
                      icon: Icons.local_shipping_rounded,
                      title: 'En Camino',
                      isCompleted: false,
                      isActive: true,
                    ),
                    _buildStepLine(isCompleted: false),
                    _buildStepRow(
                      icon: Icons.check_circle_outline_rounded,
                      title: 'Entregado',
                      isCompleted: false,
                      isActive: false,
                    ),

                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricTile(IconData icon, String title, String subtitle) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Icon(icon, color: AppColors.primary, size: 22),
          const SizedBox(height: 6),
          Text(
            title,
            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          Text(
            subtitle,
            style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
          ),
        ],
      ),
    );
  }

  Widget _buildStepRow({
    required IconData icon,
    required String title,
    required bool isCompleted,
    required bool isActive,
  }) {
    Color color = AppColors.textMuted;
    if (isCompleted) color = AppColors.success;
    if (isActive) color = AppColors.primary;

    return Row(
      children: [
        Icon(icon, color: color, size: 24),
        const SizedBox(width: 14),
        Text(
          title,
          style: TextStyle(
            color: isActive || isCompleted ? Colors.white : AppColors.textMuted,
            fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
            fontSize: 15,
          ),
        ),
      ],
    );
  }

  Widget _buildStepLine({required bool isCompleted}) {
    return Container(
      margin: const EdgeInsets.only(left: 11, top: 4, bottom: 4),
      width: 2,
      height: 20,
      color: isCompleted ? AppColors.success : AppColors.border,
    );
  }
}
