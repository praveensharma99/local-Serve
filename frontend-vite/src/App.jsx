import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Pages Import (Sahi path ke saath)
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
// import UserDashboard from './pages/UserDashboard';
import UserDashboard from "./pages/User/UserDashboard";
import ServiceProviders from "./pages/User/ServiceProviders";

// Folder wale pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ProviderDashboard from "./pages/Provider/ProviderDashboard";
import Onboarding from "./pages/Provider/Onboarding";

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

        {/* route for the user to service provder */}
        <Route path="/services/:category" element={<ServiceProviders />} />

        {/* Service Provider Ke Pages */}

        {/* Temporary: Bina protection ke check karne ke liye */}
<Route path="/admin" element={<AdminDashboard />} /> 
<Route path="/provider" element={<ProviderDashboard />} />
{/* <Route path="/provider/onboarding" element={<Onboarding />} /> */}
<Route path="/onboarding" element={<Onboarding />} />
        {/* <Route
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
        /> */}

        {/* Admin Ka Control Panel */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
