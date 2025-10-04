import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import '../models/sos_data.dart';
import '../services/location_service.dart';
import '../services/firebase_service.dart';
import '../services/sms_service.dart';
import 'dart:io';

class HomeScreen extends StatelessWidget {
  final LocationService locationService = LocationService();
  final FirebaseService firebaseService = FirebaseService();
  final SMSService smsService = SMSService();
  final String fallbackNumber = "9523170039"; // Replace with real number

  HomeScreen({super.key});
  void sendSOS(BuildContext context) async {
    final loc = await locationService.getCurrentLocation();

    if (loc == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Unable to get location")),
      );
      return;
    }

    final sosData = SOSData(
      id: const Uuid().v4(),
      message: "SOS: Need help",
      location: LocationInfo(
        latitude: loc.latitude ?? 0.0,
        longitude: loc.longitude ?? 0.0,
        accuracy: loc.accuracy ?? 0.0,
      ),
      timestamp: DateTime.now().toUtc().toIso8601String(),
      deviceInfo: DeviceInfo(
        os: Platform.operatingSystem,
        model: Platform.operatingSystemVersion,
      ),
    );

    // Try Firebase first
    bool sent = await firebaseService.sendSOS(sosData);

    if (!sent) {
      // Fallback SMS
      await smsService.sendSOS(sosData, fallbackNumber);
    }

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text("SOS Sent!")),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("SOS Comms")),
      body: Center(
        child: ElevatedButton(
          onPressed: () => sendSOS(context),
          child: const Text("Send SOS"),
        ),
      ),
    );
  }
}
