import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Simulation from './components/Simulation';
import DriversManagement from './components/DriversManagement';
import RoutesManagement from './components/RoutesManagement';
import OrdersManagement from './components/OrdersManagement';
import Navbar from './components/Navbar';
import { Toaster } from 'react-hot-toast';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/simulation" element={<Simulation />} />
          <Route path="/drivers" element={<DriversManagement />} />
          <Route path="/routes" element={<RoutesManagement />} />
          <Route path="/orders" element={<OrdersManagement />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <AppContent />
          <Toaster position="top-right" />
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;