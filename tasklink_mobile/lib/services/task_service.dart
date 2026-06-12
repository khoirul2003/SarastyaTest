import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class TaskService {
  final String baseUrl = 'http://localhost:5084/api/Tasks';

  Future<Map<String, String>> _getHeaders() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    String? token = prefs.getString('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  Future<List<dynamic>> getAllTasks() async {
    final response = await http.get(Uri.parse(baseUrl), headers: await _getHeaders());
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Gagal mengambil data task');
    }
  }

  Future<bool> createTask(String title, String description, int projectId) async {
    final response = await http.post(
      Uri.parse(baseUrl),
      headers: await _getHeaders(),
      body: jsonEncode({
        'title': title,
        'description': description,
        'isCompleted': false,
        'projectId': projectId
      }),
    );
    return response.statusCode == 200 || response.statusCode == 201;
  }

  Future<bool> deleteTask(int id) async {
    final response = await http.delete(Uri.parse('$baseUrl/$id'), headers: await _getHeaders());
    return response.statusCode == 200;
  }
}