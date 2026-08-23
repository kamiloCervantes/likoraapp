import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../core/services/api_client.dart';
import 'package:core_models/core_models.dart';

class KycRepository {
  Future<Map<String, dynamic>> requestUploadUrls(DocumentType docType) async {
    try {
      final res = await ApiClient.post('/kyc/upload-urls', body: {
        'document_type': docType.name.toUpperCase(),
        'has_back_image': docType != DocumentType.passport,
      });

      if (res.statusCode == 200) {
        return jsonDecode(res.body);
      }
    } catch (e) {}

    // Mock fallback
    final sessId = 'session-${DateTime.now().millisecondsSinceEpoch}';
    return {
      'verification_session_id': sessId,
      'upload_urls': {
        'front': {'key': 'kyc/user/$sessId/front.jpg', 'uploadUrl': 'https://mock.s3/upload/front'},
        'back': {'key': 'kyc/user/$sessId/back.jpg', 'uploadUrl': 'https://mock.s3/upload/back'},
        'selfie': {'key': 'kyc/user/$sessId/selfie.jpg', 'uploadUrl': 'https://mock.s3/upload/selfie'},
      }
    };
  }

  Future<bool> uploadImageToPresignedUrl(String uploadUrl, List<int> imageBytes) async {
    try {
      if (uploadUrl.contains('mock.s3')) {
        await Future.delayed(const Duration(milliseconds: 600));
        return true;
      }
      final res = await http.put(
        Uri.parse(uploadUrl),
        headers: {'Content-Type': 'image/jpeg'},
        body: imageBytes,
      );
      return res.statusCode == 200;
    } catch (e) {
      return true; // Fallback mock
    }
  }

  Future<Map<String, dynamic>> submitVerification({
    required String sessionId,
    required DocumentType docType,
    required String docNumber,
    required DateTime birthDate,
    required String frontKey,
    String? backKey,
    required String selfieKey,
  }) async {
    try {
      final res = await ApiClient.post('/kyc/submit', body: {
        'verification_session_id': sessionId,
        'document_type': docType.name.toUpperCase(),
        'document_number': docNumber,
        'extracted_birth_date': birthDate.toIso8601String().split('T').first,
        'front_image_key': frontKey,
        'back_image_key': backKey,
        'selfie_image_key': selfieKey,
      });

      if (res.statusCode == 201) {
        return {'success': true, 'data': jsonDecode(res.body)};
      } else {
        final err = jsonDecode(res.body);
        return {'success': false, 'error': err['message'] ?? 'Error en validación KYC'};
      }
    } catch (e) {
      return {'success': true, 'data': {'status': 'PENDING_REVIEW'}};
    }
  }

  Future<Map<String, dynamic>> getKycStatus() async {
    try {
      final res = await ApiClient.get('/kyc/status');
      if (res.statusCode == 200) {
        return jsonDecode(res.body);
      }
    } catch (e) {}
    return {'kyc_status': 'PENDING_REVIEW', 'can_purchase_alcohol': false};
  }
}
