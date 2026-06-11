import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPage } from './pages/AuthPage';

const MainApp = () => {
    const { isAuthenticated, username, logout } = useAuth();

    if (!isAuthenticated) {
        return <AuthPage />;
    }

    return (
        <div style={dashboardStyles.container}>
            <header style={dashboardStyles.header}>
                <h1 style={dashboardStyles.logo}>Task<span style={{ color: '#4F46E5' }}>Link</span> Workspace</h1>
                <div style={dashboardStyles.userProfile}>
                    <span style={dashboardStyles.welcomeText}>Selamat Datang, <strong>{username}</strong></span>
                    <button onClick={logout} style={dashboardStyles.logoutButton}>Keluar</button>
                </div>
            </header>
            
            <main style={dashboardStyles.main}>
                <div style={dashboardStyles.welcomeCard}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#1F2937' }}>Berhasil Login</h2>
                   
                </div>
            </main>
        </div>
    );
};

const dashboardStyles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#F9FAFB',
        fontFamily: "'Inter', sans-serif",
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 40px',
        height: '70px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
    },
    logo: {
        fontSize: '22px',
        fontWeight: '700',
        margin: 0,
        color: '#1F2937',
    },
    userProfile: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
    },
    welcomeText: {
        fontSize: '14px',
        color: '#4B5563',
    },
    logoutButton: {
        padding: '8px 16px',
        fontSize: '13px',
        fontWeight: '600',
        color: '#DC2626',
        backgroundColor: '#FEF2F2',
        border: '1px solid #FCA5A5',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    main: {
        padding: '40px',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    welcomeCard: {
        padding: '24px',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
    }
};

function App() {
    return (
        <AuthProvider>
            <MainApp />
        </AuthProvider>
    );
}

export default App;