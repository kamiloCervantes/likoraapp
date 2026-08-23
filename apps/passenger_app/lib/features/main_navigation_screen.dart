import 'package:flutter/material.dart';
import '../core/theme/app_colors.dart';
import '../core/constants/app_routes.dart';
import '../data/app_state.dart';
import '../data/models/user_model.dart';
import 'home/home_screen.dart';
import 'categories/categories_screen.dart';
import 'offers/offers_screen.dart';
import 'cart/cart_screen.dart';
import 'profile/profile_screen.dart';
import 'admin/admin_orders_screen.dart';

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  final List<Widget> _screens = const [
    HomeScreen(),
    CategoriesScreen(),
    OffersScreen(),
    CartScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final appState = AppStateProvider.of(context);

    if (appState.isLoading) {
      return const Scaffold(
        backgroundColor: AppColors.background,
        body: Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        ),
      );
    }

    final isStoreAdmin = appState.currentUser?.role == UserRole.storeAdmin;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: isStoreAdmin
          ? const AdminOrdersScreen()
          : IndexedStack(
              index: appState.currentNavIndex,
              children: _screens,
            ),
      bottomNavigationBar: isStoreAdmin
          ? Container(
              color: AppColors.surface,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: SafeArea(
                child: Row(
                  children: [
                    const Icon(Icons.admin_panel_settings, color: AppColors.accent),
                    const SizedBox(width: 8),
                    const Expanded(
                      child: Text(
                        'Modo Administrador de Tienda',
                        style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                    ),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        minimumSize: const Size(110, 38),
                      ),
                      onPressed: () => appState.toggleUserRole(),
                      child: const Text('Ir a Cliente', style: TextStyle(fontSize: 12)),
                    ),
                  ],
                ),
              ),
            )
          : BottomNavigationBar(
              currentIndex: appState.currentNavIndex,
              onTap: (index) => appState.setNavIndex(index),
              type: BottomNavigationBarType.fixed,
              backgroundColor: AppColors.surface,
              selectedItemColor: AppColors.textPrimary,
              unselectedItemColor: AppColors.textMuted,
              items: [
                const BottomNavigationBarItem(
                  icon: Icon(Icons.home_outlined),
                  activeIcon: Icon(Icons.home, color: AppColors.primary),
                  label: 'Inicio',
                ),
                const BottomNavigationBarItem(
                  icon: Icon(Icons.grid_view_outlined),
                  activeIcon: Icon(Icons.grid_view, color: AppColors.primary),
                  label: 'Categorías',
                ),
                const BottomNavigationBarItem(
                  icon: Icon(Icons.percent_outlined),
                  activeIcon: Icon(Icons.percent, color: AppColors.primary),
                  label: 'Ofertas',
                ),
                BottomNavigationBarItem(
                  icon: Badge(
                    label: Text('${appState.cart.length}'),
                    isLabelVisible: appState.cart.isNotEmpty,
                    backgroundColor: AppColors.primary,
                    child: const Icon(Icons.shopping_cart_outlined),
                  ),
                  activeIcon: Badge(
                    label: Text('${appState.cart.length}'),
                    isLabelVisible: appState.cart.isNotEmpty,
                    backgroundColor: AppColors.primary,
                    child: const Icon(Icons.shopping_cart, color: AppColors.primary),
                  ),
                  label: 'Carrito',
                ),
                const BottomNavigationBarItem(
                  icon: Icon(Icons.person_outline),
                  activeIcon: Icon(Icons.person, color: AppColors.primary),
                  label: 'Perfil',
                ),
              ],
            ),
    );
  }
}
