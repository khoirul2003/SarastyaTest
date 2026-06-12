import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'screens/login_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  bool _isAuthenticated = false;
  String _username = '';

  @override
  void initState() {
    super.initState();
    _checkLoginStatus();
  }

  void _checkLoginStatus() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    String? token = prefs.getString('token');
    String? user = prefs.getString('username');
    if (token != null && user != null) {
      setState(() {
        _isAuthenticated = true;
        _username = user;
      });
    }
  }

  void _handleLogout() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    setState(() {
      _isAuthenticated = false;
      _username = '';
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'TaskLink Mobile',
      theme: ThemeData(primarySwatch: Colors.indigo, useMaterial3: true),
      home: _isAuthenticated
          ? Scaffold(
              appBar: AppBar(
                title: const Text('TaskLink Mobile Workspace', style: TextStyle(fontWeight: FontWeight.bold)),
                backgroundColor: Colors.white,
                elevation: 1,
                actions: [
                  IconButton(onPressed: _handleLogout, icon: const Icon(Icons.logout, color: Colors.red))
                ],
              ),
              body: Center(
                child: Text('Selamat Datang, $_username!\nAuth Mobile Berhasil 🎉', textAlign: TextAlign.center, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              ),
            )
          : LoginScreen(onLoginSuccess: () {
              _checkLoginStatus();
            }),
    );
  }
}