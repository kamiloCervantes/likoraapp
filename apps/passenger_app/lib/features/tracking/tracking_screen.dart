import 'dart:async';
import 'dart:convert';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/app_routes.dart';
import '../../core/services/api_client.dart';
import '../../data/app_state.dart';
import '../../data/models/order_model.dart';

class TrackingScreen extends StatefulWidget {
  const TrackingScreen({super.key});

  @override
  State<TrackingScreen> createState() => _TrackingScreenState();
}

class _TrackingScreenState extends State<TrackingScreen> {
  GoogleMapController? _mapController;

  // Driver GPS live simulation & tracking state
  late LatLng _storeLocation;
  late LatLng _deliveryLocation;
  late LatLng _driverLocation;
  double _routeProgress = 0.35; // 35% of the way to destination
  int _estimatedMinutes = 8;
  double _distanceRemainingKm = 1.4;

  Timer? _trackingTimer;
  MapType _currentMapType = MapType.normal;
  bool _isLiveTrackingActive = true;
  int _updateIntervalSec = 4;
  String _mapsApiKey = '';

  @override
  void initState() {
    super.initState();
    // Default Medellín coordinates
    _storeLocation = const LatLng(6.208571, -75.568434); // Likora El Poblado
    _deliveryLocation = const LatLng(6.234200, -75.589500); // User delivery address
    _driverLocation = _calculateInterpolatedPosition(_routeProgress);

    _fetchMapsConfigFromAdmin();
    _startLiveTrackingSimulation();
  }

  @override
  void dispose() {
    _trackingTimer?.cancel();
    _mapController?.dispose();
    super.dispose();
  }

