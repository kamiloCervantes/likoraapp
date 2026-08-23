import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/app_routes.dart';
import '../../core/utils/currency_formatter.dart';
import '../../data/app_state.dart';
import '../../data/models/order_model.dart';

class OrderHistoryScreen extends StatelessWidget {
  const OrderHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final appState = AppStateProvider.of(context);
    final orders = appState.orders;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Historial de Pedidos'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: orders.isEmpty
          ? const Center(
              child: Text(
                'Aún no tienes pedidos registrados.',
                style: TextStyle(color: AppColors.textMuted),
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(20),
              itemCount: orders.length,
              itemBuilder: (context, index) {
                final order = orders[index];
                return Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.cardBg,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            order.id,
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                          _buildStatusBadge(order.status),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Fecha: ${order.orderDate}',
                        style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                      ),
                      const Divider(height: 20),
                      Text(
                        '${order.items.length} productos • Total: ${CurrencyFormatter.format(order.total)}',
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14),
                      ),
                      const SizedBox(height: 12),
                      if (order.status != OrderStatus.delivered)
                        ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            minimumSize: const Size(double.infinity, 40),
                          ),
                          icon: const Icon(Icons.delivery_dining_rounded, size: 18),
                          label: const Text('Seguir Pedido en Vivo', style: TextStyle(fontSize: 13)),
                          onPressed: () {
                            Navigator.pushNamed(context, AppRoutes.tracking);
                          },
                        ),
                    ],
                  ),
                );
              },
            ),
    );
  }

  Widget _buildStatusBadge(OrderStatus status) {
    Color bg = AppColors.primary.withOpacity(0.2);
    Color text = AppColors.primary;

    if (status == OrderStatus.delivered) {
      bg = AppColors.success.withOpacity(0.2);
      text = AppColors.success;
    } else if (status == OrderStatus.onTheWay) {
      bg = AppColors.accent.withOpacity(0.2);
      text = AppColors.accent;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        status.label,
        style: TextStyle(color: text, fontWeight: FontWeight.bold, fontSize: 11),
      ),
    );
  }
}
