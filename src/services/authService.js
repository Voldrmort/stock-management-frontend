// src/services/authService.js

import axios from 'axios';

// ✅ Create an Axios Instance for Auth API Calls
const API = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL || 'http://localhost:5000',
});

// ✅ User Login
export const login = async (username, password) => {
    try {
        const response = await API.post('/auth/login', { username, password });
        const { token } = response.data;

        // Store Token in Local Storage
        localStorage.setItem('token', token);

        return response.data;
    } catch (error) {
        console.error('Login Error:', error.response?.data || error.message);
        throw error;
    }
};

// ✅ User Registration
export const register = async (username, password) => {
    try {
        const response = await API.post('/auth/register', { username, password });
        return response.data;
    } catch (error) {
        console.error('Registration Error:', error.response?.data || error.message);
        throw error;
    }
};

// ✅ User Logout
export const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
};

// ✅ Check if User is Authenticated
export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};
