import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'core/constants/app_routes.dart';
import 'data/app_state.dart';
import 'data/models/category_model.dart';
import 'data/models/product_model.dart';
import 'features/auth/login_screen.dart';
import 'features/auth/register_screen.dart';
import 'features/main_navigation_screen.dart';
import 'features/categories/category_detail_screen.dart';
import 'features/product_detail/product_detail_screen.dart';
import 'features/cart/cart_screen.dart';
import 'features/checkout/checkout_screen.dart';
import 'features/tracking/tracking_screen.dart';
import 'features/chat/chat_screen.dart';
import 'features/profile/addresses_screen.dart';
import 'features/profile/order_history_screen.dart';
import 'features/offers/offers_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const LikoraApp());
}

class LikoraApp extends StatefulWidget {
  const LikoraApp({super.key});

  @override
  State<LikoraApp> createState() => _LikoraAppState();
}

class _LikoraAppState extends State<LikoraApp> {
  final AppState _appState = AppState();

  @override
  Widget build(BuildContext context) {
    return AppStateProvider(
      state: _appState,
      child: MaterialApp(
        title: 'LikoraApp',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.darkTheme,
        initialRoute: AppRoutes.login,
        routes: {
          AppRoutes.login: (context) => const LoginScreen(),
          AppRoutes.register: (context) => const RegisterScreen(),
          AppRoutes.mainNav: (context) => const MainNavigationScreen(),
          AppRoutes.cart: (context) => const CartScreen(),
          AppRoutes.checkout: (context) => const CheckoutScreen(),
          AppRoutes.tracking: (context) => const TrackingScreen(),
          AppRoutes.chat: (context) => const ChatScreen(),
          AppRoutes.addresses: (context) => const AddressesScreen(),
          AppRoutes.orderHistory: (context) => const OrderHistoryScreen(),
          AppRoutes.offers: (context) => const OffersScreen(),
        },
        onGenerateRoute: (settings) {
          if (settings.name == AppRoutes.categoryDetail) {
            final args = settings.arguments as Map<String, dynamic>;
            final category = args['category'] as CategoryModel;
            final subId = args['selectedSubcategoryId'] as String?;
            return MaterialPageRoute(
              builder: (context) => CategoryDetailScreen(
                category: category,
                initialSubcategoryId: subId,
              ),
            );
          } else if (settings.name == AppRoutes.productDetail) {
            final product = settings.arguments as ProductModel;
            return MaterialPageRoute(
              builder: (context) => ProductDetailScreen(product: product),
            );
          }
          return null;
        },
      ),
    );
  }
}
