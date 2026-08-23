import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/app_routes.dart';
import '../../core/utils/validators.dart';
import '../../core/services/api_client.dart';
import '../../data/app_state.dart';
import '../../data/models/user_model.dart';
import 'auth_repository.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _authRepo = AuthRepository();

  final _displayNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _dobController = TextEditingController();

  DateTime? _selectedBirthDate;
  bool _isLoading = false;
  bool _isGoogleLoading = false;

  @override
  void dispose() {
    _displayNameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _dobController.dispose();
    super.dispose();
  }

  void _showInDevelopmentNotice(String providerName) {
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.info_outline_rounded, color: AppColors.accent, size: 20),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                'El registro con $providerName se encuentra en desarrollo, muy pronto estará disponible.',
                style: const TextStyle(color: Colors.white, fontSize: 13),
              ),
            ),
          ],
        ),
        backgroundColor: AppColors.surface,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  Future<void> _handleRegister(AppState appState) async {
    if (!(_formKey.currentState?.validate() ?? false)) {
      return;
    }

    setState(() => _isLoading = true);

    final birthDateIso = _selectedBirthDate?.toIso8601String().split('T').first;

    final result = await _authRepo.registerWithEmail(
      email: _emailController.text,
      password: _passwordController.text,
      displayName: _displayNameController.text,
      birthDate: birthDateIso,
    );

    if (!mounted) return;
    setState(() => _isLoading = false);

    if (result['success'] == true) {
      final userJson = result['user'];
      if (userJson != null) {
        appState.currentUser = UserModel(
          id: userJson['id'],
          name: userJson['display_name'] ?? _displayNameController.text,
          email: userJson['email'] ?? _emailController.text,
          role: UserRole.client,
        );
      }

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('🎉 ¡Cuenta creada con éxito! Bienvenido, ${appState.currentUser?.name}'),
          backgroundColor: AppColors.success,
        ),
      );

      Navigator.pushReplacementNamed(context, AppRoutes.mainNav);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('❌ ${result['error']}'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  Future<void> _handleGoogleRegister(AppState appState) async {
    setState(() => _isGoogleLoading = true);

    final result = await _authRepo.loginWithGoogle(isRegistration: true);

    if (!mounted) return;
    setState(() => _isGoogleLoading = false);

    if (result['success'] == true) {
      final userJson = result['user'];
      final alreadyRegistered = result['already_registered'] == true;

      if (alreadyRegistered) {
        final email = userJson?['email'] ?? 'seleccionada';
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            backgroundColor: AppColors.surface,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            title: const Row(
              children: [
                Icon(Icons.info_outline_rounded, color: AppColors.accent, size: 26),
                SizedBox(width: 10),
                Expanded(
                  child: Text('Cuenta ya registrada', style: TextStyle(color: Colors.white, fontSize: 18)),
                ),
              ],
            ),
            content: Text(
              'La cuenta de Google ($email) ya se encuentra registrada en Likora.\n\n¿Deseas iniciar sesión directamente?',
              style: const TextStyle(color: AppColors.textSecondary, fontSize: 14, height: 1.4),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('Cancelar', style: TextStyle(color: AppColors.textMuted)),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
                onPressed: () {
                  Navigator.pop(ctx);
                  if (result['token'] != null && result['refreshToken'] != null) {
                    ApiClient.setTokens(
                      accessToken: result['token'],
                      refreshToken: result['refreshToken'],
                    );
                  }
                  if (userJson != null) {
                    appState.currentUser = UserModel(
                      id: userJson['id'],
                      name: userJson['display_name'] ?? 'Usuario Google',
                      email: userJson['email'] ?? '',
                      role: UserRole.client,
                    );
                  }
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('✅ ¡Sesión iniciada como ${appState.currentUser?.name}!'),
                      backgroundColor: AppColors.success,
                    ),
                  );
                  Navigator.pushReplacementNamed(context, AppRoutes.mainNav);
                },
                child: const Text('Iniciar Sesión', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        );
        return;
      }

      if (userJson != null) {
        appState.currentUser = UserModel(
          id: userJson['id'],
          name: userJson['display_name'] ?? 'Usuario Google',
          email: userJson['email'] ?? '',
          role: UserRole.client,
        );
      }

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('🎉 ¡Registro con Google exitoso! Bienvenido, ${appState.currentUser?.name}'),
          backgroundColor: AppColors.success,
        ),
      );

      Navigator.pushReplacementNamed(context, AppRoutes.mainNav);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('⚠️ ${result['error']}'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final appState = AppStateProvider.of(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.pop(context),
        ),
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 32,
              height: 32,
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
                size: 20,
              ),
            ),
            const SizedBox(width: 8),
            const Text('Likora', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 24)),
          ],
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 10),

                // Name Field
                TextFormField(
                  controller: _displayNameController,
                  validator: (val) => Validators.requiredField(val, 'Nombre completo'),
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(
                    hintText: 'Nombre y Apellidos',
                    prefixIcon: Icon(Icons.person_outline, color: AppColors.textMuted),
                  ),
                ),
                const SizedBox(height: 16),

                // Email Field
                TextFormField(
                  controller: _emailController,
                  validator: Validators.email,
                  style: const TextStyle(color: Colors.white),
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(
                    hintText: 'Correo Electrónico',
                    prefixIcon: Icon(Icons.email_outlined, color: AppColors.textMuted),
                  ),
                ),
                const SizedBox(height: 16),

                // Password Field
                TextFormField(
                  controller: _passwordController,
                  validator: Validators.password,
                  obscureText: true,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(
                    hintText: 'Contraseña (mínimo 8 caracteres)',
                    prefixIcon: Icon(Icons.lock_outline, color: AppColors.textMuted),
                  ),
                ),
                const SizedBox(height: 16),

                // Confirm Password Field
                TextFormField(
                  controller: _confirmPasswordController,
                  validator: (val) => Validators.confirmPassword(val, _passwordController.text),
                  obscureText: true,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(
                    hintText: 'Confirmar Contraseña',
                    prefixIcon: Icon(Icons.lock_reset_outlined, color: AppColors.textMuted),
                  ),
                ),
                const SizedBox(height: 16),

                // Date of Birth Field
                TextFormField(
                  controller: _dobController,
                  readOnly: true,
                  validator: (val) => Validators.requiredField(val, 'Fecha de nacimiento'),
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(
                    hintText: 'Fecha de Nacimiento (DD/MM/AAAA)',
                    prefixIcon: Icon(Icons.calendar_today_rounded, color: AppColors.textMuted),
                  ),
                  onTap: () async {
                    final date = await showDatePicker(
                      context: context,
                      initialDate: DateTime(2000, 1, 1),
                      firstDate: DateTime(1940),
                      lastDate: DateTime.now(),
                    );
                    if (date != null) {
                      setState(() {
                        _selectedBirthDate = date;
                        _dobController.text = "${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}";
                      });
                    }
                  },
                ),
                const SizedBox(height: 16),

                // Age Legal Warning Notice
                const Text(
                  'Debes ser mayor de 18 años para comprar bebidas alcohólicas.',
                  style: TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 13,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),

                // Sign Up Button
                ElevatedButton(
                  onPressed: _isLoading ? null : () => _handleRegister(appState),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                        )
                      : const Text('Registrarme', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),
                const SizedBox(height: 24),

                // Social Label
                const Text(
                  'O registrarse con',
                  style: TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 14,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 20),

                // Social Grid
                Row(
                  children: [
                    Expanded(
                      child: _isGoogleLoading
                          ? Container(
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              decoration: BoxDecoration(
                                color: AppColors.socialButton,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Center(
                                child: SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                ),
                              ),
                            )
                          : _buildSocialButton(
                              'Google',
                              Icons.g_mobiledata_rounded,
                              () => _handleGoogleRegister(appState),
                            ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: _buildSocialButton(
                        'Facebook',
                        Icons.facebook,
                        () => _showInDevelopmentNotice('Facebook'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: _buildSocialButton(
                        'Microsoft',
                        Icons.window_rounded,
                        () => _showInDevelopmentNotice('Microsoft'),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: _buildSocialButton(
                        'Apple',
                        Icons.apple,
                        () => _showInDevelopmentNotice('Apple'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 32),

                // Already have account
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text(
                      '¿Ya tienes una cuenta? ',
                      style: TextStyle(color: AppColors.textMuted),
                    ),
                    GestureDetector(
                      onTap: () => Navigator.pushReplacementNamed(context, AppRoutes.login),
                      child: const Text(
                        'Iniciar Sesión',
                        style: TextStyle(
                          color: AppColors.primaryLight,
                          fontWeight: FontWeight.bold,
                          decoration: TextDecoration.underline,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSocialButton(String label, IconData icon, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
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
