import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ForgotPassword from './pages/Auth/ForgotPassword';
import Dashboard from './pages/Dashboard/Dashboard';
import Chat from './pages/Chat/Chat';
import Profile from './pages/Profile/Profile';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LoadingSpinner from './components/UI/LoadingSpinner';
import ReportsPage from './pages/ReportsPage';
import EmergencyPage from './pages/EmergencyPage';

function App() {
  const { isAuthenticated, isLoading, initializeAuth } = useAuthStore();

  // Step 1: initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
        <p className="ml-2 text-lg text-muted-foreground">Loading your app...</p>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-background text-foreground">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--background)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
              },
            }}
          />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
            } />
            <Route path="/signup" element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup />
            } />
            <Route path="/forgot-password" element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPassword />
            } />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="chat" element={<Chat />} />
              <Route path="profile" element={<Profile />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/emergency" element={<EmergencyPage />} />
            </Route>
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
