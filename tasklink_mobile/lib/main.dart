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
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF4F46E5),
          primary: const Color(0xFF4F46E5),
          secondary: const Color(0xFF10B981),
        ),
        scaffoldBackgroundColor: const Color(0xFFF9FAFB),
        useMaterial3: true,
        fontFamily: 'Sans-Serif',
      ),
      home: _isAuthenticated
          ? DefaultTabController(
              length: 2,
              child: Scaffold(
                appBar: AppBar(
                  title: Row(
                    children: [
                      const Icon(Icons.account_circle, color: Color(0xFF4F46E5), size: 28),
                      const SizedBox(width: 10),
                      Text(
                        _username,
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Color(0xFF1F2937)),
                      ),
                    ],
                  ),
                  backgroundColor: Colors.white,
                  elevation: 0,
                  bottom: const TabBar(
                    indicatorColor: Color(0xFF4F46E5),
                    labelColor: Color(0xFF4F46E5),
                    unselectedLabelColor: Color(0xFF9CA3AF),
                    labelStyle: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    tabs: [
                      Tab(icon: Icon(Icons.folder_outlined), text: 'Projects'),
                      Tab(icon: Icon(Icons.assignment_outlined), text: 'Tasks'),
                    ],
                  ),
                  actions: [
                    IconButton(
                      onPressed: _handleLogout,
                      icon: const Icon(Icons.logout_rounded, color: Color(0xFFEF4444)),
                      tooltip: 'Keluar',
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
  int? _editingProjectId;

  @override
  void initState() {
    super.initState();
    _loadProjects();
  }

  void _loadProjects() async {
    try {
      final data = await _projectService.getAllProjects();
      setState(() => _projects = data);
    } catch (e) {}
  }

  void _saveProject() async {
    if (_nameController.text.isEmpty || _descController.text.isEmpty) return;

    bool success;
    if (_editingProjectId == null) {
      success = await _projectService.createProject(_nameController.text, _descController.text);
    } else {
      success = await _projectService.updateProject(_editingProjectId!, _nameController.text, _descController.text);
    }

    if (success) {
      _nameController.clear();
      _descController.clear();
      setState(() => _editingProjectId = null);
      _loadProjects();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Data Project berhasil diproses'), backgroundColor: Color(0xFF10B981)),
      );
    }
  }

  void _startEdit(dynamic project) {
    setState(() {
      _editingProjectId = project['id'];
      _nameController.text = project['name'];
      _descController.text = project['description'];
    });
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: Color(0xFFE5E7EB))),
            color: Colors.white,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _editingProjectId == null ? 'Tambah Project Baru' : 'Mode Ubah: Project ID ${_editingProjectId}',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF1F2937)),
                  ),
                  const SizedBox(height: 14),
                  TextField(
                    controller: _nameController,
                    decoration: const InputDecoration(labelText: 'Nama Project', border: OutlineInputBorder(), fillColor: Color(0xFFF9FAFB), filled: true),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _descController,
                    decoration: const InputDecoration(labelText: 'Deskripsi Project', border: OutlineInputBorder(), fillColor: Color(0xFFF9FAFB), filled: true),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: _saveProject,
                          icon: Icon(_editingProjectId == null ? Icons.add : Icons.save, color: Colors.white, size: 18),
                          label: Text(_editingProjectId == null ? 'Tambah Project' : 'Simpan Perubahan', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF4F46E5), padding: const EdgeInsets.symmetric(vertical: 12), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                        ),
                      ),
                      if (_editingProjectId != null) ...[
                        const SizedBox(width: 10),
                        OutlinedButton(
                          onPressed: () {
                            _nameController.clear();
                            _descController.clear();
                            setState(() => _editingProjectId = null);
                          },
                          style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 12), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                          child: const Text('Batal', style: TextStyle(color: Color(0xFF4B5563))),
                        )
                      ]
                    ],
                  )
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: _projects.isEmpty
                ? const Center(child: Text('Belum ada data project terdaftar', style: TextStyle(color: Color(0xFF6B7280))))
                : ListView.builder(
                    itemCount: _projects.length,
                    itemBuilder: (context, index) {
                      final p = _projects[index];
                      return Card(
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10), side: const BorderSide(color: Color(0xFFE5E7EB))),
                        color: Colors.white,
                        margin: const EdgeInsets.symmetric(vertical: 6),
                        child: ListTile(
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          title: Text(p['name'], style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1F2937))),
                          subtitle: Padding(
                            padding: const EdgeInsets.only(top: 4),
                            child: Text("${p['description']} (ID: ${p['id']})", style: const TextStyle(color: Color(0xFF4B5563))),
                          ),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(
                                icon: const Icon(Icons.edit_outlined, color: Color(0xFFF59E0B)),
                                onPressed: () => _startEdit(p),
                              ),
                              IconButton(
                                icon: const Icon(Icons.delete_outline_rounded, color: Color(0xFFEF4444)),
                                onPressed: () async {
                                  if (await _projectService.deleteProject(p['id'])) _loadProjects();
                                },
                              ),
                            ],
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