  // Fetch active credentials and live tracking parameters configured in the Admin
  Future<void> _fetchMapsConfigFromAdmin() async {
    try {
      final res = await ApiClient.get('/config/maps');
      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        if (body['data'] != null) {
          final data = body['data'];
          setState(() {
            _mapsApiKey = data['api_key_android'] ?? data['api_key_web'] ?? '';
            _isLiveTrackingActive = data['is_live_tracking_enabled'] != false;
            _updateIntervalSec = data['gps_update_interval_sec'] ?? 4;
          });
          debugPrint('🗺️ [TrackingScreen] Credenciales de Google Maps sincronizadas desde Admin: ${_mapsApiKey.isNotEmpty ? "Configurada" : "Pendiente"}');
        }
      }
    } catch (e) {
      debugPrint('ℹ️ [TrackingScreen] Usando configuración local predeterminada para Google Maps: $e');
    }
  }

  // Calculate coordinates along route from store to delivery destination
  LatLng _calculateInterpolatedPosition(double progress) {
    final lat = _storeLocation.latitude + (_deliveryLocation.latitude - _storeLocation.latitude) * progress;
    final lng = _storeLocation.longitude + (_deliveryLocation.longitude - _storeLocation.longitude) * progress;
    // Add small realistic curvature offset for city roads
    final curveOffset = math.sin(progress * math.pi) * 0.0035;
    return LatLng(lat + curveOffset, lng);
  }

  // Periodic driver movement sync (retrieves real live GPS broadcasts from driver app or fallback simulation)
  void _startLiveTrackingSimulation() {
    _trackingTimer = Timer.periodic(Duration(seconds: _updateIntervalSec), (timer) async {
      if (!_isLiveTrackingActive || !mounted) return;

      bool fetchedFromDriverApp = false;
      try {
        final res = await ApiClient.get('/tracking/driver-location/ORD-8492');
        if (res.statusCode == 200) {
          final body = jsonDecode(res.body);
          if (body['data'] != null && body['data']['latitude'] != null) {
            final lat = (body['data']['latitude'] as num).toDouble();
            final lng = (body['data']['longitude'] as num).toDouble();
            if (mounted) {
              setState(() {
                _driverLocation = LatLng(lat, lng);
              });
              fetchedFromDriverApp = true;
            }
          }
        }
      } catch (_) {}

      if (!fetchedFromDriverApp && mounted) {
        setState(() {
          if (_routeProgress < 0.98) {
            _routeProgress += 0.025; // Advance driver along route
            _driverLocation = _calculateInterpolatedPosition(_routeProgress);

            // Update remaining metrics dynamically
            final remainingRatio = (1.0 - _routeProgress).clamp(0.0, 1.0);
            _distanceRemainingKm = double.parse((remainingRatio * 3.2).toStringAsFixed(1));
            _estimatedMinutes = math.max(1, (remainingRatio * 14).round());
          } else {
            _routeProgress = 0.99;
            _distanceRemainingKm = 0.1;
            _estimatedMinutes = 1;
          }
        });
      }

      // Smoothly animate map camera towards new driver position
      _mapController?.animateCamera(
        CameraUpdate.newLatLng(_driverLocation),
      );
    });
  }

  Set<Marker> _buildMarkers(DeliveryPersonModel? driver) {
    return {
      // 1. Driver in movement marker
      Marker(
        markerId: const MarkerId('driver_marker'),
        position: _driverLocation,
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
        infoWindow: InfoWindow(
          title: driver?.name ?? 'Carlos Mendoza (Conductor Likora)',
          snippet: '$_estimatedMinutes min restantes • $_distanceRemainingKm km',
        ),
      ),
      // 2. Dispatch store origin marker
      Marker(
        markerId: const MarkerId('store_marker'),
        position: _storeLocation,
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueViolet),
        infoWindow: const InfoWindow(
          title: 'Likora Boutique (Origen)',
          snippet: 'Punto de despacho y preparación',
        ),
      ),
      // 3. Client delivery destination marker
      Marker(
        markerId: const MarkerId('destination_marker'),
        position: _deliveryLocation,
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
        infoWindow: const InfoWindow(
          title: 'Tu Dirección de Entrega',
          snippet: 'Destino final del pedido',
        ),
      ),
    };
  }

  Set<Polyline> _buildPolylines() {
    // Generate route waypoints connecting store, driver, and destination
    final List<LatLng> points = [];
    for (double p = 0.0; p <= 1.0; p += 0.05) {
      points.add(_calculateInterpolatedPosition(p));
    }
    points.add(_deliveryLocation);

    return {
      Polyline(
        polylineId: const PolylineId('delivery_route'),
        points: points,
        color: AppColors.primary,
        width: 5,
        startCap: Cap.roundCap,
        endCap: Cap.roundCap,
      ),
    };
  }

  void _recenterOnDriver() {
    _mapController?.animateCamera(
      CameraUpdate.newCameraPosition(
        CameraPosition(
          target: _driverLocation,
          zoom: 15.5,
          tilt: 35.0,
        ),
      ),
    );
  }

  void _fitRouteBounds() {
    final southwest = LatLng(
      math.min(_storeLocation.latitude, _deliveryLocation.latitude) - 0.005,
      math.min(_storeLocation.longitude, _deliveryLocation.longitude) - 0.005,
    );
    final northeast = LatLng(
      math.max(_storeLocation.latitude, _deliveryLocation.latitude) + 0.005,
      math.max(_storeLocation.longitude, _deliveryLocation.longitude) + 0.005,
    );

    _mapController?.animateCamera(
      CameraUpdate.newLatLngBounds(
        LatLngBounds(southwest: southwest, northeast: northeast),
        50,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final appState = AppStateProvider.of(context);
    final activeOrder = appState.activeTrackedOrder ??
        OrderModel(
          id: 'ORD-9821',
          orderDate: '2026-10-08 10:15',
          items: [],
          subtotal: 58.00,
          tax: 9.28,
          shippingFee: 3.50,
          total: 70.78,
          shippingAddress: appState.activeDeliveryAddress.fullAddress,
          status: OrderStatus.onTheWay,
          deliveryPerson: DeliveryPersonModel(
            name: 'Carlos Mendoza',
            role: 'Repartidor Certificado',
            vehicle: 'Motocicleta Yamaha 150',
            plateNumber: 'LIK-204',
            rating: 4.9,
            avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&q=80',
          ),
        );

    final driver = activeOrder.deliveryPerson;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Seguimiento del Conductor'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: Icon(
              _currentMapType == MapType.normal ? Icons.layers_outlined : Icons.layers_rounded,
              color: AppColors.primary,
            ),
            tooltip: 'Cambiar tipo de mapa',
            onPressed: () {
              setState(() {
                _currentMapType = _currentMapType == MapType.normal ? MapType.hybrid : MapType.normal;
              });
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Google Maps Container with Interactive Live Tracking
          Expanded(
            flex: 5,
            child: Stack(
              children: [
                // Google Map View
                GoogleMap(
                  mapType: _currentMapType,
                  initialCameraPosition: CameraPosition(
                    target: _driverLocation,
                    zoom: 14.8,
                  ),
                  onMapCreated: (controller) {
                    _mapController = controller;
                  },
                  markers: _buildMarkers(driver),
                  polylines: _buildPolylines(),
                  myLocationEnabled: false,
                  myLocationButtonEnabled: false,
                  zoomControlsEnabled: false,
                  compassEnabled: true,
                  mapToolbarEnabled: false,
                ),

                // Top Live Tracking Floating Indicator Badge
                Positioned(
                  top: 14,
                  left: 16,
                  right: 16,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: AppColors.cardBg.withValues(alpha: 0.92),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.primary.withValues(alpha: 0.5)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.35),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 10,
                          height: 10,
                          decoration: const BoxDecoration(
                            color: Colors.greenAccent,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    driver?.name ?? 'Carlos Mendoza',
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                                  ),
                                  const SizedBox(width: 6),
                                  const Text('• En Camino', style: TextStyle(color: Colors.greenAccent, fontSize: 11, fontWeight: FontWeight.bold)),
                                ],
                              ),
                              Text(
                                'A $_estimatedMinutes minutos ($_distanceRemainingKm km restantes)',
                                style: const TextStyle(color: AppColors.primary, fontSize: 11, fontWeight: FontWeight.w600),
                              ),
                            ],
                          ),
                        ),
                        // Live GPS pulse icon
                        Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(Icons.navigation_rounded, color: AppColors.primary, size: 18),
                        ),
                      ],
                    ),
                  ),
                ),

                // Floating Action Controls (Recenter & Fit Route)
                Positioned(
                  right: 16,
                  bottom: 16,
                  child: Column(
                    children: [
                      FloatingActionButton.small(
                        heroTag: 'fit_bounds',
                        backgroundColor: AppColors.cardBg,
                        foregroundColor: Colors.white,
                        onPressed: _fitRouteBounds,
                        tooltip: 'Ver ruta completa',
                        child: const Icon(Icons.alt_route_rounded, size: 20),
                      ),
                      const SizedBox(height: 8),
                      FloatingActionButton.small(
                        heroTag: 'recenter_driver',
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.black,
                        onPressed: _recenterOnDriver,
                        tooltip: 'Centrar en el conductor',
                        child: const Icon(Icons.two_wheeler_rounded, size: 22),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Bottom Sheet: Driver Info, Vehicle Details & Delivery Progress Stepper
          Expanded(
            flex: 5,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(24, 16, 24, 16),
              decoration: const BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Handle Bar
                    Center(
                      child: Container(
                        width: 40,
                        height: 4,
                        decoration: BoxDecoration(
                          color: AppColors.border,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Driver info card (Carlos Mendoza)
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 26,
                          backgroundColor: AppColors.cardBg,
                          backgroundImage: driver?.avatarUrl != null && driver!.avatarUrl.isNotEmpty
                              ? NetworkImage(driver.avatarUrl)
                              : null,
                          child: driver?.avatarUrl == null || driver!.avatarUrl.isEmpty
                              ? const Icon(Icons.person, color: Colors.white)
                              : null,
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                driver?.name ?? 'Carlos Mendoza',
                                style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 16),
                              ),
                              Text(
                                driver?.role ?? 'Repartidor Certificado',
                                style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                              ),
                            ],
                          ),
                        ),
                        ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            foregroundColor: Colors.black,
                            minimumSize: const Size(100, 40),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          icon: const Icon(Icons.chat_bubble_outline_rounded, size: 16),
                          label: const Text('Chat', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                          onPressed: () => Navigator.pushNamed(context, AppRoutes.chat),
                        ),
                      ],
                    ),

                    const SizedBox(height: 16),

                    // Driver metrics grid (Vehículo, Placas, Ranking)
                    Row(
                      children: [
                        Expanded(child: _buildMetricTile(Icons.two_wheeler_rounded, driver?.vehicle ?? 'Motocicleta', 'Vehículo')),
                        const SizedBox(width: 10),
                        Expanded(child: _buildMetricTile(Icons.badge_outlined, driver?.plateNumber ?? 'LIK-204', 'Placas')),
                        const SizedBox(width: 10),
                        Expanded(child: _buildMetricTile(Icons.star_rounded, '${driver?.rating ?? 4.9} estrellas', 'Calificación')),
                      ],
                    ),

                    const SizedBox(height: 20),

                    // Order Status Stepper
                    const Text(
                      'Progreso de Entrega',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                    const SizedBox(height: 14),

                    _buildStepRow(
                      icon: Icons.check_circle_rounded,
                      title: 'Despachado de Bodega Likora',
                      subtitle: 'Paquete sellado y verificado',
                      isCompleted: true,
                      isActive: false,
                    ),
                    _buildStepLine(isCompleted: true),
                    _buildStepRow(
                      icon: Icons.two_wheeler_rounded,
                      title: 'En Camino hacia tu Destino',
                      subtitle: 'Conductor rastreado vía Google Maps GPS',
                      isCompleted: false,
                      isActive: true,
                    ),
                    _buildStepLine(isCompleted: false),
                    _buildStepRow(
                      icon: Icons.home_rounded,
                      title: 'Entrega en Dirección',
                      subtitle: activeOrder.shippingAddress,
                      isCompleted: false,
                      isActive: false,
                    ),

                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricTile(IconData icon, String title, String subtitle) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Icon(icon, color: AppColors.primary, size: 20),
          const SizedBox(height: 4),
          Text(
            title,
            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          Text(
            subtitle,
            style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
          ),
        ],
      ),
    );
  }

  Widget _buildStepRow({
    required IconData icon,
    required String title,
    String? subtitle,
    required bool isCompleted,
    required bool isActive,
  }) {
    Color color = AppColors.textMuted;
    if (isCompleted) color = AppColors.success;
    if (isActive) color = AppColors.primary;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: color, size: 22),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(
                  color: isActive || isCompleted ? Colors.white : AppColors.textMuted,
                  fontWeight: isActive ? FontWeight.bold : FontWeight.w600,
                  fontSize: 14,
                ),
              ),
              if (subtitle != null) ...[
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStepLine({required bool isCompleted}) {
    return Container(
      margin: const EdgeInsets.only(left: 10, top: 3, bottom: 3),
      width: 2,
      height: 18,
      color: isCompleted ? AppColors.success : AppColors.border,
    );
  }
}
