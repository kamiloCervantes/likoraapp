import 'cart_item_model.dart';

enum OrderStatus { received, inPreparation, onTheWay, delivered }

extension OrderStatusX on OrderStatus {
  String get label {
    switch (this) {
      case OrderStatus.received:
        return 'Pedido Recibido';
      case OrderStatus.inPreparation:
        return 'En Preparación';
      case OrderStatus.onTheWay:
        return 'En Camino';
      case OrderStatus.delivered:
        return 'Entregado';
    }
  }

  static OrderStatus fromString(String statusStr) {
    switch (statusStr.toLowerCase()) {
      case 'received':
      case 'pedido recibido':
        return OrderStatus.received;
      case 'in_preparation':
      case 'en preparación':
      case 'en preparacion':
        return OrderStatus.inPreparation;
      case 'on_the_way':
      case 'en camino':
        return OrderStatus.onTheWay;
      case 'delivered':
      case 'entregado':
        return OrderStatus.delivered;
      default:
        return OrderStatus.received;
    }
  }
}

class DeliveryPersonModel {
  final String name;
  final String role;
  final String vehicle;
  final String plateNumber;
  final double rating;
  final String avatarUrl;

  DeliveryPersonModel({
    required this.name,
    this.role = 'Repartidor',
    required this.vehicle,
    required this.plateNumber,
    required this.rating,
    required this.avatarUrl,
  });

  factory DeliveryPersonModel.fromJson(Map<String, dynamic> json) {
    return DeliveryPersonModel(
      name: json['name'] ?? 'Carlos Mendoza',
      role: json['role'] ?? 'Repartidor',
      vehicle: json['vehicle'] ?? 'Motocicleta',
      plateNumber: json['plate_number'] ?? 'ABC-123',
      rating: (json['rating'] as num?)?.toDouble() ?? 4.5,
      avatarUrl: json['avatar_url'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'role': role,
      'vehicle': vehicle,
      'plate_number': plateNumber,
      'rating': rating,
      'avatar_url': avatarUrl,
    };
  }
}

class OrderModel {
  final String id;
  final String orderDate;
  final List<CartItemModel> items;
  final double subtotal;
  final double tax;
  final double shippingFee;
  final double total;
  final String shippingAddress;
  OrderStatus status;
  final DeliveryPersonModel? deliveryPerson;

  OrderModel({
    required this.id,
    required this.orderDate,
    required this.items,
    required this.subtotal,
    required this.tax,
    required this.shippingFee,
    required this.total,
    required this.shippingAddress,
    this.status = OrderStatus.received,
    this.deliveryPerson,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    return OrderModel(
      id: json['id'] ?? '',
      orderDate: json['order_date'] ?? '',
      items: (json['items'] as List<dynamic>?)
              ?.map((item) => CartItemModel.fromJson(item))
              .toList() ??
          [],
      subtotal: (json['subtotal'] as num).toDouble(),
      tax: (json['tax'] as num).toDouble(),
      shippingFee: (json['shipping_fee'] as num).toDouble(),
      total: (json['total'] as num).toDouble(),
      shippingAddress: json['shipping_address'] ?? '',
      status: OrderStatusX.fromString(json['status'] ?? 'received'),
      deliveryPerson: json['delivery_person'] != null
          ? DeliveryPersonModel.fromJson(json['delivery_person'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'order_date': orderDate,
      'items': items.map((item) => item.toJson()).toList(),
      'subtotal': subtotal,
      'tax': tax,
      'shipping_fee': shippingFee,
      'total': total,
      'shipping_address': shippingAddress,
      'status': status.name,
      'delivery_person': deliveryPerson?.toJson(),
    };
  }
}
