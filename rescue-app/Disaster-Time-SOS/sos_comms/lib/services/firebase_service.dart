import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/sos_data.dart';

class FirebaseService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  Future<bool> sendSOS(SOSData sosData) async {
    try {
      await _db.collection('sos_alerts').doc(sosData.id).set(sosData.toMap());
      return true;
    } catch (e) {
      return false;
    }
  }
}
