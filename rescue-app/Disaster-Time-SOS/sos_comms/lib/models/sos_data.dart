class LocationInfo {
  double latitude;
  double longitude;
  double accuracy;

  LocationInfo({required this.latitude, required this.longitude, required this.accuracy});

  Map<String, dynamic> toMap() {
    return {
      'latitude': latitude,
      'longitude': longitude,
      'accuracy': accuracy,
    };
  }
}

class DeviceInfo {
  String os;
  String model;

  DeviceInfo({required this.os, required this.model});

  Map<String, dynamic> toMap() {
    return {
      'os': os,
      'model': model,
    };
  }
}

class SOSData {
  String id;
  String message;
  LocationInfo location;
  String timestamp;
  String status;
  String appVersion;
  DeviceInfo deviceInfo;

  SOSData({
    required this.id,
    required this.message,
    required this.location,
    required this.timestamp,
    this.status = "pending",
    this.appVersion = "0.1.0",
    required this.deviceInfo,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'message': message,
      'location': location.toMap(),
      'timestamp': timestamp,
      'status': status,
      'app_version': appVersion,
      'device_info': deviceInfo.toMap(),
    };
  }
}