// ======================== PANEL TAB TASK ========================
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
  int? _editingTaskId;

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

  void _saveTask() async {
    if (_titleController.text.isEmpty || _descController.text.isEmpty || _selectedProjectId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Lengkapi form dan pilih relasi project'), backgroundColor: Color(0xFFEF4444)),
      );
      return;
    }

    bool success;
    if (_editingTaskId == null) {
      success = await _taskService.createTask(_titleController.text, _descController.text, int.parse(_selectedProjectId!));
    } else {
      success = await _taskService.updateTask(_editingTaskId!, _titleController.text, _descController.text, false, int.parse(_selectedProjectId!));
    }

    if (success) {
      _titleController.clear();
      _descController.clear();
      setState(() {
        _selectedProjectId = null;
        _editingTaskId = null;
      });
      _loadAllData();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Data Task berhasil disimpan'), backgroundColor: Color(0xFF10B981)),
      );
    }
  }

  void _startEditTask(dynamic task) {
    setState(() {
      _editingTaskId = task['id'];
      _titleController.text = task['title'];
      _descController.text = task['description'];
      _selectedProjectId = task['projectId'].toString();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: Color(0xFFE5E7EB))),
            color: Colors.white,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _editingTaskId == null ? 'Tambah Task Baru' : 'Mode Ubah: Task ID ${_editingTaskId}',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF1F2937)),
                  ),
                  const SizedBox(height: 14),
                  DropdownButtonFormField<String>(
                    value: _selectedProjectId,
                    hint: const Text('Pilih Relasi Project'),
                    decoration: const InputDecoration(border: OutlineInputBorder(), fillColor: Color(0xFFF9FAFB), filled: true),
                    items: _projects.map<DropdownMenuItem<String>>((p) {
                      return DropdownMenuItem<String>(
                        value: p['id'].toString(),
                        child: Text(p['name']),
                      );
                    }).toList(),
                    onChanged: (val) => setState(() => _selectedProjectId = val),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _titleController,
                    decoration: const InputDecoration(labelText: 'Nama Task', border: OutlineInputBorder(), fillColor: Color(0xFFF9FAFB), filled: true),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _descController,
                    decoration: const InputDecoration(labelText: 'Detail Deskripsi Task', border: OutlineInputBorder(), fillColor: Color(0xFFF9FAFB), filled: true),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: _saveTask,
                          icon: Icon(_editingTaskId == null ? Icons.add_task_rounded : Icons.save, color: Colors.white, size: 18),
                          label: Text(_editingTaskId == null ? 'Tambah Task' : 'Simpan Perubahan', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981), padding: const EdgeInsets.symmetric(vertical: 12), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                        ),
                      ),
                      if (_editingTaskId != null) ...[
                        const SizedBox(width: 10),
                        OutlinedButton(
                          onPressed: () {
                            _titleController.clear();
                            _descController.clear();
                            setState(() {
                              _selectedProjectId = null;
                              _editingTaskId = null;
                            });
                          },
                          style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 12), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                          child: const Text('Batal', style: TextStyle(color: Color(0xFF4B5563))),
                        )
                      ]
                    ],
                  )
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: _tasks.isEmpty
                ? const Center(child: Text('Belum ada data task terdaftar', style: TextStyle(color: Color(0xFF6B7280))))
                : ListView.builder(
                    itemCount: _tasks.length,
                    itemBuilder: (context, index) {
                      final t = _tasks[index];
                      final parentProject = _projects.firstWhere((p) => p['id'] == t['projectId'], orElse: () => null);
                      return Card(
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10), side: const BorderSide(color: Color(0xFFE5E7EB))),
                        color: Colors.white,
                        margin: const EdgeInsets.symmetric(vertical: 6),
                        child: ListTile(
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          title: Text(t['title'], style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1F2937))),
                          subtitle: Padding(
                            padding: const EdgeInsets.only(top: 4),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(t['description'], style: const TextStyle(color: Color(0xFF4B5563))),
                                const SizedBox(height: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFEEF2FF),
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(color: const Color(0xFFE0E7FF)),
                                  ),
                                  child: Text(
                                    "Project: ${parentProject != null ? parentProject['name'] : 'ID ' + t['projectId'].toString()}",
                                    style: const TextStyle(fontSize: 12, color: Color(0xFF4F46E5), fontWeight: FontWeight.w600),
                                  ),
                                )
                              ],
                            ),
                          ),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(
                                icon: const Icon(Icons.edit_outlined, color: Color(0xFFF59E0B)),
                                onPressed: () => _startEditTask(t),
                              ),
                              IconButton(
                                icon: const Icon(Icons.delete_outline_rounded, color: Color(0xFFEF4444)),
                                onPressed: () async {
                                  if (await _taskService.deleteTask(t['id'])) _loadAllData();
                                },
                              ),
                            ],
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