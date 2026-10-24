import 'package:flutter/material.dart';
import 'package:shared_ui/shared_ui.dart';
import 'core/config/driver_config.dart';
import 'features/home/driver_home_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await DriverConfig.initialize();
  runApp(const LikoraDriverApp());
}

class LikoraDriverApp extends StatelessWidget {
  const LikoraDriverApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Likora Conductor & Repartidor',
      debugShowCheckedModeBanner: false,
      theme: LikoraTheme.darkTheme,
      home: const DriverHomeScreen(),
    );
  }
}