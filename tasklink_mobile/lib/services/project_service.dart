import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ProjectService {
  final String baseUrl = 'http://localhost:5084/api/Projects';

  Future<Map<String, String>> _getHeaders() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    String? token = prefs.getString('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  Future<List<dynamic>> getAllProjects() async {
    final response = await http.get(Uri.parse(baseUrl), headers: await _getHeaders());
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Gagal mengambil data project');
    }
  }

  Future<bool> createProject(String name, String description) async {
    final response = await http.post(
      Uri.parse(baseUrl),
      headers: await _getHeaders(),
      body: jsonEncode({'name': name, 'description': description}),
    );
    return response.statusCode == 200 || response.statusCode == 201;
  }

  Future<bool> updateProject(int id, String name, String description) async {
    final response = await http.put(
      Uri.parse('$baseUrl/$id'),
      headers: await _getHeaders(),
      body: jsonEncode({'id': id, 'name': name, 'description': description}),
    );
    return response.statusCode == 200 || response.statusCode == 204;
  }

  Future<bool> deleteProject(int id) async {
    final response = await http.delete(Uri.parse('$baseUrl/$id'), headers: await _getHeaders());
    return response.statusCode == 200;
  }
}