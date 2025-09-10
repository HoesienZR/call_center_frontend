// src/services/api.js
import { API_BASE_URL } from '../config';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (token) {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`,
        };
    } else {
        // اگر توکن وجود ندارد، کاربر لاگین نکرده است
        // می‌توانید به صفحه لاگین ریدایرکت کنید یا خطا نشان دهید
        return { 'Content-Type': 'application/json' };
    }
};

export const fetchProjects = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/projects/`, {
            method: 'GET',
            headers: getAuthHeaders(), // **اینجا هدر احراز هویت را اضافه می‌کنیم**
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        } else if (response.status === 401 || response.status === 403) {
            console.error('Authentication failed. Redirecting to login.');
            // window.location.href = '/login'; // می‌توانید کاربر را به صفحه لاگین ریدایرکت کنید
            throw new Error('Authentication required');
        } else {
            const errorData = await response.json();
            console.error('Failed to fetch projects:', errorData);
            throw new Error(errorData.detail || 'Failed to fetch projects');
        }
    } catch (error) {
        console.error('Error fetching projects:', error);
        throw error;
    }
};
