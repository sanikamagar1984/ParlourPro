import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import your components (make sure file names match exactly)
import Homepage from './pages/Homepage';  // File is Homepage.js (lowercase 'p')
import Login from './pages/login';        // File: login.js
import Sign from './pages/sign';          // File: sign.js
import Dashboard from './pages/Dashboard'; // Admin dashboard: Dashboard.js
import UserDashboard from './pages/UserDashboard'; // Employee dashboard: UserDashboard.js
import ForgotPassword from './pages/ForgotPassword'; // File: ForgotPassword.js
import ResetPassword from "./pages/ResetPassword"; // File: ResetPassword.js

// Simple Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [userRole, setUserRole] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(data.authenticated);
        setUserRole(data.user?.role || null);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f5f7fa'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Check role if required
  if (requiredRole && userRole !== requiredRole) {
    // Redirect to appropriate dashboard based on actual role
    if (userRole === 'admin') {
      return <Navigate to="/dashboard" />;
    } else {
      return <Navigate to="/user-dashboard" />;
    }
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/sign" element={<Sign />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          {/* Protected routes with role-based access */}
          
          {/* ADMIN DASHBOARD - only accessible to admin role */}
          <Route path="/dashboard" element={
            <ProtectedRoute requiredRole="admin">
              <Dashboard />
            </ProtectedRoute>
          } />
          
          {/* USER/EMPLOYEE DASHBOARD - only accessible to employee role */}
          <Route path="/user-dashboard" element={
            <ProtectedRoute requiredRole="employee">
              <UserDashboard />
            </ProtectedRoute>
          } />
          
          {/* Redirect any other route to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;