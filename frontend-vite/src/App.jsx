import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Pages Import (Sahi path ke saath)
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
// import UserDashboard from './pages/UserDashboard';
import UserDashboard from "./pages/user/UserDashboard";
import ServiceProviders from "./pages/user/ServiceProviders";
import UserBookings from "./pages/user/UserBookings";

// Folder wale pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminBookings from "./pages/Admin/AdminBookings";
import UsersProviders from "./pages/Admin/UsersProviders";
import AddService from "./pages/Admin/AddService";
import ProviderDashboard from "./pages/Provider/ProviderDashboard";
import Onboarding from "./pages/Provider/Onboarding";
import ManageBookings from "./pages/Provider/ManageBookings";

// Security Component
import ProtectedRoute from "./components/ProtectedRoute";



function App() {
  return (
    <BrowserRouter>
      {/* Notifications ke liye */}
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />

      <Routes>
        {/* --- Public Routes (Sab dekh sakte hain) --- */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* --- Protected Routes (Sirf Login ke baad) --- */}

        {/* Normal User Ka Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRole="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        {/* User Bookings */}
        <Route
          path="/bookings"
          element={
            <ProtectedRoute allowedRole="user">
              <UserBookings />
            </ProtectedRoute>
          }
        />

        {/* route for the user to service provder */}
        <Route path="/services/:category" element={<ServiceProviders />} />

        {/* Service Provider Ke Pages */}
        <Route
          path="/provider"
          element={
            <ProtectedRoute allowedRole="provider">
              <ProviderDashboard />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/provider/onboarding" 
          element={
            <ProtectedRoute allowedRole="provider">
              <Onboarding />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/provider/bookings"
          element={
            <ProtectedRoute allowedRole="provider">
              <ManageBookings />
            </ProtectedRoute>
          }
        />

        {/* Admin Ka Control Panel */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users-providers"
          element={
            <ProtectedRoute allowedRole="admin">
              <UsersProviders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/add-service"
          element={
            <ProtectedRoute allowedRole="admin">
              <AddService />
            </ProtectedRoute>
          }
        />

        {/* 404 - Not Found */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
