import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/app_routes.dart';
import '../../core/utils/validators.dart';
import '../../data/app_state.dart';
import '../../data/models/user_model.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController(text: 'sofia.ramirez@email.com');
  final _passwordController = TextEditingController(text: '123456');

  void _handleLogin(AppState appState) {
    if (_formKey.currentState?.validate() ?? false) {
      // Update local state and navigate
      Navigator.pushReplacementNamed(context, AppRoutes.mainNav);
    }
  }

  @override
  Widget build(BuildContext context) {
    final appState = AppStateProvider.of(context);
    final isStoreAdmin = appState.currentUser?.role == UserRole.storeAdmin;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const SizedBox(height: 30),

                // Likora Brand Logo
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: LinearGradient(
                          colors: [AppColors.accent, AppColors.primary],
                          begin: Alignment.topRight,
                          end: Alignment.bottomLeft,
                        ),
                      ),
                      child: const Icon(
                        Icons.local_fire_department_rounded,
                        color: Colors.white,
                        size: 30,
                      ),
                    ),
                    const SizedBox(width: 12),
                    const Text(
                      'Likora',
                      style: TextStyle(
                        fontSize: 36,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        letterSpacing: -0.5,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 36),

                // Title
                Text(
                  isStoreAdmin ? 'Iniciar Sesión (Admin Tienda)' : 'Iniciar Sesión',
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 28),

                // Email Input
                TextFormField(
                  controller: _emailController,
                  validator: Validators.email,
                  style: const TextStyle(color: Colors.white),
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(
                    hintText: 'Correo Electrónico',
                  ),
                ),
                const SizedBox(height: 16),

                // Password Input
                TextFormField(
                  controller: _passwordController,
                  validator: Validators.password,
                  obscureText: true,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(
                    hintText: 'Contraseña',
                  ),
                ),
                const SizedBox(height: 24),

                // Login Button
                ElevatedButton(
                  onPressed: () => _handleLogin(appState),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: isStoreAdmin ? AppColors.accent : AppColors.primary,
                  ),
                  child: Text(
                    isStoreAdmin ? 'Iniciar Sesión como Admin' : 'Iniciar Sesión',
                  ),
                ),
                const SizedBox(height: 16),

                // Forgot Password Link
                TextButton(
                  onPressed: () {},
                  child: const Text(
                    '¿Olvidaste tu contraseña?',
                    style: TextStyle(
                      color: AppColors.textSecondary,
                      decoration: TextDecoration.underline,
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Social Auth Divider Label
                const Text(
                  'O iniciar sesión con',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 20),

                // Social Buttons Grid (Google, Facebook, Microsoft, Apple)
                Row(
                  children: [
                    Expanded(child: _buildSocialButton('Google', Icons.g_mobiledata_rounded)),
                    const SizedBox(width: 16),
                    Expanded(child: _buildSocialButton('Facebook', Icons.facebook)),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(child: _buildSocialButton('Microsoft', Icons.window_rounded)),
                    const SizedBox(width: 16),
                    Expanded(child: _buildSocialButton('Apple', Icons.apple)),
                  ],
                ),
                const SizedBox(height: 32),

                // Role Switcher Simulation Chip
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                        'Simular Rol: ',
                        style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                      ),
                      ChoiceChip(
                        label: const Text('Cliente'),
                        selected: !isStoreAdmin,
                        onSelected: (val) {
                          if (val) appState.setUserRole(UserRole.client);
                        },
                      ),
                      const SizedBox(width: 8),
                      ChoiceChip(
                        label: const Text('Admin Tienda'),
                        selected: isStoreAdmin,
                        onSelected: (val) {
                          if (val) appState.setUserRole(UserRole.storeAdmin);
                        },
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Register Navigation Link
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text(
                      '¿No tienes cuenta? ',
                      style: TextStyle(color: AppColors.textMuted),
                    ),
                    GestureDetector(
                      onTap: () => Navigator.pushNamed(context, AppRoutes.register),
                      child: const Text(
                        'Crear Cuenta',
                        style: TextStyle(
                          color: AppColors.textSecondary,
                          fontWeight: FontWeight.bold,
                          decoration: TextDecoration.underline,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSocialButton(String label, IconData icon) {
    return InkWell(
      onTap: () {
        // Mock social auth trigger
        Navigator.pushReplacementNamed(context, AppRoutes.mainNav);
      },
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: AppColors.socialButton,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: Colors.white, size: 20),
            const SizedBox(width: 8),
            Text(
              label,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
