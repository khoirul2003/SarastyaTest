import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { projectService } from './services/projectService';
import { taskService } from './services/taskService';

const MainApp = () => {
    const { isAuthenticated, username, logout } = useAuth();
    
    // State Projects
    const [projects, setProjects] = useState([]);
    const [projectName, setProjectName] = useState('');
    const [projectDesc, setProjectDesc] = useState('');
    const [editingProjectId, setEditingProjectId] = useState(null);
    
    // State Tasks
    const [tasks, setTasks] = useState([]);
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDesc, setTaskDesc] = useState('');
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [editingTaskId, setEditingTaskId] = useState(null);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            loadAllData();
        }
    }, [isAuthenticated]);

    const loadAllData = async () => {
        try {
            const projData = await projectService.getAll();
            const taskData = await taskService.getAll();
            setProjects(projData);
            setTasks(taskData);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSaveProject = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingProjectId === null) {
                await projectService.create({ name: projectName, description: projectDesc });
            } else {
                // UPDATE (PUT) Project
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5084/api/Projects/${editingProjectId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ id: editingProjectId, name: projectName, description: projectDesc })
                });
                if (!response.ok) throw new Error('Gagal memperbarui project');
            }
            setProjectName('');
            setProjectDesc('');
            setEditingProjectId(null);
            loadAllData();
        } catch (err) { 
            setError(err.message); 
        } finally {
            setLoading(false);
        }
    };

    const handleSaveTask = async (e) => {
        e.preventDefault();
        if (!selectedProjectId) {
            alert('Pilih project terlebih dahulu!');
            return;
        }
        setLoading(true);
        try {
            if (editingTaskId === null) {
                await taskService.create({
                    title: taskTitle,
                    description: taskDesc,
                    isCompleted: false,
                    projectId: parseInt(selectedProjectId)
                });
            } else {
                // UPDATE (PUT) Task Berelasi
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5084/api/Tasks/${editingTaskId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        id: editingTaskId,
                        title: taskTitle,
                        description: taskDesc,
                        isCompleted: false,
                        projectId: parseInt(selectedProjectId)
                    })
                });
                if (!response.ok) throw new Error('Gagal memperbarui task');
            }
            setTaskTitle('');
            setTaskDesc('');
            setSelectedProjectId('');
            setEditingTaskId(null);
            loadAllData();
        } catch (err) { 
            setError(err.message); 
        } finally {
            setLoading(false);
        }
    };

    const startEditProject = (p) => {
        setEditingProjectId(p.id);
        setProjectName(p.name);
        setProjectDesc(p.description);
    };

    const startEditTask = (t) => {
        setEditingTaskId(t.id);
        setTaskTitle(t.title);
        setTaskDesc(t.description);
        setSelectedProjectId(t.projectId.toString());
    };

    const handleDeleteProject = async (id) => {
        if (window.confirm('Hapus project ini?')) {
            try { await projectService.delete(id); loadAllData(); } catch (err) { alert(err.message); }
        }
    };

    const handleDeleteTask = async (id) => {
        if (window.confirm('Hapus task ini?')) {
            try { await taskService.delete(id); loadAllData(); } catch (err) { alert(err.message); }
        }
    };

    if (!isAuthenticated) return <AuthPage />;

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.logo}>Task<span style={{ color: '#4F46E5' }}>Link</span> Workspace</h1>
                <div style={styles.userProfile}>
                    <span style={styles.welcomeText}>Halo, <strong>{username}</strong></span>
                    <button onClick={logout} style={styles.logoutButton}>Keluar</button>
                </div>
            </header>

            <main style={styles.main}>
                {error && <div style={styles.errorBadge}>Gagal memproses data: {error}</div>}

                <div style={styles.workspaceGrid}>
                    {/* MODUL PROJECT */}
                    <div style={styles.sectionCard}>
                        <h2 style={styles.sectionTitle}>Modul Project</h2>
                        <form onSubmit={handleSaveProject} style={styles.form}>
                            <div style={{fontSize: '13px', fontWeight: 'bold', color: '#4F46E5'}}>
                                {editingProjectId ? `Mode Edit: ID ${editingProjectId}` : 'Tambah Baru'}
                            </div>
                            <input type="text" style={styles.input} placeholder="Nama Project..." required value={projectName} onChange={e => setProjectName(e.target.value)} />
                            <textarea style={styles.textarea} placeholder="Deskripsi Project..." required value={projectDesc} onChange={e => setProjectDesc(e.target.value)} />
                            <div style={{display: 'flex', gap: '8px'}}>
                                <button type="submit" style={styles.btnPrimary}>{editingProjectId ? 'Simpan Perubahan' : 'Tambah Project'}</button>
                                {editingProjectId && <button type="button" onClick={() => { setProjectName(''); setProjectDesc(''); setEditingProjectId(null); }} style={{...styles.btnDelete, backgroundColor: '#6B7280'}}>Batal</button>}
                            </div>
                        </form>

                        <div style={styles.listContainer}>
                            {projects.map(p => (
                                <div key={p.id} style={styles.listItem}>
                                    <div>
                                        <strong style={{color: '#1F2937'}}>{p.name}</strong>
                                        <p style={styles.listSubtext}>{p.description} <span style={styles.idTag}>ID: {p.id}</span></p>
                                    </div>
                                    <div style={{display: 'flex', gap: '6px'}}>
                                        <button onClick={() => startEditProject(p)} style={{...styles.btnPrimary, padding: '4px 8px', fontSize: '12px', backgroundColor: '#F59E0B'}}>Edit</button>
                                        <button onClick={() => handleDeleteProject(p.id)} style={styles.btnDelete}>Hapus</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* MODUL TASK RELASIONAL */}
                    <div style={styles.sectionCard}>
                        <h2 style={styles.sectionTitle}>Modul Task (Relasional)</h2>
                        <form onSubmit={handleSaveTask} style={styles.form}>
                            <div style={{fontSize: '13px', fontWeight: 'bold', color: '#10B981'}}>
                                {editingTaskId ? `Mode Edit: ID ${editingTaskId}` : 'Tambah Baru'}
                            </div>
                            <select style={styles.input} required value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)}>
                                <option value="">-- Pilih Relasi Project --</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <input type="text" style={styles.input} placeholder="Nama Tugas / Task..." required value={taskTitle} onChange={e => setTaskTitle(e.target.value)} />
                            <textarea style={styles.textarea} placeholder="Detail Instruksi Task..." required value={taskDesc} onChange={e => setTaskDesc(e.target.value)} />
                            <div style={{display: 'flex', gap: '8px'}}>
                                <button type="submit" style={styles.btnSuccess}>{editingTaskId ? 'Simpan Perubahan Task' : 'Tambah Task Baru'}</button>
                                {editingTaskId && <button type="button" onClick={() => { setTaskTitle(''); setTaskDesc(''); setSelectedProjectId(''); setEditingTaskId(null); }} style={{...styles.btnDelete, backgroundColor: '#6B7280'}}>Batal</button>}
                            </div>
                        </form>

                        <div style={styles.listContainer}>
                            {tasks.map(t => {
                                const parentProject = projects.find(p => p.id === t.projectId);
                                return (
                                    <div key={t.id} style={styles.listItem}>
                                        <div>
                                            <strong style={{color: '#1F2937'}}>{t.title}</strong>
                                            <p style={styles.listSubtext}>{t.description}</p>
                                            <span style={styles.projectBadge}>Project: {parentProject ? parentProject.name : `ID ${t.projectId}`}</span>
                                        </div>
                                        <div style={{display: 'flex', gap: '6px'}}>
                                            <button onClick={() => startEditTask(t)} style={{...styles.btnPrimary, padding: '4px 8px', fontSize: '12px', backgroundColor: '#F59E0B'}}>Edit</button>
                                            <button onClick={() => handleDeleteTask(t.id)} style={styles.btnDelete}>Hapus</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const styles = {
    container: { minHeight: '100vh', backgroundColor: '#F3F4F6', fontFamily: "sans-serif" },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px', height: '70px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB' },
    logo: { fontSize: '22px', fontWeight: '700', margin: 0, color: '#1F2937' },
    userProfile: { display: 'flex', alignItems: 'center', gap: '20px' },
    welcomeText: { fontSize: '14px', color: '#4B5563' },
    logoutButton: { padding: '6px 12px', fontSize: '13px', fontWeight: '600', color: '#DC2626', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '6px', cursor: 'pointer' },
    main: { padding: '40px', maxWidth: '1300px', margin: '0 auto' },
    workspaceGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' },
    sectionCard: { padding: '24px', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' },
    sectionTitle: { margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700', color: '#1F2937' },
    form: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' },
    input: { padding: '10px 14px', fontSize: '14px', borderRadius: '6px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB', outline: 'none' },
    textarea: { padding: '10px 14px', fontSize: '14px', borderRadius: '6px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB', outline: 'none', height: '60px', resize: 'none' },
    btnPrimary: { padding: '10px', fontSize: '14px', fontWeight: '600', color: '#FFFFFF', backgroundColor: '#4F46E5', border: 'none', borderRadius: '6px', cursor: 'pointer' },
    btnSuccess: { padding: '10px', fontSize: '14px', fontWeight: '600', color: '#FFFFFF', backgroundColor: '#10B981', border: 'none', borderRadius: '6px', cursor: 'pointer' },
    btnDelete: { padding: '6px 10px', fontSize: '12px', fontWeight: '600', color: '#FFFFFF', backgroundColor: '#EF4444', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    listContainer: { display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid #E5E7EB', paddingTop: '20px' },
    listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' },
    listSubtext: { margin: '4px 0', fontSize: '13px', color: '#6B7280' },
    idTag: { fontSize: '11px', color: '#9CA3AF', backgroundColor: '#E5E7EB', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' },
    projectBadge: { display: 'inline-block', marginTop: '6px', fontSize: '11px', fontWeight: '600', color: '#4F46E5', backgroundColor: '#EEF2FF', padding: '2px 8px', borderRadius: '12px' },
    errorBadge: { padding: '12px', marginBottom: '20px', fontSize: '13px', color: '#991B1B', backgroundColor: '#FEE2E2', borderRadius: '8px', border: '1px solid #FCA5A5' }
};

function App() {
    return (
        <AuthProvider>
            <MainApp />
        </AuthProvider>
    );
}

export default App;