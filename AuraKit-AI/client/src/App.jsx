import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './Auth';
import Dashboard from './Dashboard';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={!isAuthenticated ? <Auth setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <Dashboard setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/" />} 
        />
      </Routes>
    </BrowserRouter>
  );
}