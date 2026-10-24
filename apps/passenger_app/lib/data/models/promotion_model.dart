import 'package:flutter/material.dart';

class PromotionModel {
  final String id;
  final String title;
  final String? subtitle;
  final String buttonText;
  final String? imageUrl;
  final Color gradientColor1;
  final Color gradientColor2;
  final double? discountPercentage;
  final String? discountCode;
  final String? storeId;
  final String? categoryId;
  final bool isActive;
  final int priority;

  PromotionModel({
    required this.id,
    required this.title,
    this.subtitle,
    this.buttonText = 'Ver Promociones',
    this.imageUrl,
    this.gradientColor1 = const Color(0xFF5A189A),
    this.gradientColor2 = const Color(0xFF7B2CBF),
    this.discountPercentage,
    this.discountCode,
    this.storeId,
    this.categoryId,
    this.isActive = true,
    this.priority = 1,
  });

  static Color _parseHexColor(dynamic hex, Color defaultColor) {
    if (hex == null || hex is! String || hex.isEmpty) return defaultColor;
    var cleaned = hex.replaceAll('#', '').trim();
    if (cleaned.length == 6) {
      cleaned = 'FF$cleaned';
    }
    final int? value = int.tryParse(cleaned, radix: 16);
    return value != null ? Color(value) : defaultColor;
  }

  factory PromotionModel.fromJson(Map<String, dynamic> json) {
    double? parseDouble(dynamic v) {
      if (v == null) return null;
      if (v is num) return v.toDouble();
      if (v is String) return double.tryParse(v);
      return null;
    }

    return PromotionModel(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      subtitle: json['subtitle']?.toString(),
      buttonText: json['button_text']?.toString() ?? 'Ver Promociones',
      imageUrl: json['image_url']?.toString(),
      gradientColor1: _parseHexColor(json['gradient_color1'], const Color(0xFF5A189A)),
      gradientColor2: _parseHexColor(json['gradient_color2'], const Color(0xFF7B2CBF)),
      discountPercentage: parseDouble(json['discount_percentage']),
      discountCode: json['discount_code']?.toString(),
      storeId: json['store_id']?.toString(),
      categoryId: json['category_id']?.toString(),
      isActive: json['is_active'] != false,
      priority: json['priority'] is int ? json['priority'] : int.tryParse('${json['priority']}') ?? 1,
    );
  }

  static List<PromotionModel> fallbacks() {
    return [
      PromotionModel(
        id: 'p1',
        title: 'Punto de Venta Central',
        subtitle: '20% OFF en selección de Vinos Tintos Reserva y Cavas',
        buttonText: 'Ver Promociones',
        gradientColor1: const Color(0xFF5A189A),
        gradientColor2: const Color(0xFF7B2CBF),
        discountPercentage: 20.0,
        discountCode: 'VINOS20',
      ),
      PromotionModel(
        id: 'p2',
        title: 'Festival Cervecero IPA',
        subtitle: 'Lleva 4 Cervezas Artesanales por el precio de 3',
        buttonText: 'Aprovechar Oferta',
        gradientColor1: const Color(0xFF3C096C),
        gradientColor2: const Color(0xFF5A189A),
        discountPercentage: 25.0,
        discountCode: 'IPA4X3',
      ),
      PromotionModel(
        id: 'p3',
        title: 'Noche de Tequilas & Mezcal',
        subtitle: 'Hasta 30% OFF en marcas seleccionadas Don Julio y Maestro Dobel',
        buttonText: 'Comprar Ahora',
        gradientColor1: const Color(0xFF10002B),
        gradientColor2: const Color(0xFF240046),
        discountPercentage: 30.0,
        discountCode: 'TEQUILA30',
      ),
    ];
  }
}
