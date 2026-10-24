import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/app_routes.dart';
import '../../core/utils/currency_formatter.dart';
import '../../data/app_state.dart';
import '../../data/models/address_model.dart';
import '../profile/widgets/address_selector_bottom_sheet.dart';
import 'stripe_service.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _cardNumberController = TextEditingController(text: '4242 4242 4242 4242');
  final _expiryController = TextEditingController(text: '12/28');
  final _cvcController = TextEditingController(text: '888');
  final _holderController = TextEditingController(text: 'Sofia Ramirez');

  bool _isProcessing = false;
  StripeConfig? _stripeConfig;
  bool _isLoadingConfig = true;
  String _detectedBrand = 'Visa';

  @override
  void initState() {
    super.initState();
    _fetchStripeConfig();
    _cardNumberController.addListener(_detectCardBrand);
  }

  @override
  void dispose() {
    _cardNumberController.removeListener(_detectCardBrand);
    _cardNumberController.dispose();
    _expiryController.dispose();
    _cvcController.dispose();
    _holderController.dispose();
    super.dispose();
  }

  void _detectCardBrand() {
    final clean = _cardNumberController.text.replaceAll(' ', '');
    String brand = 'Visa';
    if (clean.startsWith('5')) {
      brand = 'Mastercard';
    } else if (clean.startsWith('34') || clean.startsWith('37')) {
      brand = 'American Express';
    } else if (clean.startsWith('4')) {
      brand = 'Visa';
    } else {
      brand = 'Tarjeta';
    }

    if (brand != _detectedBrand) {
      setState(() => _detectedBrand = brand);
    }
  }

  Future<void> _fetchStripeConfig() async {
    final config = await StripeService.getConfig();
    if (mounted) {
      setState(() {
        _stripeConfig = config;
        _isLoadingConfig = false;
      });
    }
  }

  void _applyTestCard(String number, String exp, String cvc, String holder) {
    setState(() {
      _cardNumberController.text = number;
      _expiryController.text = exp;
      _cvcController.text = cvc;
      _holderController.text = holder;
    });
  }

  Future<void> _processStripePayment(AppState appState) async {
    if (_stripeConfig != null && !_stripeConfig!.isActive) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('La pasarela de pagos Stripe se encuentra actualmente en mantenimiento.'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    final defaultAddr = appState.defaultAddress ??
        AddressModel(
          id: 'def',
          title: 'Casa',
          fullAddress: 'Av. Reforma #1234, Apt 4B',
          city: 'Ciudad de México',
        );

    final cleanCard = _cardNumberController.text.replaceAll(' ', '');
    final last4 = cleanCard.length >= 4 ? cleanCard.substring(cleanCard.length - 4) : '4242';

    setState(() => _isProcessing = true);

    // Dialog state controllers
    String currentStep = '1/2: Creando PaymentIntent en Stripe...';
    bool stepCompleted = false;
    String? intentId;

    // Show real-time multi-step Stripe modal
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return Dialog(
              backgroundColor: AppColors.cardBg,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (!stepCompleted)
                      const SizedBox(
                        width: 48,
                        height: 48,
                        child: CircularProgressIndicator(
                          color: Color(0xFF635BFF), // Stripe brand purple
                          strokeWidth: 3.5,
                        ),
                      )
                    else
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.success.withOpacity(0.15),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.check_circle_rounded, color: AppColors.success, size: 48),
                      ),
                    const SizedBox(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Icon(Icons.lock_rounded, color: Color(0xFF635BFF), size: 18),
                        SizedBox(width: 6),
                        Text(
                          'Stripe Checkout Seguro',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Text(
                      currentStep,
                      style: TextStyle(
                        color: stepCompleted ? AppColors.success : AppColors.textSecondary,
                        fontSize: 13,
                        fontWeight: stepCompleted ? FontWeight.bold : FontWeight.normal,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    if (intentId != null) ...[
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.06),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          'Intent ID: $intentId',
                          style: const TextStyle(color: AppColors.textMuted, fontSize: 11, fontFamily: 'monospace'),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            );
          },
        );
      },
    );

    try {
      // STEP 1: Create Payment Intent on backend
      final intentResult = await StripeService.createPaymentIntent(
        amount: appState.cartTotal,
        currency: _stripeConfig?.currency ?? 'USD',
        customerEmail: appState.currentUser?.email ?? 'cliente@likora.app',
        metadata: {
          'items_count': appState.cart.length,
          'customer_name': _holderController.text,
          'address': defaultAddr.fullAddress,
        },
      );

      if (!intentResult.success) {
        if (mounted) Navigator.pop(context); // Close dialog
        setState(() => _isProcessing = false);
        _showError(intentResult.errorMessage ?? 'Error al iniciar pago en Stripe.');
        return;
      }

      intentId = intentResult.paymentIntentId;

      // Small delay for UX transition
      await Future.delayed(const Duration(milliseconds: 600));

      // STEP 2: Confirm Payment Intent with Card details
      final confirmResult = await StripeService.confirmPayment(
        paymentIntentId: intentResult.paymentIntentId!,
        cardLast4: last4,
        brand: _detectedBrand,
        customerName: _holderController.text,
      );

      if (!confirmResult.success) {
        if (mounted) Navigator.pop(context); // Close dialog
        setState(() => _isProcessing = false);
        _showError(confirmResult.errorMessage ?? 'Tarjeta rechazada por Stripe.');
        return;
      }

      // STEP 3: Payment approved
      stepCompleted = true;
      currentStep = '¡Pago Aprobado y Registrado en Stripe!';

      await Future.delayed(const Duration(milliseconds: 1000));

      if (mounted) {
        Navigator.pop(context); // Close dialog
        setState(() => _isProcessing = false);

        // Record order in AppState
        appState.placeOrder(address: defaultAddr);

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.check_circle_rounded, color: Colors.white),
                const SizedBox(width: 10),
                Expanded(
                  child: Text('¡Pago de \$${appState.cartTotal.toStringAsFixed(2)} aprobado por Stripe! Pedido creado.'),
                ),
              ],
            ),
            backgroundColor: AppColors.success,
            duration: const Duration(seconds: 3),
          ),
        );

        // Immediate transition to Driver GPS Live Tracking screen!
        Navigator.pushReplacementNamed(context, AppRoutes.tracking);
      }
    } catch (e) {
      if (mounted) Navigator.pop(context);
      setState(() => _isProcessing = false);
      _showError('Excepción inesperada al procesar el pago: $e');
    }
  }

  void _showError(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppColors.error,
        duration: const Duration(seconds: 4),
      ),
    );
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
                  onPressed: () => AddressSelectorBottomSheet.show(context),
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

            // Stripe Gateway Header & Badges
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: const [
                    Icon(Icons.shield_rounded, color: Color(0xFF635BFF), size: 22),
                    SizedBox(width: 8),
                    Text(
                      'Pago Seguro con Stripe',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF635BFF).withOpacity(0.15),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFF635BFF).withOpacity(0.4)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.bolt_rounded, color: Color(0xFF635BFF), size: 14),
                      const SizedBox(width: 3),
                      Text(
                        _stripeConfig?.isLiveMode == true ? 'Live' : 'Sandbox Test',
                        style: const TextStyle(
                          color: Color(0xFF635BFF),
                          fontWeight: FontWeight.bold,
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              'Las credenciales del API son gestionadas desde el panel de control administrativo.',
              style: TextStyle(color: AppColors.textMuted, fontSize: 12),
            ),
            const SizedBox(height: 14),

            // Card Form Container
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF635BFF).withOpacity(0.4)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  TextField(
                    controller: _holderController,
                    style: const TextStyle(color: Colors.white),
                    decoration: const InputDecoration(
                      labelText: 'Titular de la Tarjeta',
                      prefixIcon: Icon(Icons.person_outline_rounded, color: AppColors.textMuted),
                    ),
                  ),
                  const SizedBox(height: 14),
                  TextField(
                    controller: _cardNumberController,
                    style: const TextStyle(color: Colors.white, fontFamily: 'monospace', letterSpacing: 1.2),
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(
                      labelText: 'Número de Tarjeta',
                      prefixIcon: const Icon(Icons.credit_card_rounded, color: AppColors.textMuted),
                      suffixIcon: Padding(
                        padding: const EdgeInsets.only(right: 12.0),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFF635BFF).withOpacity(0.2),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                _detectedBrand,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 11,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _expiryController,
                          style: const TextStyle(color: Colors.white, fontFamily: 'monospace'),
                          decoration: const InputDecoration(
                            labelText: 'MM/AA',
                            prefixIcon: Icon(Icons.calendar_month_outlined, color: AppColors.textMuted),
                          ),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: TextField(
                          controller: _cvcController,
                          obscureText: true,
                          style: const TextStyle(color: Colors.white, fontFamily: 'monospace'),
                          decoration: const InputDecoration(
                            labelText: 'CVC / CVV',
                            prefixIcon: Icon(Icons.lock_outline_rounded, color: AppColors.textMuted),
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // Quick test card presets for development / review
                  const Text(
                    'Tarjetas de Prueba Rápidas (Stripe):',
                    style: TextStyle(color: AppColors.textMuted, fontSize: 11, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 6,
                    children: [
                      ActionChip(
                        backgroundColor: Colors.white.withOpacity(0.06),
                        label: const Text('Visa 4242 (Éxito)', style: TextStyle(color: Colors.white, fontSize: 11)),
                        onPressed: () => _applyTestCard('4242 4242 4242 4242', '12/28', '888', 'Sofia Ramirez'),
                      ),
                      ActionChip(
                        backgroundColor: Colors.white.withOpacity(0.06),
                        label: const Text('Mastercard 5555', style: TextStyle(color: Colors.white, fontSize: 11)),
                        onPressed: () => _applyTestCard('5555 5555 5555 4444', '11/27', '777', 'Carlos Gomez'),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Security Notice
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: const [
                Icon(Icons.lock_rounded, color: AppColors.textMuted, size: 14),
                SizedBox(width: 6),
                Text(
                  'Transacción cifrada de extremo a extremo con Stripe SSL',
                  style: TextStyle(color: AppColors.textMuted, fontSize: 11),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // Pay Button
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF635BFF), // Stripe signature color
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              onPressed: (_isProcessing || (_stripeConfig != null && !_stripeConfig!.isActive))
                  ? null
                  : () => _processStripePayment(appState),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (_isProcessing)
                    const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                    )
                  else
                    const Icon(Icons.payment_rounded, color: Colors.white, size: 20),
                  const SizedBox(width: 10),
                  Text(
                    _isProcessing
                      ? 'Procesando con Stripe...'
                      : 'Pagar con Stripe (${CurrencyFormatter.format(appState.cartTotal)})',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
