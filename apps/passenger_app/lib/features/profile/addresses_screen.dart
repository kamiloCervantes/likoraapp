import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../data/app_state.dart';
import '../../data/models/address_model.dart';

class AddressesScreen extends StatelessWidget {
  const AddressesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final appState = AppStateProvider.of(context);
    final addresses = appState.addresses;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Mis Direcciones'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: addresses.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.location_off_rounded, size: 64, color: AppColors.textSecondary),
                  const SizedBox(height: 16),
                  const Text(
                    'No tienes direcciones guardadas',
                    style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Agrega una dirección para recibir tus pedidos.',
                    style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(20),
              itemCount: addresses.length,
              itemBuilder: (context, index) {
                final addr = addresses[index];
                return Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.cardBg,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: addr.isDefault ? AppColors.primary : AppColors.border,
                      width: addr.isDefault ? 1.5 : 1,
                    ),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Radio<bool>(
                        value: true,
                        groupValue: addr.isDefault,
                        activeColor: AppColors.primary,
                        onChanged: (val) {
                          appState.setDefaultAddress(addr.id);
                        },
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(
                                  addr.title,
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                                if (addr.isDefault) ...[
                                  const SizedBox(width: 8),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: AppColors.primary.withOpacity(0.15),
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    child: const Text(
                                      'Activa',
                                      style: TextStyle(
                                        color: AppColors.primary,
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(
                              addr.fullAddress,
                              style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
                            ),
                            if (addr.details.isNotEmpty) ...[
                              const SizedBox(height: 4),
                              Text(
                                'Ref: ',
                                style: const TextStyle(fontSize: 12, color: Colors.white70),
                              ),
                            ],
                            if (addr.latitude != null && addr.longitude != null) ...[
                              const SizedBox(height: 6),
                              Row(
                                children: [
                                  Icon(Icons.my_location_rounded, size: 12, color: AppColors.primary),
                                  const SizedBox(width: 4),
                                  Text(
                                    ', ',
                                    style: TextStyle(
                                      fontSize: 10,
                                      fontFamily: 'monospace',
                                      color: AppColors.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.delete_outline_rounded, size: 20, color: Colors.redAccent),
                        onPressed: () {
                          appState.removeAddress(addr.id);
                        },
                      ),
                    ],
                  ),
                );
              },
            ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          border: Border(top: BorderSide(color: AppColors.border)),
        ),
        child: ElevatedButton.icon(
          onPressed: () => _showAddAddressModal(context, appState),
          icon: const Icon(Icons.add_location_alt_rounded),
          label: const Text('Agregar Nueva Dirección'),
        ),
      ),
    );
  }

  void _showAddAddressModal(BuildContext context, AppState appState) {
    final titleCtrl = TextEditingController(text: 'Casa');
    final addressCtrl = TextEditingController();
    final cityCtrl = TextEditingController(text: 'Caracas');
    final detailsCtrl = TextEditingController();
    final latCtrl = TextEditingController(text: '10.4950');
    final lngCtrl = TextEditingController(text: '-66.8500');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.cardBg,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) {
        return Padding(
          padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(context).viewInsets.bottom + 20),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Nueva Dirección de Entrega',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: titleCtrl,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(labelText: 'Alias (Ej: Casa, Trabajo)'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: addressCtrl,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(labelText: 'Dirección Completa (Calle, Edif)'),
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
                        keyboardType: TextInputType.number,
                        style: const TextStyle(color: Colors.white),
                        decoration: const InputDecoration(labelText: 'Latitud'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextField(
                        controller: lngCtrl,
                        keyboardType: TextInputType.number,
                        style: const TextStyle(color: Colors.white),
                        decoration: const InputDecoration(labelText: 'Longitud'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      if (titleCtrl.text.isNotEmpty && addressCtrl.text.isNotEmpty) {
                        final newAddr = AddressModel(
                          id: 'addr-',
                          title: titleCtrl.text.trim(),
                          fullAddress: addressCtrl.text.trim(),
                          city: cityCtrl.text.trim(),
                          details: detailsCtrl.text.trim(),
                          latitude: double.tryParse(latCtrl.text),
                          longitude: double.tryParse(lngCtrl.text),
                          isDefault: appState.addresses.isEmpty,
                        );
                        appState.addAddress(newAddr);
                        Navigator.pop(context);
                      }
                    },
                    child: const Text('Guardar y Seleccionar'),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
