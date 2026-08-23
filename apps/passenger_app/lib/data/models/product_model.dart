class ProductModel {
  final String id;
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
    return ProductModel(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      price: (json['price'] as num).toDouble(),
      discountPrice: json['discount_price'] != null ? (json['discount_price'] as num).toDouble() : null,
      rating: (json['rating'] as num).toDouble(),
      categoryId: json['category_id'] ?? '',
      subcategoryId: json['subcategory_id'] ?? '',
      images: List<String>.from(json['images'] ?? []),
      isFeatured: json['is_featured'] ?? false,
      isOffer: json['is_offer'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
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
