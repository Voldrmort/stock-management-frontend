import React, { useState } from 'react';
import { login } from './services/authService';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            console.log('🔑 Attempting login with:', username, password); // Debug credentials (remove in production)
            const response = await login(username, password);

            // Debug response from backend
            console.log('✅ Backend Response:', response);

            if (response && response.token) {
                console.log('✅ Token received:', response.token);
                localStorage.setItem('token', response.token);
                navigate('/inventory');
            } else {
                console.error('❌ Token not received in response:', response);
                setError('Login failed: No token received');
            }
        } catch (err) {
            console.error('❌ Login Error:', err);
            setError(err.response?.data?.message || 'Invalid username or password');
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin}>Login</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

export default LoginPage;
