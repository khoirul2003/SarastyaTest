const BASE_URL = 'http://localhost:5084/api/Auth';

export const authService = {
    register: async (username, password) => {
        const response = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Registrasi gagal');
        return data;
    },

    login: async (username, password) => {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Login gagal');
        return data; 
    }
};