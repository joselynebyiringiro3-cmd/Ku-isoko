import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const GoogleSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { registerToken } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        const role = searchParams.get('role');

        if (token) {
            registerToken(token);

            // Redirect based on role
            if (role === 'admin') {
                navigate('/admin/dashboard');
            } else if (role === 'seller') {
                navigate('/seller/dashboard');
            } else {
                navigate('/');
            }
        } else {
            navigate('/login');
        }
    }, [searchParams, registerToken, navigate]);

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <Loader />
            <p style={{ marginTop: '1rem', color: '#667eea', fontWeight: '600' }}>Completing login...</p>
        </div>
    );
};

export default GoogleSuccess;
