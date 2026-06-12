import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'screens/login_screen.dart';
import 'services/project_service.dart';
import 'services/task_service.dart';

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
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF4F46E5)),
        scaffoldBackgroundColor: const Color(0xFFF3F4F6),
        useMaterial3: true,
      ),
      home: _isAuthenticated
          ? DefaultTabController(
              length: 2,
              child: Scaffold(
                appBar: AppBar(
                  title: Text('Halo, $_username 👋', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  backgroundColor: Colors.white,
                  elevation: 0,
                  bottom: const TabBar(
                    tabs: [
                      Tab(icon: Icon(Icons.folder), text: 'Projects'),
                      Tab(icon: Icon(Icons.assignment), text: 'Tasks Relasi'),
                    ],
                  ),
                  actions: [
                    IconButton(
                      onPressed: _handleLogout,
                      icon: const Icon(Icons.logout, color: Colors.red),
                    )
                  ],
                ),
                body: const TabBarView(
                  children: [
                    ProjectTabContent(),
                    TaskTabContent(),
                  ],
                ),
              ),
            )
          : LoginScreen(onLoginSuccess: _checkLoginStatus),
    );
  }
}

// ======================== PANEL TAB PROJECT ========================
class ProjectTabContent extends StatefulWidget {
  const ProjectTabContent({super.key});
  @override
  State<ProjectTabContent> createState() => _ProjectTabContentState();
}

class _ProjectTabContentState extends State<ProjectTabContent> {
  final _projectService = ProjectService();
  final _nameController = TextEditingController();
  final _descController = TextEditingController();
  List<dynamic> _projects = [];

  @override
  void initState() {
    super.initState();
    _loadProjects();
  }

  void _loadProjects() async {
    try {
      final data = await _projectService.getAllProjects();
      setState(() => _projects = data);
    } catch (e) {
      // Handle error silent
    }
  }

  void _addProject() async {
    if (_nameController.text.isEmpty || _descController.text.isEmpty) return;
    final success = await _projectService.createProject(_nameController.text, _descController.text);
    if (success) {
      _nameController.clear();
      _descController.clear();
      _loadProjects();
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('✅ Project berhasil dibuat!')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          Card(
            color: Colors.white,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  TextField(controller: _nameController, decoration: const InputDecoration(labelText: 'Nama Project', border: OutlineInputBorder())),
                  const SizedBox(height: 10),
                  TextField(controller: _descController, decoration: const InputDecoration(labelText: 'Deskripsi Project', border: OutlineInputBorder())),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: _addProject,
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF4F46E5), minimumSize: const Size.fromHeight(45)),
                    child: const Text('Tambah Project', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  )
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: _projects.isEmpty
                ? const Center(child: Text('Belum ada project.'))
                : ListView.builder(
                    itemCount: _projects.length,
                    itemBuilder: (context, index) {
                      final p = _projects[index];
                      return Card(
                        color: Colors.white,
                        margin: const EdgeInsets.symmetric(vertical: 6),
                        child: ListTile(
                          title: Text(p['name'], style: const TextStyle(fontWeight: FontWeight.bold)),
                          subtitle: Text("${p['description']} (ID: ${p['id']})"),
                          trailing: IconButton(
                            icon: const Icon(Icons.delete, color: Colors.red),
                            onPressed: () async {
                              if (await _projectService.deleteProject(p['id'])) _loadProjects();
                            },
                          ),
                        ),
                      );
                    },
                  ),
          )
        ],
      ),
    );
  }
}

// ======================== PANEL TAB TASK (RELASIONAL) ========================
class TaskTabContent extends StatefulWidget {
  const TaskTabContent({super.key});
  @override
  State<TaskTabContent> createState() => _TaskTabContentState();
}

class _TaskTabContentState extends State<TaskTabContent> {
  final _projectService = ProjectService();
  final _taskService = TaskService();
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  
  List<dynamic> _projects = [];
  List<dynamic> _tasks = [];
  String? _selectedProjectId;

  @override
  void initState() {
    super.initState();
    _loadAllData();
  }

  void _loadAllData() async {
    try {
      final pData = await _projectService.getAllProjects();
      final tData = await _taskService.getAllTasks();
      setState(() {
        _projects = pData;
        _tasks = tData;
      });
    } catch (e) {}
  }

  void _addTask() async {
    if (_titleController.text.isEmpty || _descController.text.isEmpty || _selectedProjectId == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('⚠️ Lengkapi form dan pilih project!')));
      return;
    }
    final success = await _taskService.createTask(
      _titleController.text,
      _descController.text,
      int.parse(_selectedProjectId!),
    );
    if (success) {
      _titleController.clear();
      _descController.clear();
      setState(() => _selectedProjectId = null);
      _loadAllData();
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('✅ Task berelasi sukses ditambahkan!')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          Card(
            color: Colors.white,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  DropdownButtonFormField<String>(
                    value: _selectedProjectId,
                    hint: const Text('-- Pilih Relasi Project --'),
                    decoration: const InputDecoration(border: OutlineInputBorder()),
                    items: _projects.map<DropdownMenuItem<String>>((p) {
                      return DropdownMenuItem<String>(
                        value: p['id'].toString(),
                        child: Text(p['name']),
                      );
                    }).toList(),
                    onChanged: (val) => setState(() => _selectedProjectId = val),
                  ),
                  const SizedBox(height: 10),
                  TextField(controller: _titleController, decoration: const InputDecoration(labelText: 'Nama Task', border: OutlineInputBorder())),
                  const SizedBox(height: 10),
                  TextField(controller: _descController, decoration: const InputDecoration(labelText: 'Detail Deskripsi Task', border: OutlineInputBorder())),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: _addTask,
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981), minimumSize: const Size.fromHeight(45)),
                    child: const Text('Tambah Task Baru', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  )
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: _tasks.isEmpty
                ? const Center(child: Text('Belum ada data task.'))
                : ListView.builder(
                    itemCount: _tasks.length,
                    itemBuilder: (context, index) {
                      final t = _tasks[index];
                      final parentProject = _projects.firstWhere((p) => p['id'] == t['projectId'], orElse: () => null);
                      return Card(
                        color: Colors.white,
                        margin: const EdgeInsets.symmetric(vertical: 6),
                        child: ListTile(
                          title: Text(t['title'], style: const TextStyle(fontWeight: FontWeight.bold)),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(t['description']),
                              const SizedBox(height: 4),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(color: const Color(0xFFEEF2FF), borderRadius: BorderRadius.circular(12)),
                                child: Text(
                                  "📌 Project: ${parentProject != null ? parentProject['name'] : 'ID ' + t['projectId'].toString()}",
                                  style: const TextStyle(fontSize: 11, color: Color(0xFF4F46E5), fontWeight: FontWeight.bold),
                                ),
                              )
                            ],
                          ),
                          trailing: IconButton(
                            icon: const Icon(Icons.delete, color: Colors.red),
                            onPressed: () async {
                              if (await _taskService.deleteTask(t['id'])) _loadAllData();
                            },
                          ),
                        ),
                      );
                    },
                  ),
          )
        ],
      ),
    );
  }
}