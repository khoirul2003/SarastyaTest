import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { projectService } from './services/projectService';

const MainApp = () => {
    const { isAuthenticated, username, logout } = useAuth();
    const [projects, setProjects] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    
    useEffect(() => {
        if (isAuthenticated) {
            fetchProjects();
        }
    }, [isAuthenticated]);

    const fetchProjects = async () => {
        try {
            const data = await projectService.getAll();
            setProjects(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await projectService.create({ name, description });
            setName('');
            setDescription('');
            fetchProjects(); 
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProject = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus project ini?')) {
            try {
                await projectService.delete(id);
                fetchProjects(); 
            } catch (err) {
                alert(err.message);
            }
        }
    };

    if (!isAuthenticated) {
        return <AuthPage />;
    }

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

                <div style={styles.grid}>
                    {/* KIRI: Form Tambah Project */}
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Buat Project Baru</h3>
                        <form onSubmit={handleCreateProject} style={styles.form}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Nama Project</label>
                                <input 
                                    type="text" 
                                    style={styles.input} 
                                    placeholder="Nama project..." 
                                    required 
                                    value={name} 
                                    onChange={e => setName(e.target.value)} 
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Deskripsi</label>
                                <textarea 
                                    style={{...styles.input, height: '80px', resize: 'none'}} 
                                    placeholder="Penjelasan singkat project..." 
                                    required 
                                    value={description} 
                                    onChange={e => setDescription(e.target.value)} 
                                />
                            </div>
                            <button type="submit" disabled={loading} style={styles.button}>
                                {loading ? 'Menyimpan...' : 'Tambah Project'}
                            </button>
                        </form>
                    </div>

                    {/* KANAN: Daftar Project */}
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Daftar Project Anda</h3>
                        {projects.length === 0 ? (
                            <p style={styles.emptyText}>Belum ada project yang terdaftar. Silakan buat di form sebelah kiri.</p>
                        ) : (
                            <div style={styles.projectList}>
                                {projects.map((proj) => (
                                    <div key={proj.id} style={styles.projectItem}>
                                        <div>
                                            <h4 style={styles.projectName}>{proj.name}</h4>
                                            <p style={styles.projectDesc}>{proj.description}</p>
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteProject(proj.id)} 
                                            style={styles.deleteButton}
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
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
    main: { padding: '40px', maxWidth: '1200px', margin: '0 auto' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', alignItems: 'start' },
    card: { padding: '24px', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' },
    cardTitle: { margin: '0 0 20px 0', fontSize: '16px', fontWeight: '700', color: '#1F2937' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '13px', fontWeight: '600', color: '#374151' },
    input: { padding: '10px 14px', fontSize: '14px', borderRadius: '6px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB', outline: 'none', boxSizing: 'border-box' },
    button: { padding: '10px', fontSize: '14px', fontWeight: '600', color: '#FFFFFF', backgroundColor: '#4F46E5', border: 'none', borderRadius: '6px', cursor: 'pointer' },
    errorBadge: { padding: '12px', marginBottom: '20px', fontSize: '13px', color: '#991B1B', backgroundColor: '#FEE2E2', borderRadius: '8px', border: '1px solid #FCA5A5' },
    emptyText: { fontSize: '14px', color: '#6B7280', textAlign: 'center', marginTop: '20px' },
    projectList: { display: 'flex', flexDirection: 'column', gap: '12px' },
    projectItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' },
    projectName: { margin: '0 0 4px 0', fontSize: '15px', fontWeight: '600', color: '#1F2937' },
    projectDesc: { margin: 0, fontSize: '13px', color: '#6B7280' },
    deleteButton: { padding: '6px 12px', fontSize: '12px', fontWeight: '600', color: '#FFFFFF', backgroundColor: '#EF4444', border: 'none', borderRadius: '4px', cursor: 'pointer' }
};

function App() {
    return (
        <AuthProvider>
            <MainApp />
        </AuthProvider>
    );
}

export default App;