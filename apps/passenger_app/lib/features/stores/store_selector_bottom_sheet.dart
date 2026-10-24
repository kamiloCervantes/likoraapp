import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../data/app_state.dart';
import '../../data/models/store_model.dart';

class StoreSelectorBottomSheet extends StatelessWidget {
  final AppState appState;

  const StoreSelectorBottomSheet({
    super.key,
    required this.appState,
  });

  @override
  Widget build(BuildContext context) {
    final activeStore = appState.activeStore;
    final stores = appState.nearbyStores.isNotEmpty
        ? appState.nearbyStores
        : (activeStore != null ? [activeStore] : <StoreModel>[]);

    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Drag handle
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.white24,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Header
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.storefront_rounded, color: AppColors.primary, size: 22),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Tiendas y Cavas Likora',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      'Despachando desde la tienda más cercana a tu ubicación',
                      style: TextStyle(
                        color: AppColors.textMuted,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Stores List
          ConstrainedBox(
            constraints: BoxConstraints(
              maxHeight: MediaQuery.of(context).size.height * 0.55,
            ),
            child: ListView.separated(
              shrinkWrap: true,
              itemCount: stores.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final store = stores[index];
                final isSelected = activeStore?.id == store.id;
                final isNearest = appState.nearestStore?.id == store.id;

                return InkWell(
                  onTap: () {
                    appState.selectStoreManually(store);
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        backgroundColor: AppColors.cardBg,
                        behavior: SnackBarBehavior.floating,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                          side: BorderSide(color: AppColors.primary, width: 1),
                        ),
                        content: Row(
                          children: [
                            const Icon(Icons.check_circle_rounded, color: AppColors.primary, size: 20),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'Catálogo actualizado a: ${store.name}',
                                style: const TextStyle(color: Colors.white, fontSize: 13),
                              ),
                            ),
                          ],
                        ),
                        duration: const Duration(seconds: 2),
                      ),
                    );
                  },
                  borderRadius: BorderRadius.circular(14),
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? AppColors.primary.withValues(alpha: 0.12)
                          : AppColors.cardBg,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: isSelected ? AppColors.primary : AppColors.border,
                        width: isSelected ? 1.5 : 1,
                      ),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Store Icon
                        Container(
                          width: 42,
                          height: 42,
                          decoration: BoxDecoration(
                            color: isSelected
                                ? AppColors.primary
                                : AppColors.surface,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Icon(
                            store.posType == 'dark_store'
                                ? Icons.flash_on_rounded
                                : store.posType == 'express_kiosk'
                                    ? Icons.shopping_bag_rounded
                                    : Icons.wine_bar_rounded,
                            color: isSelected ? Colors.black : AppColors.primary,
                            size: 22,
                          ),
                        ),
                        const SizedBox(width: 12),

                        // Store Info
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Expanded(
                                    child: Text(
                                      store.name,
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                                        fontSize: 14,
                                      ),
                                    ),
                                  ),
                                  if (isNearest)
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: Colors.green.withValues(alpha: 0.2),
                                        borderRadius: BorderRadius.circular(6),
                                        border: Border.all(color: Colors.greenAccent, width: 0.8),
                                      ),
                                      child: const Text(
                                        'MÁS CERCANA',
                                        style: TextStyle(
                                          color: Colors.greenAccent,
                                          fontSize: 9,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                              const SizedBox(height: 3),
                              Text(
                                '${store.address} • ${store.city}',
                                style: const TextStyle(
                                  color: AppColors.textMuted,
                                  fontSize: 12,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 6),
                              Row(
                                children: [
                                  // Distance badge
                                  if (store.distanceFormatted != null) ...[
                                    Icon(
                                      Icons.near_me_rounded,
                                      size: 13,
                                      color: isSelected ? AppColors.primary : AppColors.textMuted,
                                    ),
                                    const SizedBox(width: 3),
                                    Text(
                                      'A ${store.distanceFormatted}',
                                      style: TextStyle(
                                        color: isSelected ? AppColors.primary : Colors.white70,
                                        fontSize: 11,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                    const SizedBox(width: 10),
                                  ],
                                  // Hours
                                  const Icon(Icons.access_time_rounded, size: 13, color: AppColors.textMuted),
                                  const SizedBox(width: 3),
                                  Text(
                                    '${store.openingTime} - ${store.closingTime}',
                                    style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),

                        // Radio / Check
                        if (isSelected)
                          const Padding(
                            padding: EdgeInsets.only(left: 8),
                            child: Icon(Icons.check_circle_rounded, color: AppColors.primary, size: 20),
                          ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}
