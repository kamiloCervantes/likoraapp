class SubcategoryModel {
  final String id;
  final String? storeId;
  final String name;
  final String? icon;

  SubcategoryModel({
    required this.id,
    this.storeId,
    required this.name,
    this.icon,
  });

  factory SubcategoryModel.fromJson(Map<String, dynamic> json) {
    return SubcategoryModel(
      id: json['id']?.toString() ?? '',
      storeId: json['store_id']?.toString(),
      name: json['name']?.toString() ?? '',
      icon: json['icon']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      if (storeId != null) 'store_id': storeId,
      'name': name,
      if (icon != null) 'icon': icon,
    };
  }
}

class CategoryModel {
  final String id;
  final String? storeId;
  final String? storeName;
  final String name;
  final String icon;
  final String? slug;
  final String? description;
  final String? imageUrl;
  final List<SubcategoryModel> subcategories;

  CategoryModel({
    required this.id,
    this.storeId,
    this.storeName,
    required this.name,
    required this.icon,
    this.slug,
    this.description,
    this.imageUrl,
    required this.subcategories,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    final storeId = json['store_id']?.toString() ??
        (json['store'] is Map ? json['store']['id']?.toString() : null);
    final storeName = json['store'] is Map ? json['store']['name']?.toString() : null;

    return CategoryModel(
      id: json['id']?.toString() ?? '',
      storeId: storeId,
      storeName: storeName,
      name: json['name']?.toString() ?? '',
      icon: json['icon']?.toString() ?? 'local_bar',
      slug: json['slug']?.toString(),
      description: json['description']?.toString(),
      imageUrl: json['image_url']?.toString(),
      subcategories: (json['subcategories'] as List<dynamic>?)
              ?.map((sub) => SubcategoryModel.fromJson(
                  sub is Map<String, dynamic> ? sub : Map<String, dynamic>.from(sub)))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      if (storeId != null) 'store_id': storeId,
      if (storeName != null) 'store_name': storeName,
      'name': name,
      'icon': icon,
      if (slug != null) 'slug': slug,
      if (description != null) 'description': description,
      if (imageUrl != null) 'image_url': imageUrl,
      'subcategories': subcategories.map((sub) => sub.toJson()).toList(),
    };
  }
}
