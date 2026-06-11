const BASE_URL = 'http://localhost:5084/api/Projects';


const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const projectService = {
    
    getAll: async () => {
        const response = await fetch(BASE_URL, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Gagal mengambil data project');
        return await response.json();
    },

    
    create: async (projectData) => {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(projectData)
        });
        if (!response.ok) throw new Error('Gagal membuat project baru');
        return await response.json();
    },

    
    delete: async (id) => {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Gagal menghapus project');
        return await response.json();
    }
};