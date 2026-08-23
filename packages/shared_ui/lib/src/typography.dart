import 'package:flutter/material.dart';
import 'colors.dart';

class LikoraTypography {
  LikoraTypography._();

  static const TextStyle heading1 = TextStyle(
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: LikoraColors.textPrimary,
    letterSpacing: -0.5,
  );

  static const TextStyle heading2 = TextStyle(
    fontSize: 22,
    fontWeight: FontWeight.w600,
    color: LikoraColors.textPrimary,
  );

  static const TextStyle body = TextStyle(
    fontSize: 16,
    color: LikoraColors.textPrimary,
  );

  static const TextStyle caption = TextStyle(
    fontSize: 13,
    color: LikoraColors.textSecondary,
  );
}
