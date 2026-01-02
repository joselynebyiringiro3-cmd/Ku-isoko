import axios from 'axios';
import { toast } from 'react-toastify';

// Create axios instance
const apiURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const baseURL = apiURL.endsWith('/api') || apiURL.endsWith('/api/') ? apiURL : `${apiURL}/api`;

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - attach token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            const message = error.response.data?.message || 'An error occurred';

            // Handle 401 - Unauthorized
            if (error.response.status === 401) {
                if (window.location.pathname !== '/login') {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    toast.error('Session expired. Please log in again.');
                    window.location.href = '/login';
                } else {
                    // On login page, just show the specific error (e.g., "Invalid credentials")
                    toast.error(message);
                }
            }

            // Handle 403 - Forbidden
            else if (error.response.status === 403) {
                toast.error(message);
            }

            // Handle other errors
            else {
                toast.error(message);
            }
        } else if (error.request) {
            toast.error('Network error. Please check your connection.');
        } else {
            toast.error('An unexpected error occurred.');
        }

        return Promise.reject(error);
    }
);

export default api;
