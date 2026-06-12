const BASE_URL = 'http://localhost:5084/api/Tasks';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const taskService = {
    
    getAll: async () => {
        const response = await fetch(BASE_URL, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Gagal mengambil data task');
        return await response.json();
    },

    
    create: async (taskData) => {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(taskData)
        });
        if (!response.ok) throw new Error('Gagal membuat task baru');
        return await response.json();
    },

    
    delete: async (id) => {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Gagal menghapus task');
        return await response.json();
    }
};