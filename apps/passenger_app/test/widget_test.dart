import 'package:flutter_test/flutter_test.dart';
import 'package:passenger_app/main.dart';

void main() {
  testWidgets('LikoraApp loads and smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const LikoraApp());
    expect(find.byType(LikoraApp), findsOneWidget);
  });
}
