import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/app_routes.dart';
import '../../core/utils/currency_formatter.dart';
import '../../data/app_state.dart';
import '../../data/models/category_model.dart';
import '../../data/models/product_model.dart';

class CategoryDetailScreen extends StatefulWidget {
  final CategoryModel category;
  final String? initialSubcategoryId;

  const CategoryDetailScreen({
    super.key,
    required this.category,
    this.initialSubcategoryId,
  });

  @override
  State<CategoryDetailScreen> createState() => _CategoryDetailScreenState();
}

class _CategoryDetailScreenState extends State<CategoryDetailScreen> {
  late String? _selectedSubcategoryId;

  @override
  void initState() {
    super.initState();
    _selectedSubcategoryId = widget.initialSubcategoryId;
  }

  @override
  Widget build(BuildContext context) {
    final appState = AppStateProvider.of(context);
    final filteredProducts = appState.filterProductsByCategory(
      widget.category.id,
      subcategoryId: _selectedSubcategoryId,
    );

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(widget.category.name),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Horizontal Subcategories selector chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            child: Row(
              children: [
                FilterChip(
                  label: const Text('Todos'),
                  selected: _selectedSubcategoryId == null,
                  selectedColor: AppColors.primary,
                  backgroundColor: AppColors.cardBg,
                  labelStyle: TextStyle(
                    color: _selectedSubcategoryId == null ? Colors.white : AppColors.textSecondary,
                    fontWeight: FontWeight.bold,
                  ),
                  onSelected: (val) {
                    setState(() => _selectedSubcategoryId = null);
                  },
                ),
                const SizedBox(width: 8),
                ...widget.category.subcategories.map((sub) {
                  final isSelected = _selectedSubcategoryId == sub.id;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: FilterChip(
                      label: Text(sub.name),
                      selected: isSelected,
                      selectedColor: AppColors.primary,
                      backgroundColor: AppColors.cardBg,
                      labelStyle: TextStyle(
                        color: isSelected ? Colors.white : AppColors.textSecondary,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      ),
                      onSelected: (val) {
                        setState(() => _selectedSubcategoryId = val ? sub.id : null);
                      },
                    ),
                  );
                }),
              ],
            ),
          ),

          // Products List / Grid
          Expanded(
            child: filteredProducts.isEmpty
                ? const Center(
                    child: Text(
                      'No hay productos disponibles en esta subcategoría.',
                      style: TextStyle(color: AppColors.textMuted),
                    ),
                  )
                : GridView.builder(
                    padding: const EdgeInsets.all(20),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 0.70,
                      crossAxisSpacing: 16,
                      mainAxisSpacing: 16,
                    ),
                    itemCount: filteredProducts.length,
                    itemBuilder: (context, index) {
                      final product = filteredProducts[index];
                      return _buildProductTile(context, product, appState);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildProductTile(BuildContext context, ProductModel product, AppState appState) {
    return InkWell(
      onTap: () => Navigator.pushNamed(context, AppRoutes.productDetail, arguments: product),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                child: Image.network(
                  product.images.first,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      color: AppColors.surface,
                      child: const Center(
                        child: Icon(Icons.local_bar_rounded, color: AppColors.primary, size: 40),
                      ),
                    );
                  },
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        CurrencyFormatter.format(product.effectivePrice),
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                        ),
                      ),
                      IconButton(
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                        icon: const Icon(Icons.add_shopping_cart_rounded, color: AppColors.primary, size: 22),
                        onPressed: () {
                          appState.addToCart(product);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('${product.title} agregado'),
                              duration: const Duration(seconds: 1),
                              backgroundColor: AppColors.primary,
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
