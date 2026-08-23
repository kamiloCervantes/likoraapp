import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/app_routes.dart';
import '../../core/utils/validators.dart';
import '../../data/app_state.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _dobController = TextEditingController();

  void _handleRegister() {
    if (_formKey.currentState?.validate() ?? false) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Cuenta registrada con éxito. ¡Bienvenido a Likora!'),
          backgroundColor: AppColors.success,
        ),
      );
      Navigator.pushReplacementNamed(context, AppRoutes.mainNav);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
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
                ),
              ),
              child: const Icon(Icons.local_fire_department_rounded, color: Colors.white, size: 20),
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
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const SizedBox(height: 10),

                // Username Field
                TextFormField(
                  controller: _usernameController,
                  validator: (val) => Validators.requiredField(val, 'Nombre de usuario'),
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(
                    hintText: 'Username',
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
                    hintText: 'Email',
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
                    hintText: 'Password',
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
                    hintText: 'Confirm Password',
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
                    hintText: 'Date of Birth',
                    suffixIcon: Icon(Icons.calendar_today_rounded, color: AppColors.textMuted),
                  ),
                  onTap: () async {
                    final date = await showDatePicker(
                      context: context,
                      initialDate: DateTime(2000, 1, 1),
                      firstDate: DateTime(1940),
                      lastDate: DateTime.now(),
                    );
                    if (date != null) {
                      _dobController.text = "${date.day}/${date.month}/${date.year}";
                    }
                  },
                ),
                const SizedBox(height: 16),

                // Age Legal Warning Notice
                const Text(
                  'You must be of legal drinking age to register.',
                  style: TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 13,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),

                // Sign Up Button
                ElevatedButton(
                  onPressed: _handleRegister,
                  child: const Text('Sign Up'),
                ),
                const SizedBox(height: 24),

                // Social Label
                const Text(
                  'Or sign up with',
                  style: TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 20),

                // Social Grid
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

                // Already have account
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text(
                      'Already have an account? ',
                      style: TextStyle(color: AppColors.textMuted),
                    ),
                    GestureDetector(
                      onTap: () => Navigator.pushReplacementNamed(context, AppRoutes.login),
                      child: const Text(
                        'Sign In',
                        style: TextStyle(
                          color: AppColors.textSecondary,
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

  Widget _buildSocialButton(String label, IconData icon) {
    return InkWell(
      onTap: () => Navigator.pushReplacementNamed(context, AppRoutes.mainNav),
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
