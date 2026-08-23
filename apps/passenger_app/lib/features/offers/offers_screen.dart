import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/app_routes.dart';
import '../../core/utils/currency_formatter.dart';
import '../../data/app_state.dart';
import '../../data/models/product_model.dart';

class OffersScreen extends StatefulWidget {
  const OffersScreen({super.key});

  @override
  State<OffersScreen> createState() => _OffersScreenState();
}

class _OffersScreenState extends State<OffersScreen> {
  final TextEditingController _searchController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final appState = AppStateProvider.of(context);
    final offerProducts = appState.offerProducts.where((p) {
      if (_searchController.text.isEmpty) return true;
      return p.title.toLowerCase().contains(_searchController.text.toLowerCase());
    }).toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Ofertas'),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.menu_rounded),
          onPressed: () {},
        ),
        actions: [
          IconButton(
            icon: Badge(
              label: Text('${appState.cart.length}'),
              isLabelVisible: appState.cart.isNotEmpty,
              child: const Icon(Icons.shopping_cart_outlined),
            ),
            onPressed: () => appState.setNavIndex(3),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search Offers Input Field
          Padding(
            padding: const EdgeInsets.all(20.0),
            child: TextField(
              controller: _searchController,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                hintText: 'Buscar ofertas',
                prefixIcon: Icon(Icons.search_rounded, color: AppColors.textMuted),
              ),
              onChanged: (_) => setState(() {}),
            ),
          ),

          // Offers List
          Expanded(
            child: offerProducts.isEmpty
                ? const Center(
                    child: Text(
                      'No se encontraron ofertas vigentes.',
                      style: TextStyle(color: AppColors.textMuted),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    itemCount: offerProducts.length,
                    itemBuilder: (context, index) {
                      final product = offerProducts[index];
                      return _buildOfferItemCard(context, product);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildOfferItemCard(BuildContext context, ProductModel product) {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      padding: const EdgeInsets.all(12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Left Info Column
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Oferta Especial',
                  style: TextStyle(
                    color: AppColors.textMuted,
                    fontSize: 13,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  product.title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 17,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Precio original: ${CurrencyFormatter.format(product.price)}, Ahora: ${CurrencyFormatter.format(product.effectivePrice)}',
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 13,
                  ),
                ),
                const SizedBox(height: 14),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.cardBg,
                    foregroundColor: Colors.white,
                    minimumSize: const Size(120, 42),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                      side: const BorderSide(color: AppColors.border),
                    ),
                  ),
                  onPressed: () {
                    Navigator.pushNamed(
                      context,
                      AppRoutes.productDetail,
                      arguments: product,
                    );
                  },
                  child: const Text('Ver detalles', style: TextStyle(fontSize: 13)),
                ),
              ],
            ),
          ),
          const SizedBox(width: 14),

          // Right Image Container (Rounded Card Image)
          ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: Image.network(
              product.images.first,
              width: 130,
              height: 130,
              fit: BoxFit.cover,
            ),
          ),
        ],
      ),
    );
  }
}
