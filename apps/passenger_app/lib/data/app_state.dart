import 'dart:async';
import 'package:flutter/material.dart';
import 'models/user_model.dart';
import 'models/product_model.dart';
import 'models/category_model.dart';
import 'models/order_model.dart';
import 'models/cart_item_model.dart';
import 'models/address_model.dart';
import 'models/chat_message_model.dart';
import 'mocks/mock_repositories.dart';

class AppState extends ChangeNotifier {
  bool isLoading = true;

  UserModel? currentUser;
  List<ProductModel> products = [];
  List<CategoryModel> categories = [];
  List<OrderModel> orders = [];
  List<AddressModel> addresses = [];
  List<CartItemModel> cart = [];
  List<ChatMessageModel> chatMessages = [];

  int currentNavIndex = 0;
  String searchQuery = '';
  String? selectedCategoryId;
  String? selectedSubcategoryId;

  AppState() {
    _initializeData();
  }

  Future<void> _initializeData() async {
    isLoading = true;
    notifyListeners();

    currentUser = await MockRepositories.fetchUser();
    products = await MockRepositories.fetchProducts();
    categories = await MockRepositories.fetchCategories();
    orders = await MockRepositories.fetchOrders();
    addresses = await MockRepositories.fetchAddresses();

    // Default mock cart items for immediate rich visualization
    if (products.isNotEmpty) {
      cart = [
        CartItemModel(product: products[0], quantity: 1),
        if (products.length > 1) CartItemModel(product: products[1], quantity: 2),
      ];
    }

    // Default mock chat messages
    chatMessages = [
      ChatMessageModel(
        id: 'msg-1',
        senderName: 'Carlos Mendoza',
        text: '¡Hola! Ya voy en camino con tu pedido ORD-9821.',
        timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
        isFromUser: false,
      ),
      ChatMessageModel(
        id: 'msg-2',
        senderName: 'Sofia Ramirez',
        text: '¡Perfecto! Gracias Carlos, te espero en la entrada.',
        timestamp: DateTime.now().subtract(const Duration(minutes: 3)),
        isFromUser: true,
      ),
    ];

    isLoading = false;
    notifyListeners();
  }

  void setNavIndex(int index) {
    currentNavIndex = index;
    notifyListeners();
  }

  void toggleUserRole() {
    if (currentUser == null) return;
    final newRole = currentUser!.role == UserRole.client
        ? UserRole.storeAdmin
        : UserRole.client;
    currentUser = currentUser!.copyWith(role: newRole);
    notifyListeners();
  }

  void setUserRole(UserRole role) {
    if (currentUser == null) return;
    currentUser = currentUser!.copyWith(role: role);
    notifyListeners();
  }

  void updatePreferredStore(String newStore) {
    if (currentUser == null) return;
    currentUser = currentUser!.copyWith(preferredStore: newStore);
    notifyListeners();
  }

