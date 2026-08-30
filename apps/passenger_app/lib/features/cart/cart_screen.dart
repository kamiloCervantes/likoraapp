import 'dart:convert';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/app_routes.dart';
import '../../core/services/api_client.dart';
import '../../data/app_state.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  bool _isCheckingKyc = false;

  Future<void> _handleCheckout(BuildContext context, AppState appState) async {
    setState(() => _isCheckingKyc = true);

    debugPrint('===============================================================');
    debugPrint('🛒 [CHECKOUT CLICK] Iniciando validación KYC para proceder al pago...');

    bool isKycVerified = false;
    Map<String, dynamic>? kycData;

    try {
      final res = await ApiClient.get('/kyc/status');
      if (res.statusCode == 200) {
        kycData = jsonDecode(res.body);
        final canPurchase = kycData?['can_purchase_alcohol'] == true;
        final kycStatus = kycData?['kyc_status'];
        isKycVerified = canPurchase || kycStatus == 'VERIFIED';
      }
    } catch (e) {
      debugPrint('⚠️ Excepción comprobando KYC: ');
    }

    if (!mounted) return;
    setState(() => _isCheckingKyc = false);

    if (isKycVerified) {
      Navigator.pushNamed(context, AppRoutes.checkout);
      return;
    }

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.shield_outlined, color: AppColors.warning, size: 28),
            SizedBox(width: 10),
            Expanded(
              child: Text('Verificación +18 Requerida', style: TextStyle(color: Colors.white, fontSize: 18)),
            ),
          ],
        ),
        content: const Text(
          'Por regulación legal, debes validar tu documento de identidad y mayoría de edad para completar pedidos de bebidas alcohólicas.',
          style: TextStyle(color: AppColors.textSecondary, fontSize: 14, height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancelar', style: TextStyle(color: AppColors.textSecondary)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            onPressed: () {
              Navigator.pop(ctx);
              Navigator.pushNamed(context, AppRoutes.kycIntro);
            },
            child: const Text('Verificar Ahora', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final appState = AppStateProvider.of(context);
    final cart = appState.cart;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Mi Carrito'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          if (cart.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.delete_sweep_rounded, color: AppColors.textSecondary),
              tooltip: 'Vaciar Carrito',
              onPressed: () => appState.clearCart(),
            ),
        ],
      ),
      body: cart.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.shopping_bag_outlined, size: 80, color: AppColors.textSecondary.withOpacity(0.5)),
                  const SizedBox(height: 16),
                  const Text('Tu carrito está vacío', style: TextStyle(fontSize: 18, color: Colors.white, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Text('Explora el catálogo y añade tus licores favoritos', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                ],
              ),
            )
          : Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: cart.length,
                    itemBuilder: (ctx, i) {
                      final item = cart[i];
                      final imgUrl = item.product.images.isNotEmpty
                          ? item.product.images.first
                          : 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?w=500&q=80';

                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.card,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Row(
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(8),
                              child: Image.network(imgUrl, width: 64, height: 64, fit: BoxFit.cover),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item.product.title,
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '\{item.product.effectivePrice.toStringAsFixed(2)} c/u',
                                    style: const TextStyle(color: AppColors.primaryHover, fontSize: 13),
                                  ),
                                  const SizedBox(height: 6),
                                  Row(
                                    children: [
                                      InkWell(
                                        onTap: () => appState.updateCartQuantity(item.product.id, item.quantity - 1),
                                        borderRadius: BorderRadius.circular(6),
                                        child: Container(
                                          padding: const EdgeInsets.all(4),
                                          decoration: BoxDecoration(
                                            color: AppColors.surface,
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          child: const Icon(Icons.remove, size: 16, color: Colors.white),
                                        ),
                                      ),
                                      Padding(
                                        padding: const EdgeInsets.symmetric(horizontal: 10),
                                        child: Text(
                                          '',
                                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                                        ),
                                      ),
                                      InkWell(
                                        onTap: () => appState.updateCartQuantity(item.product.id, item.quantity + 1),
                                        borderRadius: BorderRadius.circular(6),
                                        child: Container(
                                          padding: const EdgeInsets.all(4),
                                          decoration: BoxDecoration(
                                            color: AppColors.surface,
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          child: const Icon(Icons.add, size: 16, color: Colors.white),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.delete_outline, color: AppColors.error, size: 20),
                                  onPressed: () => appState.removeFromCart(item.product.id),
                                ),
                                Text(
                                  '\{item.totalPrice.toStringAsFixed(2)}',
                                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                    border: Border(top: BorderSide(color: AppColors.border)),
                  ),
                  child: Column(
                    children: [
                      // Subtotal
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Subtotal', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                          Text('\{appState.cartSubtotal.toStringAsFixed(2)}', style: const TextStyle(color: Colors.white, fontSize: 13)),
                        ],
                      ),
                      const SizedBox(height: 6),
                      // Tax (16%)
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('IVA (16%)', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                          Text('\{appState.cartTax.toStringAsFixed(2)}', style: const TextStyle(color: Colors.white, fontSize: 13)),
                        ],
                      ),
                      const SizedBox(height: 6),
                      // Delivery fee (.50)
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Costo de Envío', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                          Text('\{appState.cartShippingFee.toStringAsFixed(2)}', style: const TextStyle(color: Colors.white, fontSize: 13)),
                        ],
                      ),
                      const Divider(color: AppColors.border, height: 20),
                      // Total
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Total a Pagar:', style: TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.bold)),
                          Text('\{appState.cartTotal.toStringAsFixed(2)}', style: const TextStyle(color: AppColors.primaryHover, fontSize: 20, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                          onPressed: _isCheckingKyc ? null : () => _handleCheckout(context, appState),
                          child: _isCheckingKyc
                              ? const SizedBox(
                                  width: 22,
                                  height: 22,
                                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                                )
                              : const Text('Proceder al Pago', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }
}
