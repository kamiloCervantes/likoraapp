import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/app_routes.dart';
import 'package:core_models/core_models.dart';

class KycFormScreen extends StatefulWidget {
  const KycFormScreen({super.key});

  @override
  State<KycFormScreen> createState() => _KycFormScreenState();
}

class _KycFormScreenState extends State<KycFormScreen> {
  DocumentType _selectedDocType = DocumentType.dni;
  final TextEditingController _docNumberController = TextEditingController();
  DateTime? _selectedBirthDate;

  int? get _calculatedAge {
    if (_selectedBirthDate == null) return null;
    final today = DateTime.now();
    int age = today.year - _selectedBirthDate!.year;
    if (today.month < _selectedBirthDate!.month ||
        (today.month == _selectedBirthDate!.month && today.day < _selectedBirthDate!.day)) {
      age--;
    }
    return age;
  }

  bool get _isAdult => (_calculatedAge ?? 0) >= 18;

  Future<void> _pickBirthDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime(now.year - 20, now.month, now.day),
      firstDate: DateTime(now.year - 100),
      lastDate: now,
      builder: (context, child) {
        return Theme(
          data: ThemeData.dark().copyWith(
            colorScheme: const ColorScheme.dark(
              primary: AppColors.primary,
              onPrimary: Colors.white,
              surface: AppColors.surface,
              onSurface: Colors.white,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        _selectedBirthDate = picked;
      });
    }
  }

  void _proceedToPhotos() {
    if (_docNumberController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Por favor ingresa el número de tu documento')),
      );
      return;
    }

    if (_selectedBirthDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Por favor selecciona tu fecha de nacimiento')),
      );
      return;
    }

    if (!_isAdult) {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          backgroundColor: AppColors.surface,
          title: const Row(
            children: [
              Icon(Icons.warning_amber_rounded, color: AppColors.error),
              SizedBox(width: 8),
              Text('Menor de Edad', style: TextStyle(color: Colors.white)),
            ],
          ),
          content: const Text(
            'Likora es una plataforma exclusiva para mayores de 18 años. No puedes completar el registro ni realizar compras de bebidas alcohólicas.',
            style: TextStyle(color: AppColors.textSecondary),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Entendido', style: TextStyle(color: AppColors.primary)),
            ),
          ],
        ),
      );
      return;
    }

    Navigator.pushNamed(
      context,
      AppRoutes.kycPhotos,
      arguments: {
        'docType': _selectedDocType,
        'docNumber': _docNumberController.text.trim(),
        'birthDate': _selectedBirthDate,
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Datos del Documento'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Selecciona tu tipo de documento',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: AppColors.card,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white.withOpacity(0.1)),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<DocumentType>(
                  value: _selectedDocType,
                  dropdownColor: AppColors.surface,
                  isExpanded: true,
                  items: const [
                    DropdownMenuItem(value: DocumentType.dni, child: Text('DNI / Cédula de Identidad', style: TextStyle(color: Colors.white))),
                    DropdownMenuItem(value: DocumentType.passport, child: Text('Pasaporte Oficial', style: TextStyle(color: Colors.white))),
                    DropdownMenuItem(value: DocumentType.driversLicense, child: Text('Licencia de Conducir', style: TextStyle(color: Colors.white))),
                    DropdownMenuItem(value: DocumentType.foreignId, child: Text('Documento Extranjero / Residencia', style: TextStyle(color: Colors.white))),
                  ],
                  onChanged: (val) {
                    if (val != null) setState(() => _selectedDocType = val);
                  },
                ),
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Número de Documento',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _docNumberController,
              style: const TextStyle(color: Colors.white, fontSize: 16),
              decoration: InputDecoration(
                hintText: 'Ej: 12345678X',
                hintStyle: TextStyle(color: AppColors.textSecondary),
                filled: true,
                fillColor: AppColors.card,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                prefixIcon: const Icon(Icons.badge_outlined, color: AppColors.primaryLight),
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Fecha de Nacimiento',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white),
            ),
            const SizedBox(height: 12),
            InkWell(
              onTap: _pickBirthDate,
              borderRadius: BorderRadius.circular(12),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                decoration: BoxDecoration(
                  color: AppColors.card,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white.withOpacity(0.1)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.calendar_today_outlined, color: AppColors.primaryLight),
                    const SizedBox(width: 14),
                    Text(
                      _selectedBirthDate == null
                          ? 'Seleccionar fecha (DD/MM/AAAA)'
                          : '${_selectedBirthDate!.day.toString().padLeft(2, '0')}/${_selectedBirthDate!.month.toString().padLeft(2, '0')}/${_selectedBirthDate!.year}',
                      style: TextStyle(
                        color: _selectedBirthDate == null ? AppColors.textSecondary : Colors.white,
                        fontSize: 16,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            if (_calculatedAge != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: _isAdult ? AppColors.success.withOpacity(0.12) : AppColors.error.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: _isAdult ? AppColors.success : AppColors.error),
                ),
                child: Row(
                  children: [
                    Icon(_isAdult ? Icons.check_circle : Icons.cancel, color: _isAdult ? AppColors.success : AppColors.error),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        _isAdult ? 'Edad: $_calculatedAge años (Mayor de edad legal)' : 'Edad: $_calculatedAge años (Menor de 18 años)',
                        style: TextStyle(
                          color: _isAdult ? AppColors.success : AppColors.error,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 40),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              onPressed: _proceedToPhotos,
              child: const Text('Continuar a Fotos', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }
}
