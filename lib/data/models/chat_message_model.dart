class ChatMessageModel {
  final String id;
  final String senderName;
  final String text;
  final DateTime timestamp;
  final bool isFromUser;

  ChatMessageModel({
    required this.id,
    required this.senderName,
    required this.text,
    required this.timestamp,
    required this.isFromUser,
  });

  factory ChatMessageModel.fromJson(Map<String, dynamic> json) {
    return ChatMessageModel(
      id: json['id'] ?? '',
      senderName: json['sender_name'] ?? '',
      text: json['text'] ?? '',
      timestamp: DateTime.parse(json['timestamp']),
      isFromUser: json['is_from_user'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'sender_name': senderName,
      'text': text,
      'timestamp': timestamp.toIso8601String(),
      'is_from_user': isFromUser,
    };
  }
}
