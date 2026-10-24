import 'models/store_model.dart';
import 'models/promotion_model.dart';
import '../features/offers/promotion_repository.dart';
import '../features/stores/store_repository.dart';
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
import '../features/profile/address_repository.dart';
import '../features/categories/catalog_repository.dart';
import '../features/cart/cart_repository.dart';

class AppState extends ChangeNotifier {
  bool isLoading = true;

  final AddressRepository addressRepository = AddressRepository();
  final StoreRepository storeRepository = StoreRepository();
  StoreModel? activeStore;
  StoreModel? nearestStore;
  List<StoreModel> nearbyStores = [];
  bool isCalculatingNearestStore = false;

  final CatalogRepository catalogRepository = CatalogRepository();
  final CartRepository cartRepository = CartRepository();
  final PromotionRepository promotionRepository = PromotionRepository();
  List<PromotionModel> promotions = [];

  UserModel? currentUser;
  List<ProductModel> products = [];
  String? selectedStoreId;
  List<CategoryModel> categories = [];
  List<OrderModel> orders = [];
  List<AddressModel> addresses = [];
  List<CartItemModel> cart = [];
  List<ChatMessageModel> chatMessages = [];

  int currentNavIndex = 0;
  String searchQuery = '';
  List<ProductModel> searchResults = [];
  bool isSearching = false;
  bool searchMatchedInSelectedStore = true;
  bool searchExpandedToOtherStores = false;
  String? searchNearestStoreName;
  String? searchNearestStoreDistance;
  String? selectedCategoryId;
  String? selectedSubcategoryId;
  Timer? _debounceTimer;

  AppState() {
    _initializeData();
  }

