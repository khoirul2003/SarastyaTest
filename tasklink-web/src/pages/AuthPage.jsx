import React, { useState } from 'react';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

export const AuthPage = () => {
    const { login } = useAuth();
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (isRegister) {
                await authService.register(username, password);
                setSuccess('Registrasi berhasil! Silakan beralih ke menu Login.');
                setIsRegister(false);
                setPassword('');
            } else {
                const data = await authService.login(username, password);
                login(data.token, data.username);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <h1 style={styles.logo}>Task<span style={{ color: '#4F46E5' }}>Link</span></h1>
                    <p style={styles.subtitle}>
                        {isRegister ? 'Daftar akun untuk mengelola projek Anda' : 'Masuk untuk mengakses workspace'}
                    </p>
                </div>

                {error && <div style={styles.errorBadge}> {error}</div>}
                {success && <div style={styles.successBadge}> {success}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Username</label>
                        <input 
                            type="text" 
                            style={styles.input} 
                            placeholder="Masukkan username Anda"
                            required 
                            value={username} 
                            onChange={e => setUsername(e.target.value)} 
                        />
                    </div>
                    
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <input 
                            type="password" 
                            style={styles.input} 
                            placeholder="••••••••"
                            required 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                        />
                    </div>

                    <button type="submit" disabled={loading} style={styles.button}>
                        {loading ? 'Memproses...' : isRegister ? 'Register' : 'Login'}
                    </button>
                </form>

                <div style={styles.footer}>
                    <p style={styles.footerText}>
                        {isRegister ? 'Sudah memiliki akun?' : 'Belum memiliki akun?'}
                        <span style={styles.link} onClick={() => { setIsRegister(!isRegister); setError(''); setSuccess(''); }}>
                            {isRegister ? ' Login di sini' : ' Daftar di sini'}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};


const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#F3F4F6', 
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    card: {
        width: '100%',
        maxWidth: '420px',
        padding: '40px 32px',
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        boxSizing: 'border-box',
    },
    header: {
        textAlign: 'center',
        marginBottom: '32px',
    },
    logo: {
        margin: '0 0 8px 0',
        fontSize: '28px',
        fontWeight: '8px',
        letterSpacing: '-0.5px',
        color: '#1F2937',
    },
    subtitle: {
        margin: 0,
        fontSize: '14px',
        color: '#6B7280',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    label: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#374151',
    },
    input: {
        padding: '12px 16px',
        fontSize: '14px',
        borderRadius: '8px',
        border: '1px solid #D1D5DB',
        backgroundColor: '#F9FAFB',
        outline: 'none',
        transition: 'all 0.2s ease',
        boxSizing: 'border-box',
    },
    button: {
        padding: '12px',
        marginTop: '8px',
        fontSize: '15px',
        fontWeight: '600',
        color: '#FFFFFF',
        backgroundColor: '#4F46E5', 
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
    },
    errorBadge: {
        padding: '12px',
        marginBottom: '20px',
        fontSize: '13px',
        color: '#991B1B',
        backgroundColor: '#FEE2E2',
        borderRadius: '8px',
        border: '1px solid #FCA5A5',
    },
    successBadge: {
        padding: '12px',
        marginBottom: '20px',
        fontSize: '13px',
        color: '#065F46',
        backgroundColor: '#D1FAE5',
        borderRadius: '8px',
        border: '1px solid #A7F3D0',
    },
    footer: {
        marginTop: '24px',
        textAlign: 'center',
    },
    footerText: {
        fontSize: '14px',
        color: '#4B5563',
        margin: 0,
    },
    link: {
        color: '#4F46E5',
        fontWeight: '600',
        cursor: 'pointer',
        textDecoration: 'none',
    }
};