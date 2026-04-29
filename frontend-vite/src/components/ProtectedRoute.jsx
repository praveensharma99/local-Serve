import React from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ProtectedRoute = ({ children, allowedRole }) => {
  // 1. LocalStorage se Token aur User ka data nikalna
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  // 2. Agar token nahi hai, matlab user login nahi hai
  if (!token || !user) {
    // Bina login ke access karne par warning (Optional)
    // toast.warn("Please login to access this page!"); 
    return <Navigate to="/login" replace />;
  }

  // 3. Role-Based Check
  // Agar user login hai par uska role (e.g., 'user') allowedRole (e.g., 'admin') se match nahi karta
  if (user.role !== allowedRole) {
    toast.error("Access Denied: You don't have permission! 🚫");
    
    // Use uske sahi dashboard par wapas bhej do
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'provider') return <Navigate to="/provider" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  // 4. Agar sab sahi hai, toh page (children) dikhao
  return children;
};

export default ProtectedRoute;