  Future<void> _initializeData() async {
    isLoading = true;
    notifyListeners();

    currentUser = await MockRepositories.fetchUser();
    categories = await catalogRepository.getCategories();
    promotions = await promotionRepository.getPromotions(storeId: selectedStoreId);
    products = await catalogRepository.getProducts();
    orders = await MockRepositories.fetchOrders();
    final apiAddresses = await addressRepository.getAddresses();
    if (apiAddresses.isNotEmpty) {
      addresses = apiAddresses;
    } else {
      addresses = await MockRepositories.fetchAddresses();
    }
    if (addresses.isNotEmpty && _selectedAddress == null) {
      _selectedAddress = addresses.firstWhere((a) => a.isDefault, orElse: () => addresses.first);
    }

    // Identificar automáticamente la tienda más cercana a la dirección activa
    final activeLat = activeDeliveryAddress.latitude;
    final activeLng = activeDeliveryAddress.longitude;
    await updateNearestStore(latitude: activeLat, longitude: activeLng);

    if (products.isNotEmpty) {
      cart = [
        CartItemModel(product: products[0], quantity: 1),
        if (products.length > 1) CartItemModel(product: products[1], quantity: 2),
      ];
    }

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

  void onSearchChanged(String query) {
    searchQuery = query;

    if (query.trim().isEmpty) {
      searchResults = [];
      isSearching = false;
      searchMatchedInSelectedStore = true;
      searchExpandedToOtherStores = false;
      searchNearestStoreName = null;
      searchNearestStoreDistance = null;
      notifyListeners();
      return;
    }

    isSearching = true;
    notifyListeners();

    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 300), () async {
      if (query.trim().isNotEmpty) {
        final double? userLat = defaultAddress != null ? 6.244203 : (activeStore?.latitude ?? 6.208571);
        final double? userLng = defaultAddress != null ? -75.592582 : (activeStore?.longitude ?? -75.568434);

        final result = await catalogRepository.searchProducts(
          query: query.trim(),
          storeId: activeStore?.id,
          userLat: userLat,
          userLng: userLng,
        );

        searchResults = result.products;
        searchMatchedInSelectedStore = result.matchedInSelectedStore;
        searchExpandedToOtherStores = result.expandedToOtherStores;
        searchNearestStoreName = result.nearestStoreName;
        searchNearestStoreDistance = result.nearestStoreDistance;
        isSearching = false;
        notifyListeners();
      } else {
        searchResults = [];
        isSearching = false;
        notifyListeners();
      }
    });
  }

  void clearSearch() {
    searchQuery = '';
    searchResults = [];
    isSearching = false;
    searchMatchedInSelectedStore = true;
    searchExpandedToOtherStores = false;
    searchNearestStoreName = null;
    searchNearestStoreDistance = null;
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
    cartRepository.addItem(product.id, quantity);
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
      cartRepository.updateItemQuantity(productId, newQuantity);
    }
  }

  void removeFromCart(String productId) {
    cart.removeWhere((item) => item.product.id == productId);
    notifyListeners();
    cartRepository.removeItem(productId);
  }

  void clearCart() {
    cart.clear();
    notifyListeners();
    cartRepository.clearCart();
  }

  double get cartSubtotal {
    return cart.fold(0.0, (sum, item) => sum + item.totalPrice);
  }

  double get cartTax => cartSubtotal * 0.16; // 16% IVA
  double get cartShippingFee => cart.isEmpty ? 0.0 : 2.50; // .50 Delivery standard
  double get cartTotal => cartSubtotal + cartTax + cartShippingFee;

  // Address Operations
  AddressModel? _selectedAddress;

  AddressModel get activeDeliveryAddress {
    if (_selectedAddress != null) return _selectedAddress!;
    if (addresses.isNotEmpty) {
      final active = addresses.firstWhere(
        (addr) => addr.isDefault,
        orElse: () => addresses.first,
      );
      return active;
    }
    return AddressModel(
      id: 'current-loc',
      title: 'Ubicación actual',
      fullAddress: 'Detectando ubicación GPS...',
      city: 'Likora Central',
      latitude: 19.4326,
      longitude: -99.1332,
      isDefault: true,
    );
  }

  AddressModel? get defaultAddress => activeDeliveryAddress;

    void selectAddress(AddressModel address) {
    _selectedAddress = address;
    setDefaultAddress(address.id);
    updateNearestStore(latitude: address.latitude, longitude: address.longitude);
  }

  void selectCurrentLocation({
    required double latitude,
    required double longitude,
    String? addressText,
    String? city,
  }) {
    final locAddress = AddressModel(
      id: 'curr-gps-${DateTime.now().millisecondsSinceEpoch}',
      title: 'Ubicación actual',
      fullAddress: addressText ?? 'Ubicación detectada por GPS',
      city: city ?? 'Zona Actual',
      latitude: latitude,
      longitude: longitude,
      isDefault: true,
    );

    final existingIdx = addresses.indexWhere((a) => a.title == 'Ubicación actual');
    if (existingIdx != -1) {
      addresses[existingIdx] = locAddress;
    } else {
      addresses.insert(0, locAddress);
    }

    _selectedAddress = locAddress;
    updateNearestStore(latitude: latitude, longitude: longitude);
    addresses = addresses.map((a) => a.copyWith(isDefault: a.id == locAddress.id)).toList();
    notifyListeners();
  }

  void addAddress(AddressModel newAddress) {
    if (newAddress.isDefault) {
      addresses = addresses.map((addr) => addr.copyWith(isDefault: false)).toList();
      _selectedAddress = newAddress;
    }
    addresses.add(newAddress);
    notifyListeners();
    addressRepository.createAddress(
      alias: newAddress.title,
      streetAddress: newAddress.fullAddress,
      reference: newAddress.details,
      city: newAddress.city,
      latitude: newAddress.latitude,
      longitude: newAddress.longitude,
      isActive: newAddress.isDefault,
    );
  }

  void updateAddress(AddressModel updatedAddress) {
    final idx = addresses.indexWhere((addr) => addr.id == updatedAddress.id);
    if (idx != -1) {
      if (updatedAddress.isDefault) {
        addresses = addresses.map((addr) => addr.copyWith(isDefault: false)).toList();
        _selectedAddress = updatedAddress;
      }
      addresses[idx] = updatedAddress;
      if (_selectedAddress?.id == updatedAddress.id) {
        _selectedAddress = updatedAddress;
      }
      notifyListeners();
      addressRepository.updateAddress(
        id: updatedAddress.id,
        alias: updatedAddress.title,
        streetAddress: updatedAddress.fullAddress,
        reference: updatedAddress.details,
        city: updatedAddress.city,
        latitude: updatedAddress.latitude,
        longitude: updatedAddress.longitude,
        isActive: updatedAddress.isDefault,
      );
    }
  }

  void setDefaultAddress(String addressId) {
    addresses = addresses.map((addr) {
      final isDef = addr.id == addressId;
      if (isDef) _selectedAddress = addr;
      return addr.copyWith(isDefault: isDef);
    }).toList();
    notifyListeners();
    addressRepository.setActiveAddress(addressId);
  }

  void removeAddress(String addressId) {
    final wasDefault = _selectedAddress?.id == addressId || addresses.any((a) => a.id == addressId && a.isDefault);
    addresses.removeWhere((addr) => addr.id == addressId);
    if (wasDefault && addresses.isNotEmpty) {
      addresses[0] = addresses[0].copyWith(isDefault: true);
      _selectedAddress = addresses[0];
    } else if (addresses.isEmpty) {
      _selectedAddress = null;
    }
    notifyListeners();
    addressRepository.deleteAddress(addressId);
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
      id: 'ORD-',
      orderDate: DateTime.now().toString().substring(0, 16),
      items: List.from(cart),
      subtotal: cartSubtotal,
      tax: cartTax,
      shippingFee: cartShippingFee,
      total: cartTotal,
      shippingAddress: ', ',
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
      id: 'msg-',
      senderName: currentUser?.name ?? 'Sofia Ramirez',
      text: text.trim(),
      timestamp: DateTime.now(),
      isFromUser: true,
    );

    chatMessages.add(userMsg);
    notifyListeners();

    Timer(const Duration(seconds: 3), () {
      final autoReplies = [
        '¡Entendido! Llego en unos 5 minutos.',
        'Gracias por la indicación, ya estoy cerca.',
        '¡Perfecto! Te aviso cuando esté afuera.',
      ];
      final autoText = autoReplies[chatMessages.length % autoReplies.length];

      chatMessages.add(ChatMessageModel(
        id: 'msg-auto-',
        senderName: 'Carlos Mendoza',
        text: autoText,
        timestamp: DateTime.now(),
        isFromUser: false,
      ));
      notifyListeners();
    });
  }


  Future<void> updateNearestStore({double? latitude, double? longitude}) async {
    final double lat = latitude ?? (activeDeliveryAddress.latitude ?? 6.2442);
    final double lng = longitude ?? (activeDeliveryAddress.longitude ?? -75.5925);

    isCalculatingNearestStore = true;
    notifyListeners();

    try {
      final result = await storeRepository.getNearestStore(latitude: lat, longitude: lng);
      if (result != null) {
        nearestStore = result.nearestStore;
        nearbyStores = result.stores;
        activeStore = result.nearestStore;
        selectedStoreId = result.nearestStore.id;
        
        debugPrint('🎯 [AppState] Tienda asignada automáticamente: ${result.nearestStore.name} (${result.nearestStore.distanceFormatted})');
        await refreshCatalog(storeId: selectedStoreId);
      }
    } catch (e) {
      debugPrint('⚠️ [AppState] Error al identificar tienda más cercana: $e');
    } finally {
      isCalculatingNearestStore = false;
      notifyListeners();
    }
  }

  Future<void> selectStoreManually(StoreModel store) async {
    activeStore = store;
    selectedStoreId = store.id;
    debugPrint('👉 [AppState] Tienda seleccionada manualmente: ${store.name}');
    await refreshCatalog(storeId: store.id);
    notifyListeners();
  }

  Future<void> selectStore(String? storeId) async {
    selectedStoreId = storeId;
    await refreshCatalog(storeId: storeId);
  }

  Future<void> refreshCatalog({String? storeId}) async {
    final effectiveStoreId = storeId ?? selectedStoreId;
    final newCategories = await catalogRepository.getCategories(storeId: effectiveStoreId);
    final newProducts = await catalogRepository.getProducts(storeId: effectiveStoreId);
    if (newCategories.isNotEmpty) categories = newCategories;
    if (newProducts.isNotEmpty) products = newProducts;
    final newPromos = await promotionRepository.getPromotions(storeId: effectiveStoreId);
    if (newPromos.isNotEmpty) promotions = newPromos;
    notifyListeners();
  }


  Future<void> fetchPromotions({String? storeId}) async {
    final effectiveStoreId = storeId ?? selectedStoreId ?? activeStore?.id;
    final list = await promotionRepository.getPromotions(storeId: effectiveStoreId);
    if (list.isNotEmpty) {
      promotions = list;
      notifyListeners();
    }
  }

  // Products & Offers Filter
  List<ProductModel> get offerProducts {
    final list = products.where((p) => p.isOffer).toList();
    if (list.isNotEmpty) return list;
    final discounted = products.where((p) => p.discountPrice != null).toList();
    if (discounted.isNotEmpty) return discounted;
    return products.take(6).toList();
  }

  List<ProductModel> get featuredProducts {
    final list = products.where((p) => p.isFeatured).toList();
    if (list.isNotEmpty) return list;
    return products.take(10).toList();
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

  @override
  void dispose() {
    _debounceTimer?.cancel();
    super.dispose();
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
