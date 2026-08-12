import 'package:flutter_test/flutter_test.dart';
import 'package:likora_app/main.dart';

void main() {
  testWidgets('LikoraApp smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const LikoraApp());

    // Verify that LikoraApp renders
    expect(find.byType(LikoraApp), findsOneWidget);
  });
}
