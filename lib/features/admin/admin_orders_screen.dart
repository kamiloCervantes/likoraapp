import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/currency_formatter.dart';
import '../../data/app_state.dart';
import '../../data/models/order_model.dart';

class AdminOrdersScreen extends StatefulWidget {
  const AdminOrdersScreen({super.key});

  @override
  State<AdminOrdersScreen> createState() => _AdminOrdersScreenState();
}

class _AdminOrdersScreenState extends State<AdminOrdersScreen> {
  String _selectedFilter = 'Todos';

  final List<String> _filters = [
    'Todos',
    'Pendientes',
    'En Preparación',
    'Despachados',
    'Entregados',
  ];

  @override
  Widget build(BuildContext context) {
    final appState = AppStateProvider.of(context);
    final allOrders = appState.orders;

    final filteredOrders = allOrders.where((order) {
      if (_selectedFilter == 'Todos') return true;
      if (_selectedFilter == 'Pendientes') return order.status == OrderStatus.received;
      if (_selectedFilter == 'En Preparación') return order.status == OrderStatus.inPreparation;
      if (_selectedFilter == 'Despachados') return order.status == OrderStatus.onTheWay;
      if (_selectedFilter == 'Entregados') return order.status == OrderStatus.delivered;
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Administrador de Tienda'),
        actions: [
          IconButton(
            icon: const Icon(Icons.swap_horiz_rounded),
            tooltip: 'Cambiar a Cliente',
            onPressed: () => appState.toggleUserRole(),
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter Chips Row
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            child: Row(
              children: _filters.map((filter) {
                final isSelected = _selectedFilter == filter;
                return Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: FilterChip(
                    label: Text(filter),
                    selected: isSelected,
                    selectedColor: AppColors.accent,
                    backgroundColor: AppColors.cardBg,
                    labelStyle: TextStyle(
                      color: isSelected ? Colors.white : AppColors.textSecondary,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    ),
                    onSelected: (val) {
                      setState(() => _selectedFilter = filter);
                    },
                  ),
                );
              }).toList(),
            ),
          ),

          // Orders List
          Expanded(
            child: filteredOrders.isEmpty
                ? const Center(
                    child: Text(
                      'No hay pedidos bajo este filtro.',
                      style: TextStyle(color: AppColors.textMuted),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(20),
                    itemCount: filteredOrders.length,
                    itemBuilder: (context, index) {
                      final order = filteredOrders[index];
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
                                DropdownButton<OrderStatus>(
                                  value: order.status,
                                  dropdownColor: AppColors.surface,
                                  style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold),
                                  underline: const SizedBox(),
                                  icon: const Icon(Icons.arrow_drop_down, color: AppColors.primary),
                                  items: OrderStatus.values.map((st) {
                                    return DropdownMenuItem(
                                      value: st,
                                      child: Text(st.label, style: const TextStyle(fontSize: 13)),
                                    );
                                  }).toList(),
                                  onChanged: (newStatus) {
                                    if (newStatus != null) {
                                      appState.updateOrderStatus(order.id, newStatus);
                                    }
                                  },
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'Cliente: Sofia Ramirez • Fecha: ${order.orderDate}',
                              style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                            ),
                            Text(
                              'Dirección: ${order.shippingAddress}',
                              style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                            ),
                            const Divider(height: 20),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  '${order.items.length} Ítems',
                                  style: const TextStyle(color: Colors.white70),
                                ),
                                Text(
                                  CurrencyFormatter.format(order.total),
                                  style: const TextStyle(
                                    color: AppColors.primary,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
