// src/utils/auth.js

// ✅ Check if user is authenticated
export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

// ✅ Handle user logout
export const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
};
