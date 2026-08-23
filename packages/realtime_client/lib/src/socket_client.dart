import 'dart:async';

class LikoraSocketClient {
  final String serverUrl;
  bool _isConnected = false;
  final _messageController = StreamController<Map<String, dynamic>>.broadcast();

  LikoraSocketClient({required this.serverUrl});

  bool get isConnected => _isConnected;
  Stream<Map<String, dynamic>> get messageStream => _messageController.stream;

  Future<void> connect({String? authToken}) async {
    _isConnected = true;
  }

  void emit(String event, Map<String, dynamic> data) {
    if (!_isConnected) return;
  }

  void disconnect() {
    _isConnected = false;
  }

  void dispose() {
    _messageController.close();
  }
}