  // Cart Operations
  void addToCart(ProductModel product, {int quantity = 1}) {
    final existingIndex = cart.indexWhere((item) => item.product.id == product.id);
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.add(CartItemModel(product: product, quantity: quantity));
    }
    notifyListeners();
  }

  void updateCartQuantity(String productId, int newQuantity) {
    final index = cart.indexWhere((item) => item.product.id == productId);
    if (index >= 0) {
      if (newQuantity <= 0) {
        cart.removeAt(index);
      } else {
        cart[index].quantity = newQuantity;
      }
      notifyListeners();
    }
  }

  void removeFromCart(String productId) {
    cart.removeWhere((item) => item.product.id == productId);
    notifyListeners();
  }

  void clearCart() {
    cart.clear();
    notifyListeners();
  }

  double get cartSubtotal {
    return cart.fold(0.0, (sum, item) => sum + item.totalPrice);
  }

  double get cartTax => cartSubtotal * 0.16; // 16% IVA
  double get cartShippingFee => cart.isEmpty ? 0.0 : 3.50;
  double get cartTotal => cartSubtotal + cartTax + cartShippingFee;

  // Address Operations
  AddressModel? get defaultAddress {
    return addresses.firstWhere(
      (addr) => addr.isDefault,
      orElse: () => addresses.isNotEmpty
          ? addresses.first
          : AddressModel(
              id: 'def',
              title: 'Casa',
              fullAddress: 'Av. Reforma #1234, Apt 4B',
              city: 'Ciudad de México',
            ),
    );
  }

  void addAddress(AddressModel newAddress) {
    addresses.add(newAddress);
    notifyListeners();
  }

  void setDefaultAddress(String addressId) {
    addresses = addresses.map((addr) {
      return addr.copyWith(isDefault: addr.id == addressId);
    }).toList();
    notifyListeners();
  }

  // Order Operations
  OrderModel? get activeTrackedOrder {
    return orders.firstWhere(
      (o) => o.status != OrderStatus.delivered,
      orElse: () => orders.first,
    );
  }

  OrderModel placeOrder({required AddressModel address}) {
    final newOrder = OrderModel(
      id: 'ORD-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
      orderDate: DateTime.now().toString().substring(0, 16),
      items: List.from(cart),
      subtotal: cartSubtotal,
      tax: cartTax,
      shippingFee: cartShippingFee,
      total: cartTotal,
      shippingAddress: '${address.fullAddress}, ${address.city}',
      status: OrderStatus.received,
      deliveryPerson: DeliveryPersonModel(
        name: 'Carlos Mendoza',
        role: 'Repartidor',
        vehicle: 'Motocicleta',
        plateNumber: 'ABC-123',
        rating: 4.8,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&q=80',
      ),
    );

    orders.insert(0, newOrder);
    clearCart();
    notifyListeners();
    return newOrder;
  }

  void updateOrderStatus(String orderId, OrderStatus newStatus) {
    final index = orders.indexWhere((o) => o.id == orderId);
    if (index >= 0) {
      orders[index].status = newStatus;
      notifyListeners();
    }
  }

  // Chat Operations
  void sendMessage(String text) {
    if (text.trim().isEmpty) return;

    final userMsg = ChatMessageModel(
      id: 'msg-${DateTime.now().millisecondsSinceEpoch}',
      senderName: currentUser?.name ?? 'Sofia Ramirez',
      text: text.trim(),
      timestamp: DateTime.now(),
      isFromUser: true,
    );

    chatMessages.add(userMsg);
    notifyListeners();

    // Auto response from Delivery Driver after 3 seconds
    Timer(const Duration(seconds: 3), () {
      final autoReplies = [
        '¡Entendido! Llego en unos 5 minutos.',
        'Gracias por la indicación, ya estoy cerca.',
        '¡Perfecto! Te aviso cuando esté afuera.',
      ];
      final autoText = autoReplies[chatMessages.length % autoReplies.length];

      chatMessages.add(ChatMessageModel(
        id: 'msg-auto-${DateTime.now().millisecondsSinceEpoch}',
        senderName: 'Carlos Mendoza',
        text: autoText,
        timestamp: DateTime.now(),
        isFromUser: false,
      ));
      notifyListeners();
    });
  }

  // Products & Offers Filter
  List<ProductModel> get offerProducts {
    return products.where((p) => p.isOffer).toList();
  }

  List<ProductModel> get featuredProducts {
    return products.where((p) => p.isFeatured).toList();
  }

  List<ProductModel> filterProductsByCategory(String categoryId, {String? subcategoryId}) {
    return products.where((p) {
      final matchCat = p.categoryId == categoryId;
      if (subcategoryId != null && subcategoryId.isNotEmpty) {
        return matchCat && p.subcategoryId == subcategoryId;
      }
      return matchCat;
    }).toList();
  }
}

class AppStateProvider extends InheritedNotifier<AppState> {
  const AppStateProvider({
    super.key,
    required AppState state,
    required super.child,
  }) : super(notifier: state);

  static AppState of(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<AppStateProvider>()!.notifier!;
  }
}
