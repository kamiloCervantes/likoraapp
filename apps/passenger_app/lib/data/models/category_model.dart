class SubcategoryModel {
  final String id;
  final String name;

  SubcategoryModel({
    required this.id,
    required this.name,
  });

  factory SubcategoryModel.fromJson(Map<String, dynamic> json) {
    return SubcategoryModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
    };
  }
}

class CategoryModel {
  final String id;
  final String name;
  final String icon;
  final List<SubcategoryModel> subcategories;

  CategoryModel({
    required this.id,
    required this.name,
    required this.icon,
    required this.subcategories,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      icon: json['icon'] ?? 'local_bar',
      subcategories: (json['subcategories'] as List<dynamic>?)
              ?.map((sub) => SubcategoryModel.fromJson(sub))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'icon': icon,
      'subcategories': subcategories.map((sub) => sub.toJson()).toList(),
    };
  }
}
