import 'package:flutter/material.dart';
import 'colors.dart';

class LikoraTheme {
  LikoraTheme._();

  static ThemeData get darkTheme {
    return ThemeData.dark().copyWith(
      scaffoldBackgroundColor: LikoraColors.background,
      primaryColor: LikoraColors.primary,
      cardColor: LikoraColors.card,
      appBarTheme: const AppBarTheme(
        backgroundColor: LikoraColors.surface,
        elevation: 0,
        centerTitle: true,
      ),
      colorScheme: const ColorScheme.dark(
        primary: LikoraColors.primary,
        secondary: LikoraColors.accent,
        surface: LikoraColors.surface,
        error: LikoraColors.error,
      ),
    );
  }
}
