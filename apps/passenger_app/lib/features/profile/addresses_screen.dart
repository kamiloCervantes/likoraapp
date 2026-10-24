import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../data/app_state.dart';
import '../../data/models/address_model.dart';

class AddressesScreen extends StatefulWidget {
  const AddressesScreen({super.key});

  @override
  State<AddressesScreen> createState() => _AddressesScreenState();
}

class _AddressesScreenState extends State<AddressesScreen> {
  bool _isDetectingLocation = false;

  IconData _getIconForAlias(String alias) {
    final lower = alias.toLowerCase();
    if (lower.contains('casa') || lower.contains('home')) {
      return Icons.home_rounded;
    } else if (lower.contains('oficina') || lower.contains('trabajo') || lower.contains('work')) {
      return Icons.work_rounded;
    } else if (lower.contains('pareja') || lower.contains('novi') || lower.contains('amor')) {
      return Icons.favorite_rounded;
    }
    return Icons.location_on_rounded;
  }

  Future<void> _handleDetectCurrentLocation(AppState appState) async {
    setState(() => _isDetectingLocation = true);

    // Simulación de adquisición GPS precisa
    await Future.delayed(const Duration(milliseconds: 1000));

    if (!mounted) return;

    appState.selectCurrentLocation(
      latitude: 19.4326077,
      longitude: -99.133208,
      addressText: 'Ubicación actual detectada por GPS',
      city: 'Zona Metropolitana',
    );

    setState(() => _isDetectingLocation = false);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Row(
          children: [
            Icon(Icons.check_circle_rounded, color: Colors.white, size: 18),
            SizedBox(width: 8),
            Text('¡Ubicación GPS detectada y establecida como activa!'),
          ],
        ),
        backgroundColor: AppColors.success,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  void _confirmDeleteAddress(BuildContext context, AppState appState, AddressModel addr) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.cardBg,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('¿Eliminar dirección?', style: TextStyle(color: Colors.white)),
        content: Text(
          '¿Estás seguro de que deseas eliminar "${addr.title}"? Esta acción no se puede deshacer.',
          style: const TextStyle(color: AppColors.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancelar', style: TextStyle(color: AppColors.textMuted)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            onPressed: () {
              appState.removeAddress(addr.id);
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Dirección eliminada correctamente'),
                  backgroundColor: AppColors.error,
                  behavior: SnackBarBehavior.floating,
                ),
              );
            },
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final appState = AppStateProvider.of(context);
    final addresses = appState.addresses;
    final activeAddress = appState.activeDeliveryAddress;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Mis Direcciones'),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Botón GPS: Detectar Ubicación Actual
            InkWell(
              onTap: _isDetectingLocation ? null : () => _handleDetectCurrentLocation(appState),
              borderRadius: BorderRadius.circular(18),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [
                      Color(0xFF2E1C14),
                      AppColors.cardBg,
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: AppColors.primary.withOpacity(0.5)),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withOpacity(0.12),
                      blurRadius: 16,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [AppColors.accent, AppColors.primary],
                        ),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primary.withOpacity(0.35),
                            blurRadius: 10,
                          ),
                        ],
                      ),
                      child: _isDetectingLocation
                          ? const Padding(
                              padding: EdgeInsets.all(12),
                              child: CircularProgressIndicator(
                                strokeWidth: 2.5,
                                color: Colors.white,
                              ),
                            )
                          : const Icon(
                              Icons.my_location_rounded,
                              color: Colors.white,
                              size: 24,
                            ),
                    ),
                    const SizedBox(width: 14),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Usar mi ubicación actual',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 15,
                            ),
                          ),
                          SizedBox(height: 3),
                          Text(
                            'Detectar automáticamente por GPS',
                            style: TextStyle(
                              color: AppColors.textSecondary,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Text(
                        'GPS',
                        style: TextStyle(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                          fontSize: 11,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Direcciones Guardadas',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                Text(
                  '${addresses.length} guardadas',
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                ),
              ],
            ),
            const SizedBox(height: 12),

            if (addresses.isEmpty)
              Container(
                margin: const EdgeInsets.only(top: 30),
                padding: const EdgeInsets.all(32),
                decoration: BoxDecoration(
                  color: AppColors.cardBg,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.border),
                ),
                alignment: Alignment.center,
                child: Column(
                  children: [
                    Icon(Icons.location_off_rounded, size: 56, color: AppColors.textMuted.withOpacity(0.5)),
                    const SizedBox(height: 14),
                    const Text(
                      'No tienes direcciones guardadas',
                      style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Agrega tu casa, oficina o dirección preferida para recibir tus licores favoritos en minutos.',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                    ),
                  ],
                ),
              )
            else
              ...addresses.map((addr) {
                final isSelected = addr.id == activeAddress.id || addr.isDefault;
                return Container(
                  margin: const EdgeInsets.only(bottom: 14),
                  decoration: BoxDecoration(
                    color: isSelected ? const Color(0xFF221712) : AppColors.cardBg,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(
                      color: isSelected ? AppColors.primary : AppColors.border,
                      width: isSelected ? 1.5 : 1,
                    ),
                    boxShadow: isSelected
                        ? [
                            BoxShadow(
                              color: AppColors.primary.withOpacity(0.1),
                              blurRadius: 10,
                              offset: const Offset(0, 3),
                            ),
                          ]
                        : null,
                  ),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(18),
                    onTap: () {
                      appState.selectAddress(addr);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Dirección activa: ${addr.title}'),
                          duration: const Duration(seconds: 1),
                          backgroundColor: AppColors.cardBg,
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                    },
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              Container(
                                width: 42,
                                height: 42,
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? AppColors.primary.withOpacity(0.2)
                                      : AppColors.border.withOpacity(0.4),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Icon(
                                  _getIconForAlias(addr.title),
                                  color: isSelected ? AppColors.primary : AppColors.textSecondary,
                                  size: 22,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Text(
                                          addr.title,
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontWeight: FontWeight.bold,
                                            fontSize: 15,
                                          ),
                                        ),
                                        if (isSelected) ...[
                                          const SizedBox(width: 8),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                            decoration: BoxDecoration(
                                              color: AppColors.primary.withOpacity(0.2),
                                              borderRadius: BorderRadius.circular(6),
                                            ),
                                            child: const Text(
                                              'ACTIVA',
                                              style: TextStyle(
                                                color: AppColors.primary,
                                                fontSize: 9,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ],
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      addr.city.isNotEmpty ? addr.city : 'Likora Delivery Zone',
                                      style: const TextStyle(
                                        color: AppColors.textMuted,
                                        fontSize: 11,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              // Radio selection button
                              Radio<String>(
                                value: addr.id,
                                groupValue: activeAddress.id,
                                activeColor: AppColors.primary,
                                onChanged: (_) => appState.selectAddress(addr),
                              ),
                            ],
                          ),

                          const SizedBox(height: 12),
                          Text(
                            addr.fullAddress,
                            style: const TextStyle(
                              color: Colors.white70,
                              fontSize: 13,
                              height: 1.3,
                            ),
                          ),

                          if (addr.details.isNotEmpty) ...[
                            const SizedBox(height: 6),
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Icon(Icons.info_outline_rounded, size: 14, color: AppColors.accent),
                                const SizedBox(width: 6),
                                Expanded(
                                  child: Text(
                                    addr.details,
                                    style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                                  ),
                                ),
                              ],
                            ),
                          ],

                          if (addr.latitude != null && addr.longitude != null) ...[
                            const SizedBox(height: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.black26,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.pin_drop_rounded, size: 12, color: AppColors.textMuted),
                                  const SizedBox(width: 4),
                                  Text(
                                    '${addr.latitude?.toStringAsFixed(4)}°, ${addr.longitude?.toStringAsFixed(4)}°',
                                    style: const TextStyle(
                                      fontSize: 10,
                                      fontFamily: 'monospace',
                                      color: AppColors.textMuted,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],

                          const SizedBox(height: 8),
                          const Divider(color: AppColors.border, height: 16),

                          // Actions row
                          Row(
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              TextButton.icon(
                                icon: const Icon(Icons.edit_outlined, size: 16, color: AppColors.textSecondary),
                                label: const Text('Editar', style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                                onPressed: () => _showAddressModal(context, appState, existingAddress: addr),
                              ),
                              const SizedBox(width: 8),
                              TextButton.icon(
                                icon: const Icon(Icons.delete_outline_rounded, size: 16, color: Colors.redAccent),
                                label: const Text('Eliminar', style: TextStyle(color: Colors.redAccent, fontSize: 12)),
                                onPressed: () => _confirmDeleteAddress(context, appState, addr),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }),
            const SizedBox(height: 80),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: AppColors.cardBg,
          border: Border(top: BorderSide(color: AppColors.border)),
        ),
        child: ElevatedButton.icon(
          style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
          onPressed: () => _showAddressModal(context, appState),
          icon: const Icon(Icons.add_location_alt_rounded),
          label: const Text('Agregar Nueva Dirección', style: TextStyle(fontWeight: FontWeight.bold)),
        ),
      ),
    );
  }

  void _showAddressModal(BuildContext context, AppState appState, {AddressModel? existingAddress}) {
    final isEditing = existingAddress != null;
    String selectedAliasChip = isEditing ? existingAddress.title : 'Casa';

    final titleCtrl = TextEditingController(text: existingAddress?.title ?? 'Casa');
    final addressCtrl = TextEditingController(text: existingAddress?.fullAddress ?? '');
    final cityCtrl = TextEditingController(text: existingAddress?.city.isNotEmpty == true ? existingAddress!.city : 'Ciudad de México');
    final detailsCtrl = TextEditingController(text: existingAddress?.details ?? '');
    final latCtrl = TextEditingController(text: existingAddress?.latitude?.toString() ?? '19.4326');
    final lngCtrl = TextEditingController(text: existingAddress?.longitude?.toString() ?? '-99.1332');
    bool isDefault = existingAddress?.isDefault ?? appState.addresses.isEmpty;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (modalContext) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Container(
              padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(context).viewInsets.bottom + 24),
              decoration: const BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Container(
                        width: 40,
                        height: 4,
                        margin: const EdgeInsets.only(bottom: 16),
                        decoration: BoxDecoration(
                          color: AppColors.border,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          isEditing ? 'Editar Dirección' : 'Nueva Dirección de Entrega',
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close_rounded, color: AppColors.textMuted),
                          onPressed: () => Navigator.pop(modalContext),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    // Quick Alias Chips
                    const Text('Tipo de lugar', style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      children: [
                        {'label': 'Casa', 'icon': '🏠'},
                        {'label': 'Oficina', 'icon': '🏢'},
                        {'label': 'Pareja', 'icon': '❤️'},
                        {'label': 'Otro', 'icon': '📍'},
                      ].map((item) {
                        final label = item['label']!;
                        final isSel = selectedAliasChip == label;
                        return ChoiceChip(
                          label: Text('${item['icon']} $label'),
                          selected: isSel,
                          selectedColor: AppColors.primary,
                          backgroundColor: AppColors.surface,
                          labelStyle: TextStyle(
                            color: isSel ? Colors.white : AppColors.textSecondary,
                            fontWeight: isSel ? FontWeight.bold : FontWeight.normal,
                          ),
                          onSelected: (val) {
                            if (val) {
                              setModalState(() {
                                selectedAliasChip = label;
                                if (label != 'Otro') {
                                  titleCtrl.text = label;
                                }
                              });
                            }
                          },
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 14),

                    // GPS Quick autofill button
                    InkWell(
                      borderRadius: BorderRadius.circular(12),
                      onTap: () {
                        latCtrl.text = '19.4326';
                        lngCtrl.text = '-99.1332';
                        if (addressCtrl.text.isEmpty) {
                          addressCtrl.text = 'Av. Reforma #1234, Col. Juárez';
                        }
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Coordenadas GPS actualizadas'),
                            duration: Duration(seconds: 1),
                            behavior: SnackBarBehavior.floating,
                          ),
                        );
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: AppColors.primary.withOpacity(0.3)),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.gps_fixed_rounded, size: 14, color: AppColors.primary),
                            SizedBox(width: 6),
                            Text(
                              'Autocompletar con GPS actual',
                              style: TextStyle(color: AppColors.primary, fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),

                    TextField(
                      controller: titleCtrl,
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(labelText: 'Alias personalizado (Ej: Casa de campo)'),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: addressCtrl,
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(labelText: 'Dirección Completa (Calle, Número, Edificio)'),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: cityCtrl,
                            style: const TextStyle(color: Colors.white),
                            decoration: const InputDecoration(labelText: 'Ciudad'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: TextField(
                            controller: detailsCtrl,
                            style: const TextStyle(color: Colors.white),
                            decoration: const InputDecoration(labelText: 'Referencia / Apto'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: latCtrl,
                            keyboardType: const TextInputType.numberWithOptions(decimal: true),
                            style: const TextStyle(color: Colors.white),
                            decoration: const InputDecoration(labelText: 'Latitud GPS'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: TextField(
                            controller: lngCtrl,
                            keyboardType: const TextInputType.numberWithOptions(decimal: true),
                            style: const TextStyle(color: Colors.white),
                            decoration: const InputDecoration(labelText: 'Longitud GPS'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    // Switch predeterminado
                    SwitchListTile(
                      contentPadding: EdgeInsets.zero,
                      title: const Text('Establecer como dirección activa', style: TextStyle(color: Colors.white, fontSize: 14)),
                      subtitle: const Text('Se usará por defecto para tus próximos pedidos', style: TextStyle(color: AppColors.textMuted, fontSize: 11)),
                      value: isDefault,
                      activeColor: AppColors.primary,
                      onChanged: (val) => setModalState(() => isDefault = val),
                    ),

                    const SizedBox(height: 18),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
                        onPressed: () {
                          if (titleCtrl.text.isNotEmpty && addressCtrl.text.isNotEmpty) {
                            if (isEditing) {
                              final updated = existingAddress.copyWith(
                                title: titleCtrl.text.trim(),
                                fullAddress: addressCtrl.text.trim(),
                                city: cityCtrl.text.trim(),
                                details: detailsCtrl.text.trim(),
                                latitude: double.tryParse(latCtrl.text),
                                longitude: double.tryParse(lngCtrl.text),
                                isDefault: isDefault,
                              );
                              appState.updateAddress(updated);
                            } else {
                              final newAddr = AddressModel(
                                id: 'addr-${DateTime.now().millisecondsSinceEpoch}',
                                title: titleCtrl.text.trim(),
                                fullAddress: addressCtrl.text.trim(),
                                city: cityCtrl.text.trim(),
                                details: detailsCtrl.text.trim(),
                                latitude: double.tryParse(latCtrl.text),
                                longitude: double.tryParse(lngCtrl.text),
                                isDefault: isDefault,
                              );
                              appState.addAddress(newAddr);
                            }
                            Navigator.pop(modalContext);
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(isEditing ? 'Dirección actualizada' : 'Dirección guardada exitosamente'),
                                backgroundColor: AppColors.success,
                                behavior: SnackBarBehavior.floating,
                              ),
                            );
                          } else {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Por favor completa el alias y la dirección'),
                                backgroundColor: AppColors.error,
                                behavior: SnackBarBehavior.floating,
                              ),
                            );
                          }
                        },
                        child: Text(isEditing ? 'Guardar Cambios' : 'Guardar Dirección'),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }
}
