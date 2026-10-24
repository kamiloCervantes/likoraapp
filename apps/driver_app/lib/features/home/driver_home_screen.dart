import 'package:flutter/material.dart';
import 'package:shared_ui/shared_ui.dart';
import '../../core/services/driver_tracking_service.dart';
import '../../core/config/driver_config.dart';
import '../delivery/delivery_verification_sheet.dart';

class DriverHomeScreen extends StatefulWidget {
  const DriverHomeScreen({super.key});

  @override
  State<DriverHomeScreen> createState() => _DriverHomeScreenState();
}

class _DriverHomeScreenState extends State<DriverHomeScreen> {
  final DriverTrackingService _trackingService = DriverTrackingService();

  @override
  void initState() {
    super.initState();
    _trackingService.addListener(_onServiceUpdate);
  }

  @override
  void dispose() {
    _trackingService.removeListener(_onServiceUpdate);
    super.dispose();
  }

  void _onServiceUpdate() {
    if (mounted) setState(() {});
  }

  void _openDeliveryVerificationSheet(DriverTrackingService s) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => DeliveryVerificationSheet(trackingService: s),
    );
  }

  void _showConfigDialog() {
    final controller = TextEditingController(text: DriverConfig.apiBaseUrl);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1B1B22),
        title: const Text('Configuración de Servidor GPS', style: TextStyle(color: Colors.white, fontSize: 16)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'URL del API Likora para recibir telemetría:',
              style: TextStyle(color: Colors.white70, fontSize: 13),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: controller,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                filled: true,
                fillColor: const Color(0xFF26262F),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                hintText: 'http://10.0.2.2:3000/api/v1',
                hintStyle: const TextStyle(color: Colors.white38),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancelar', style: TextStyle(color: Colors.white60)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: LikoraColors.primary),
            onPressed: () {
              DriverConfig.customApiBaseUrl = controller.text.trim();
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('URL de servidor actualizada')),
              );
            },
            child: const Text('Guardar', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final s = _trackingService;

    return Scaffold(
      backgroundColor: const Color(0xFF0F0E17),
      appBar: AppBar(
        backgroundColor: const Color(0xFF171622),
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: LikoraColors.primary.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.two_wheeler_rounded, color: LikoraColors.primary, size: 22),
            ),
            const SizedBox(width: 10),
            const Text(
              'Likora Repartidor',
              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 17),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined, color: Colors.white70),
            tooltip: 'Configurar Servidor',
            onPressed: _showConfigDialog,
          ),
          // Toggle Online/Offline
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: Center(
              child: Switch(
                value: s.isOnline,
                activeThumbColor: LikoraColors.success,
                onChanged: (val) {
                  s.setOnline(val);
                },
              ),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Driver Profile Card
            _buildDriverProfileCard(s),
            const SizedBox(height: 16),

            // Master GPS Telemetry Card
            _buildGpsStatusCard(s),
            const SizedBox(height: 16),

            // Active Order / Delivery Trip Card
            _buildActiveTripCard(s),
            const SizedBox(height: 16),

            // Telemetry Controls & Simulation
            _buildControlsCard(s),
            const SizedBox(height: 16),

            // Live Telemetry Event Logs
            _buildLogsCard(s),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildDriverProfileCard(DriverTrackingService s) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1B1B26),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 26,
            backgroundColor: LikoraColors.primary.withValues(alpha: 0.2),
            child: const Icon(Icons.person, color: LikoraColors.primary, size: 30),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      s.driverName,
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: s.isOnline ? LikoraColors.success.withValues(alpha: 0.2) : Colors.red.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        s.isOnline ? 'EN LÍNEA' : 'DESCONECTADO',
                        style: TextStyle(
                          color: s.isOnline ? LikoraColors.success : Colors.redAccent,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  '${s.vehicleType} • Placas: ${s.vehiclePlate}',
                  style: const TextStyle(color: Colors.white70, fontSize: 12),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: const Color(0xFFFFB703).withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Row(
              children: [
                Icon(Icons.star_rounded, color: Color(0xFFFFB703), size: 16),
                SizedBox(width: 4),
                Text('4.9', style: TextStyle(color: Color(0xFFFFB703), fontWeight: FontWeight.bold, fontSize: 12)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGpsStatusCard(DriverTrackingService s) {
    final isTx = s.isTransmitting;
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isTx
              ? [const Color(0xFF1E3A2F), const Color(0xFF14241F)]
              : [const Color(0xFF261D36), const Color(0xFF171321)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isTx ? LikoraColors.success.withValues(alpha: 0.5) : LikoraColors.primary.withValues(alpha: 0.3),
        ),
        boxShadow: [
          BoxShadow(
            color: (isTx ? LikoraColors.success : LikoraColors.primary).withValues(alpha: 0.15),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: isTx ? LikoraColors.success.withValues(alpha: 0.2) : Colors.white12,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  isTx ? Icons.satellite_alt_rounded : Icons.satellite_alt_outlined,
                  color: isTx ? LikoraColors.success : Colors.white60,
                  size: 24,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isTx ? 'TRANSMITIENDO GPS EN VIVO' : 'TRANSMISIÓN GPS DETENIDA',
                      style: TextStyle(
                        color: isTx ? LikoraColors.success : Colors.white70,
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                        letterSpacing: 0.5,
                      ),
                    ),
                    Text(
                      isTx
                          ? 'Enviando coordenadas cada ${s.intervalSeconds}s hacia Likora API'
                          : 'Presiona "Iniciar Transmisión" para emitir ubicación',
                      style: const TextStyle(color: Colors.white60, fontSize: 11),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Primary Big Broadcast Button
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: isTx ? Colors.redAccent.withValues(alpha: 0.9) : LikoraColors.primary,
                foregroundColor: isTx ? Colors.white : Colors.black,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                elevation: 3,
              ),
              icon: Icon(isTx ? Icons.pause_circle_filled_rounded : Icons.play_circle_fill_rounded, size: 22),
              label: Text(
                isTx ? 'Pausar Transmisión de GPS' : 'Iniciar Transmisión GPS en Vivo',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
              ),
              onPressed: () {
                if (isTx) {
                  s.stopTransmitting();
                } else {
                  s.startTransmitting();
                }
              },
            ),
          ),
          const SizedBox(height: 16),

          // Telemetry Gauges Grid
          Row(
            children: [
              Expanded(
                child: _buildTelemetryTile(
                  icon: Icons.my_location_rounded,
                  title: 'Coordenadas GPS',
                  value: '${s.latitude.toStringAsFixed(5)}, ${s.longitude.toStringAsFixed(5)}',
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildTelemetryTile(
                  icon: Icons.speed_rounded,
                  title: 'Velocidad',
                  value: '${s.speedKmh.toStringAsFixed(1)} km/h',
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _buildTelemetryTile(
                  icon: Icons.explore_rounded,
                  title: 'Rumbo / Brújula',
                  value: '${s.heading.toStringAsFixed(0)}° NE',
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildTelemetryTile(
                  icon: Icons.send_rounded,
                  title: 'Paquetes Enviados',
                  value: '${s.packetsSentCount} pings (200 OK)',
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTelemetryTile({required IconData icon, required String title, required String value}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: 0.25),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withValues(alpha: 0.06)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: LikoraColors.primary, size: 14),
              const SizedBox(width: 4),
              Text(title, style: const TextStyle(color: Colors.white54, fontSize: 10)),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildActiveTripCard(DriverTrackingService s) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1B1B26),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.receipt_long_rounded, color: LikoraColors.primary, size: 18),
                  const SizedBox(width: 6),
                  Text(
                    'Pedido #${s.orderId}',
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: LikoraColors.primary.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  s.deliveryStatus,
                  style: const TextStyle(color: LikoraColors.primary, fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Row(
            children: [
              Icon(Icons.storefront_rounded, color: Colors.white70, size: 16),
              SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Origen: Likora El Poblado (Cra. 43A #1-50)',
                  style: TextStyle(color: Colors.white70, fontSize: 12),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          const Row(
            children: [
              Icon(Icons.location_on_rounded, color: LikoraColors.primary, size: 16),
              SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Destino: Calle 10 #42-28, Medellín (Camilo Cervantes)',
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 12),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Status Action Chips
          Wrap(
            spacing: 8,
            runSpacing: 6,
            children: [
              _buildStatusActionChip('EN_CAMINO', 'En Camino', s),
              _buildStatusActionChip('LLEGANDO', 'Llegando al Destino', s),
              _buildStatusActionChip('ENTREGADO', 'Pedido Entregado', s),
            ],
          ),
          const SizedBox(height: 14),

          // Primary Delivery ID Verification CTA Button
          SizedBox(
            width: double.infinity,
            height: 46,
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF7B2CBF),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 3,
              ),
              icon: const Icon(Icons.document_scanner_rounded, size: 20),
              label: const Text(
                'Completar Entrega & Tomar Foto del ID',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
              ),
              onPressed: () => _openDeliveryVerificationSheet(s),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusActionChip(String statusKey, String label, DriverTrackingService s) {
    final isSelected = s.deliveryStatus == statusKey;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      labelStyle: TextStyle(
        color: isSelected ? Colors.black : Colors.white70,
        fontSize: 11,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
      ),
      selectedColor: LikoraColors.primary,
      backgroundColor: const Color(0xFF262635),
      onSelected: (_) {
        if (statusKey == 'ENTREGADO') {
          _openDeliveryVerificationSheet(s);
        } else {
          s.setDeliveryStatus(statusKey);
        }
      },
    );
  }

  Widget _buildControlsCard(DriverTrackingService s) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1B1B26),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Simulación y Herramientas GPS',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
          ),
          const SizedBox(height: 12),

          // Auto Move Simulator Switch & Button
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: s.isAutoMoving ? const Color(0xFF388E3C) : const Color(0xFF2A2A38),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  icon: Icon(s.isAutoMoving ? Icons.directions_bike_rounded : Icons.play_arrow_rounded, size: 18),
                  label: Text(
                    s.isAutoMoving ? 'Pausar Simulación Ruta' : 'Simular Movimiento de Ruta',
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                  onPressed: () => s.toggleAutoMovement(),
                ),
              ),
              const SizedBox(width: 8),
              IconButton(
                style: IconButton.styleFrom(
                  backgroundColor: const Color(0xFF2A2A38),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                tooltip: 'Reiniciar Posición al Punto de Partida',
                icon: const Icon(Icons.restart_alt_rounded, color: Colors.white70, size: 20),
                onPressed: () {
                  s.resetRoute();
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Ruta reiniciada a Likora El Poblado')),
                  );
                },
              ),
              const SizedBox(width: 4),
              IconButton(
                style: IconButton.styleFrom(
                  backgroundColor: const Color(0xFF2A2A38),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                tooltip: 'Forzar Ping Inmediato',
                icon: const Icon(Icons.send_rounded, color: LikoraColors.primary, size: 18),
                onPressed: () async {
                  final messenger = ScaffoldMessenger.of(context);
                  final ok = await s.sendCurrentLocation();
                  if (!mounted) return;
                  messenger.showSnackBar(
                    SnackBar(content: Text(ok ? 'Ping GPS enviado exitosamente' : 'Error al enviar ping')),
                  );
                },
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Interval Selector
          Row(
            children: [
              const Text('Intervalo de ping:', style: TextStyle(color: Colors.white70, fontSize: 12)),
              const Spacer(),
              _buildIntervalOption(2, s),
              const SizedBox(width: 6),
              _buildIntervalOption(3, s),
              const SizedBox(width: 6),
              _buildIntervalOption(5, s),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildIntervalOption(int sec, DriverTrackingService s) {
    final isSel = s.intervalSeconds == sec;
    return InkWell(
      onTap: () => s.setInterval(sec),
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: isSel ? LikoraColors.primary : const Color(0xFF262635),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          '${sec}s',
          style: TextStyle(
            color: isSel ? Colors.black : Colors.white70,
            fontSize: 11,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  Widget _buildLogsCard(DriverTrackingService s) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1B1B26),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.terminal_rounded, color: LikoraColors.primary, size: 16),
                  SizedBox(width: 6),
                  Text('Registro de Telemetría GPS en Vivo',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                ],
              ),
              Text(
                '${s.logs.length} pings',
                style: const TextStyle(color: Colors.white54, fontSize: 11),
              ),
            ],
          ),
          const SizedBox(height: 10),
          if (s.logs.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 12),
              child: Center(
                child: Text(
                  'Inicia la transmisión para ver el registro de paquetes en vivo.',
                  style: TextStyle(color: Colors.white38, fontSize: 11),
                ),
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: s.logs.take(6).length,
              separatorBuilder: (_, __) => const Divider(color: Colors.white10, height: 8),
              itemBuilder: (context, index) {
                final log = s.logs[index];
                final timeStr =
                    '${log.timestamp.hour.toString().padLeft(2, '0')}:${log.timestamp.minute.toString().padLeft(2, '0')}:${log.timestamp.second.toString().padLeft(2, '0')}';
                return Row(
                  children: [
                    Text(timeStr, style: const TextStyle(color: Colors.white38, fontSize: 10, fontFamily: 'monospace')),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                      decoration: BoxDecoration(
                        color: log.statusCode == 200 || log.statusCode == 201
                            ? LikoraColors.success.withValues(alpha: 0.2)
                            : Colors.red.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        'HTTP ${log.statusCode}',
                        style: TextStyle(
                          color: log.statusCode == 200 || log.statusCode == 201
                              ? LikoraColors.success
                              : Colors.redAccent,
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        '${log.latitude.toStringAsFixed(4)}, ${log.longitude.toStringAsFixed(4)} (${log.speedKmh.toStringAsFixed(0)} km/h)',
                        style: const TextStyle(color: Colors.white70, fontSize: 11, fontFamily: 'monospace'),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                );
              },
            ),
        ],
      ),
    );
  }
}
