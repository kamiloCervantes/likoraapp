import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/app_routes.dart';
import '../../data/app_state.dart';
import '../auth/auth_repository.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  Future<void> _handleLogout(BuildContext context, AppState appState) async {
    final authRepo = AuthRepository();
    await authRepo.logout();
    appState.currentUser = null;

    if (!context.mounted) return;
    Navigator.pushNamedAndRemoveUntil(context, AppRoutes.login, (route) => false);
  }

  @override
  Widget build(BuildContext context) {
    final appState = AppStateProvider.of(context);
    final user = appState.currentUser;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Mi Perfil'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: [
            // User Avatar and Name display
            CircleAvatar(
              radius: 50,
              backgroundColor: AppColors.primary,
              backgroundImage: user?.avatarUrl != null && user!.avatarUrl!.isNotEmpty
                  ? NetworkImage(user.avatarUrl!)
                  : null,
              child: user?.avatarUrl == null || user!.avatarUrl!.isEmpty
                  ? const Icon(Icons.person, size: 50, color: Colors.white)
                  : null,
            ),
            const SizedBox(height: 14),

            Text(
              user?.name ?? 'Usuario Likora',
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              user?.email ?? '',
              style: const TextStyle(
                color: AppColors.textSecondary,
                fontSize: 14,
              ),
            ),

            const SizedBox(height: 32),

            // Account section header
            const Align(
              alignment: Alignment.centerLeft,
              child: Text(
                'Cuenta',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Menu Items List (Mis Direcciones, Historial, Tienda Preferida, Cambiar Contraseña, Eliminar Cuenta)
            _buildProfileMenuItem(
              icon: Icons.location_on_outlined,
              title: 'Mis Direcciones',
              onTap: () => Navigator.pushNamed(context, AppRoutes.addresses),
            ),
            _buildProfileMenuItem(
              icon: Icons.history_rounded,
              title: 'Historial de Pedidos',
              onTap: () => Navigator.pushNamed(context, AppRoutes.orderHistory),
            ),
            _buildProfileMenuItem(
              icon: Icons.storefront_outlined,
              title: 'Tienda Preferida',
              subtitle: user?.preferredStore,
              onTap: () => _showStoreSelector(context, appState),
            ),
            _buildProfileMenuItem(
              icon: Icons.lock_outline_rounded,
              title: 'Cambiar Contraseña',
              onTap: () => _showChangePasswordDialog(context),
            ),
            _buildProfileMenuItem(
              icon: Icons.delete_outline_rounded,
              title: 'Eliminar Cuenta',
              isDestructive: true,
              onTap: () => _showDeleteAccountDialog(context),
            ),

            const SizedBox(height: 20),

            // Logout Button
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.cardBg,
                foregroundColor: AppColors.error,
                side: const BorderSide(color: AppColors.border),
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
              ),
              icon: const Icon(Icons.logout_rounded),
              label: const Text('Cerrar Sesión', style: TextStyle(fontWeight: FontWeight.bold)),
              onPressed: () => _handleLogout(context, appState),
            ),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileMenuItem({
    required IconData icon,
    required String title,
    String? subtitle,
    required VoidCallback onTap,
    bool isDestructive = false,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: ListTile(
        onTap: onTap,
        leading: Icon(icon, color: isDestructive ? AppColors.error : AppColors.primary),
        title: Text(
          title,
          style: TextStyle(
            color: isDestructive ? AppColors.error : Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 15,
          ),
        ),
        subtitle: subtitle != null
            ? Text(subtitle, style: const TextStyle(color: AppColors.textMuted, fontSize: 12))
            : null,
        trailing: Icon(
          Icons.arrow_forward_rounded,
          color: isDestructive ? AppColors.error : AppColors.textMuted,
          size: 20,
        ),
      ),
    );
  }

  void _showStoreSelector(BuildContext context, AppState appState) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.cardBg,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) {
        final stores = [
          'Likora Central - Av. Principal #45-12',
          'Likora Norte - Calle 100 #15-30',
          'Likora Sur - Plaza Comercial Las Palmas',
        ];
        return Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Selecciona tu Tienda Preferida',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              const SizedBox(height: 16),
              ...stores.map((store) => ListTile(
                    title: Text(store, style: const TextStyle(color: Colors.white)),
                    leading: Icon(
                      Icons.store_rounded,
                      color: appState.currentUser?.preferredStore == store ? AppColors.primary : AppColors.textMuted,
                    ),
                    onTap: () {
                      appState.updatePreferredStore(store);
                      Navigator.pop(context);
                    },
                  )),
            ],
          ),
        );
      },
    );
  }

  void _showChangePasswordDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.cardBg,
        title: const Text('Cambiar Contraseña', style: TextStyle(color: Colors.white)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: const [
            TextField(
              obscureText: true,
              style: TextStyle(color: Colors.white),
              decoration: InputDecoration(hintText: 'Contraseña Actual'),
            ),
            SizedBox(height: 12),
            TextField(
              obscureText: true,
              style: TextStyle(color: Colors.white),
              decoration: InputDecoration(hintText: 'Nueva Contraseña'),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Contraseña actualizada'), backgroundColor: AppColors.success),
              );
            },
            child: const Text('Guardar'),
          ),
        ],
      ),
    );
  }

  void _showDeleteAccountDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.cardBg,
        title: const Text('¿Eliminar Cuenta?', style: TextStyle(color: AppColors.error)),
        content: const Text(
          'Esta acción es irreversible y borrará tu historial de pedidos y direcciones.',
          style: TextStyle(color: AppColors.textSecondary),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancelar')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            onPressed: () {
              Navigator.pop(context);
              Navigator.pushReplacementNamed(context, AppRoutes.login);
            },
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );
  }
}
