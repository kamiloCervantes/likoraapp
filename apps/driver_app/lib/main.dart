import 'package:flutter/material.dart';
import 'package:shared_ui/shared_ui.dart';
import 'package:core_models/core_models.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const LikoraDriverApp());
}

class LikoraDriverApp extends StatelessWidget {
  const LikoraDriverApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Likora Conductor',
      debugShowCheckedModeBanner: false,
      theme: LikoraTheme.darkTheme,
      home: const DriverHomeScreen(),
    );
  }
}

class DriverHomeScreen extends StatefulWidget {
  const DriverHomeScreen({super.key});

  @override
  State<DriverHomeScreen> createState() => _DriverHomeScreenState();
}

class _DriverHomeScreenState extends State<DriverHomeScreen> {
  bool isOnline = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Panel de Conductor'),
        centerTitle: true,
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                isOnline ? Icons.online_prediction : Icons.offline_bolt_outlined,
                size: 80,
                color: isOnline ? LikoraColors.success : LikoraColors.textSecondary,
              ),
              const SizedBox(height: 20),
              Text(
                isOnline ? 'Estado: En Línea (Disponible para viajes)' : 'Estado: Desconectado',
                style: LikoraTypography.heading2,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 30),
              LikoraButton(
                text: isOnline ? 'Desconectarse' : 'Conectarse a Likora',
                backgroundColor: isOnline ? LikoraColors.error : LikoraColors.primary,
                onPressed: () {
                  setState(() {
                    isOnline = !isOnline;
                  });
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
