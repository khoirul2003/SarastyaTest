import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { projectService } from './services/projectService';
import { taskService } from './services/taskService';

const MainApp = () => {
    const { isAuthenticated, username, logout } = useAuth();
    
    
    const [projects, setProjects] = useState([]);
    const [projectName, setProjectName] = useState('');
    const [projectDesc, setProjectDesc] = useState('');
    
    
    const [tasks, setTasks] = useState([]);
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDesc, setTaskDesc] = useState('');
    const [selectedProjectId, setSelectedProjectId] = useState('');

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

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            await projectService.create({ name: projectName, description: projectDesc });
            setProjectName('');
            setProjectDesc('');
            loadAllData();
        } catch (err) { setError(err.message); }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!selectedProjectId) {
            alert('Pilih project terlebih dahulu!');
            return;
        }
        try {
            await taskService.create({
                title: taskTitle,
                description: taskDesc,
                isCompleted: false,
                projectId: parseInt(selectedProjectId)
            });
            setTaskTitle('');
            setTaskDesc('');
            setSelectedProjectId('');
            loadAllData();
        } catch (err) { setError(err.message); }
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
                {error && <div style={styles.errorBadge}>⚠️ {error}</div>}

                <div style={styles.workspaceGrid}>
                    {/* KOLOM KIRI: MANAGEMENT PROJECT */}
                    <div style={styles.sectionCard}>
                        <h2 style={styles.sectionTitle}>Modul Project</h2>
                        <form onSubmit={handleCreateProject} style={styles.form}>
                            <input type="text" style={styles.input} placeholder="Nama Project..." required value={projectName} onChange={e => setProjectName(e.target.value)} />
                            <textarea style={styles.textarea} placeholder="Deskripsi Project..." required value={projectDesc} onChange={e => setProjectDesc(e.target.value)} />
                            <button type="submit" style={styles.btnPrimary}>Tambah Project</button>
                        </form>

                        <div style={styles.listContainer}>
                            {projects.map(p => (
                                <div key={p.id} style={styles.listItem}>
                                    <div>
                                        <strong style={{color: '#1F2937'}}>{p.name}</strong>
                                        <p style={styles.listSubtext}>{p.description} <span style={styles.idTag}>ID: {p.id}</span></p>
                                    </div>
                                    <button onClick={() => handleDeleteProject(p.id)} style={styles.btnDelete}>Hapus</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* KOLOM KANAN: MANAGEMENT TASK (BERELASI) */}
                    <div style={styles.sectionCard}>
                        <h2 style={styles.sectionTitle}>Modul Task (Relasional)</h2>
                        <form onSubmit={handleCreateTask} style={styles.form}>
                            <select style={styles.input} required value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)}>
                                <option value="">-- Tempelkan ke Project Mana? --</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <input type="text" style={styles.input} placeholder="Nama Tugas / Task..." required value={taskTitle} onChange={e => setTaskTitle(e.target.value)} />
                            <textarea style={styles.textarea} placeholder="Detail Instruksi Task..." required value={taskDesc} onChange={e => setTaskDesc(e.target.value)} />
                            <button type="submit" style={styles.btnSuccess}>Tambah Task Baru</button>
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
                                        <button onClick={() => handleDeleteTask(t.id)} style={styles.btnDelete}>Hapus</button>
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
    container: { minHeight: '100vh', backgroundColor: '#F3F4F6', fontFamily: "'Inter', sans-serif" },
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
    btnDelete: { padding: '4px 10px', fontSize: '12px', fontWeight: '600', color: '#FFFFFF', backgroundColor: '#EF4444', border: 'none', borderRadius: '4px', cursor: 'pointer' },
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