import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/app_routes.dart';
import '../../data/app_state.dart';
import '../../data/models/category_model.dart';

class CategoriesScreen extends StatelessWidget {
  const CategoriesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final appState = AppStateProvider.of(context);
    final categories = appState.categories;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Categorías'),
        centerTitle: true,
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(20),
        itemCount: categories.length,
        itemBuilder: (context, index) {
          final cat = categories[index];
          return Container(
            margin: const EdgeInsets.only(bottom: 16),
            decoration: BoxDecoration(
              color: AppColors.cardBg,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Theme(
              data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
              child: ExpansionTile(
                leading: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    _getCategoryIcon(cat.icon),
                    color: AppColors.primary,
                  ),
                ),
                title: Text(
                  cat.name,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                subtitle: Text(
                  '${cat.subcategories.length} subcategorías',
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                ),
                trailing: const Icon(Icons.keyboard_arrow_right_rounded, color: AppColors.textMuted),
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                    child: Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        ActionChip(
                          label: const Text('Ver Todo'),
                          backgroundColor: AppColors.primary,
                          labelStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                          onPressed: () {
                            Navigator.pushNamed(
                              context,
                              AppRoutes.categoryDetail,
                              arguments: {'category': cat, 'selectedSubcategoryId': null},
                            );
                          },
                        ),
                        ...cat.subcategories.map((sub) {
                          return ActionChip(
                            label: Text(sub.name),
                            backgroundColor: AppColors.surface,
                            labelStyle: const TextStyle(color: AppColors.textSecondary),
                            onPressed: () {
                              Navigator.pushNamed(
                                context,
                                AppRoutes.categoryDetail,
                                arguments: {'category': cat, 'selectedSubcategoryId': sub.id},
                              );
                            },
                          );
                        }),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  IconData _getCategoryIcon(String iconStr) {
    switch (iconStr) {
      case 'wine_bar':
        return Icons.wine_bar_rounded;
      case 'sports_bar':
        return Icons.sports_bar_rounded;
      case 'liquor':
        return Icons.liquor_rounded;
      default:
        return Icons.local_bar_rounded;
    }
  }
}
