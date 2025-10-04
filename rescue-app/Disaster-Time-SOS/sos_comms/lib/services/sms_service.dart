import 'package:telephony/telephony.dart';
import '../models/sos_data.dart';

class SMSService {
  final Telephony telephony = Telephony.instance;

  Future<void> sendSOS(SOSData sosData, String phoneNumber) async {
    final message =
        "SOS! ${sosData.deviceInfo.model}: ${sosData.message}\n"
        "Lat: ${sosData.location.latitude}, Lon: ${sosData.location.longitude}";

    bool? permissionsGranted = await telephony.requestPhoneAndSmsPermissions;

    if (permissionsGranted ?? false) {
      await telephony.sendSms(to: phoneNumber, message: message);
      print("SMS sent to $phoneNumber: $message");
    } else {
      print("SMS permission denied");
    }
  }
}
