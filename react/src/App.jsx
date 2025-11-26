import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import './App.css';

import { Login, Register } from './components/Auth';
import Chat from './components/Chat';
import Profile from './components/Profile';
import Header from './components/Header';
import { getToken } from './api/auth';

/**
 * PrivateRoute component - protects routes that require authentication
 * Redirects to /login if user is not authenticated
 */
function PrivateRoute({ children }) {
  const token = getToken();
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

/**
 * PublicRoute component - redirects authenticated users away from auth pages
 */
function PublicRoute({ children }) {
  const token = getToken();
  
  if (token) {
    return <Navigate to="/chat" replace />;
  }
  
  return children;
}

/**
 * Main App component with routing configuration
 */
function App() {
  const location = useLocation();
  const token = getToken();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  /** Report routes to parent window */
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.handleRoutes === 'function') {
      window.handleRoutes(['/', '/login', '/register', '/chat', '/profile']);
    }
  }, []);

  return (
    <ErrorBoundary>
      <div className="app" data-easytag="id1-src/App.jsx">
        {token && !isAuthPage && <Header />}
        <main className={`main-content ${token && !isAuthPage ? 'with-header' : ''}`}>
          <Routes>
            <Route 
              path="/" 
              element={
                token ? <Navigate to="/chat" replace /> : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />
            <Route 
              path="/chat" 
              element={
                <PrivateRoute>
                  <Chat />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
