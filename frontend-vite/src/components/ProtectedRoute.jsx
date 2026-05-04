import React from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ProtectedRoute = ({ children, allowedRole }) => {
  // 1. LocalStorage se Token aur User ka data nikalna
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  // 2. Agar token nahi hai, matlab user login nahi hai
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = String(user?.role || "").toLowerCase().trim();
  const needRole = String(allowedRole || "").toLowerCase().trim();

  if (userRole !== needRole) {
    toast.error("Access Denied: You don't have permission! 🚫");

    if (userRole === "admin") return <Navigate to="/admin" replace />;
    if (userRole === "provider") return <Navigate to="/provider" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  // 4. Agar sab sahi hai, toh page (children) dikhao
  return children;
};

export default ProtectedRoute;