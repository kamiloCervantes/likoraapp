import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/app_routes.dart';
import '../../core/utils/currency_formatter.dart';
import '../../data/app_state.dart';
import '../../data/models/address_model.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _cardNumberController = TextEditingController(text: '4532 •••• •••• 8912');
  final _expiryController = TextEditingController(text: '12/28');
  final _cvcController = TextEditingController(text: '888');
  final _holderController = TextEditingController(text: 'Sofia Ramirez');

  bool _isProcessing = false;

  void _processStripePayment(AppState appState) async {
    final defaultAddr = appState.defaultAddress ??
        AddressModel(
          id: 'def',
          title: 'Casa',
          fullAddress: 'Av. Reforma #1234, Apt 4B',
          city: 'Ciudad de México',
        );

    setState(() => _isProcessing = true);

    // Show simulated Stripe processing dialog
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return Dialog(
          backgroundColor: AppColors.cardBg,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: const [
                CircularProgressIndicator(color: AppColors.primary),
                SizedBox(height: 20),
                Text(
                  'Procesando Pago Seguro (Stripe)',
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                  textAlign: TextAlign.center,
                ),
                SizedBox(height: 8),
                Text(
                  'Verificando credenciales de tarjeta...',
                  style: TextStyle(color: AppColors.textMuted, fontSize: 13),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        );
      },
    );

    // 2-second simulation
    await Future.delayed(const Duration(seconds: 2));

    if (mounted) {
      Navigator.pop(context); // Close dialog
      setState(() => _isProcessing = false);

      // Place order in app state
      appState.placeOrder(address: defaultAddr);

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('¡Pago Aprobado! Tu pedido ha sido registrado.'),
          backgroundColor: AppColors.success,
        ),
      );

      // Direct navigation to Tracking screen
      Navigator.pushReplacementNamed(context, AppRoutes.tracking);
    }
  }

  @override
  Widget build(BuildContext context) {
    final appState = AppStateProvider.of(context);
    final selectedAddress = appState.defaultAddress;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Resumen y Pago'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Shipping Address Section
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Dirección de Envío',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                TextButton(
                  onPressed: () => Navigator.pushNamed(context, AppRoutes.addresses),
                  child: const Text('Cambiar', style: TextStyle(color: AppColors.primary)),
                ),
              ],
            ),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                children: [
                  const Icon(Icons.location_on_rounded, color: AppColors.primary, size: 28),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          selectedAddress?.title ?? 'Casa',
                          style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 15),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          selectedAddress?.fullAddress ?? 'Av. Reforma #1234, Apt 4B',
                          style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Order Summary Breakdown
            const Text(
              'Resumen del Pedido',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                children: [
                  ...appState.cart.map((item) => Padding(
                        padding: const EdgeInsets.only(bottom: 8.0),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              '${item.quantity}x ${item.product.title}',
                              style: const TextStyle(color: Colors.white, fontSize: 14),
                            ),
                            Text(
                              CurrencyFormatter.format(item.totalPrice),
                              style: const TextStyle(color: AppColors.textSecondary, fontSize: 14),
                            ),
                          ],
                        ),
                      )),
                  const Divider(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total a pagar', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                      Text(
                        CurrencyFormatter.format(appState.cartTotal),
                        style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary, fontSize: 18),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 28),

            // Stripe Payment UI Simulation
            Row(
              children: const [
                Icon(Icons.lock_rounded, color: AppColors.success, size: 20),
                SizedBox(width: 8),
                Text(
                  'Pago Seguro con Stripe',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                ),
              ],
            ),
            const SizedBox(height: 14),

            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.primary.withOpacity(0.5)),
              ),
              child: Column(
                children: [
                  TextField(
                    controller: _holderController,
                    style: const TextStyle(color: Colors.white),
                    decoration: const InputDecoration(
                      labelText: 'Titular de la Tarjeta',
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _cardNumberController,
                    style: const TextStyle(color: Colors.white),
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Número de Tarjeta',
                      suffixIcon: Icon(Icons.credit_card_rounded, color: AppColors.textMuted),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _expiryController,
                          style: const TextStyle(color: Colors.white),
                          decoration: const InputDecoration(
                            labelText: 'MM/AA',
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextField(
                          controller: _cvcController,
                          obscureText: true,
                          style: const TextStyle(color: Colors.white),
                          decoration: const InputDecoration(
                            labelText: 'CVC',
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 32),

            // Pay Now Button
            ElevatedButton(
              onPressed: _isProcessing ? null : () => _processStripePayment(appState),
              child: Text(_isProcessing ? 'Procesando...' : 'Pagar ${CurrencyFormatter.format(appState.cartTotal)}'),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}
