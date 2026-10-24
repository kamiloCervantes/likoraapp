class ProductModel {
  final String id;
  final String? storeId;
  final String? storeName;
  final double? storeDistanceKm;
  final String? storeDistanceFormatted;
  final String title;
  final String description;
  final double price;
  final double? discountPrice;
  final double rating;
  final String categoryId;
  final String subcategoryId;
  final List<String> images;
  final bool isFeatured;
  final bool isOffer;

  ProductModel({
    required this.id,
    this.storeId,
    this.storeName,
    this.storeDistanceKm,
    this.storeDistanceFormatted,
    required this.title,
    required this.description,
    required this.price,
    this.discountPrice,
    required this.rating,
    required this.categoryId,
    required this.subcategoryId,
    required this.images,
    this.isFeatured = false,
    this.isOffer = false,
  });

  double get effectivePrice => discountPrice ?? price;

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    // 1. Título / Nombre
    final title = json['name']?.toString() ?? json['title']?.toString() ?? '';

    // 2. Parser numérico seguro
    double parseDouble(dynamic v, [double defaultValue = 0.0]) {
      if (v == null) return defaultValue;
      if (v is num) return v.toDouble();
      if (v is String) return double.tryParse(v) ?? defaultValue;
      return defaultValue;
    }

    final rawPrice = parseDouble(json['price'], 0.0);
    final compareAt = json['compare_at_price'] != null ? parseDouble(json['compare_at_price']) : null;
    final explicitDiscount = json['discount_price'] != null ? parseDouble(json['discount_price']) : null;

    final bool hasCompareOffer = compareAt != null && compareAt > rawPrice;
    final double displayPrice = hasCompareOffer ? compareAt : rawPrice;
    final double? displayDiscountPrice = hasCompareOffer ? rawPrice : explicitDiscount;

    // 3. Parser de imágenes
    final List<String> parsedImages = [];
    if (json['images'] is List) {
      for (final item in json['images']) {
        if (item is String && item.isNotEmpty) {
          parsedImages.add(item);
        } else if (item is Map && item['url'] != null) {
          parsedImages.add(item['url'].toString());
        }
      }
    }
    if (parsedImages.isEmpty && json['image_url'] != null) {
      parsedImages.add(json['image_url'].toString());
    }
    if (parsedImages.isEmpty) {
      parsedImages.add('https://images.unsplash.com/photo-1527061011665-3652c757a4d4?w=600&q=80');
    }

    // 4. Banderas y rating
    final isOffer = json['is_offer'] == true || hasCompareOffer;
    final isFeatured = json['is_featured'] == true;
    final rating = parseDouble(json['rating'], 4.8);

    // 5. Tienda asociada y distancia
    final storeId = json['store_id']?.toString() ??
        (json['store'] is Map ? json['store']['id']?.toString() : null);
    final storeName = json['store'] is Map ? json['store']['name']?.toString() : null;

    final rawDist = json['store_distance_km'] ?? (json['store'] is Map ? json['store']['distance_km'] : null);
    final double? storeDistanceKm = rawDist != null ? parseDouble(rawDist) : null;
    final String? storeDistanceFormatted = json['store_distance_formatted']?.toString() ??
        (json['store'] is Map ? json['store']['distance_formatted']?.toString() : null);

    return ProductModel(
      id: json['id']?.toString() ?? '',
      storeId: storeId,
      storeName: storeName,
      storeDistanceKm: storeDistanceKm,
      storeDistanceFormatted: storeDistanceFormatted,
      title: title,
      description: json['description']?.toString() ?? '',
      price: displayPrice,
      discountPrice: displayDiscountPrice,
      rating: rating,
      categoryId: json['category_id']?.toString() ?? '',
      subcategoryId: json['subcategory_id']?.toString() ?? '',
      images: parsedImages,
      isFeatured: isFeatured,
      isOffer: isOffer,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      if (storeId != null) 'store_id': storeId,
      if (storeName != null) 'store_name': storeName,
      if (storeDistanceKm != null) 'store_distance_km': storeDistanceKm,
      if (storeDistanceFormatted != null) 'store_distance_formatted': storeDistanceFormatted,
      'title': title,
      'description': description,
      'price': price,
      'discount_price': discountPrice,
      'rating': rating,
      'category_id': categoryId,
      'subcategory_id': subcategoryId,
      'images': images,
      'is_featured': isFeatured,
      'is_offer': isOffer,
    };
  }
}
