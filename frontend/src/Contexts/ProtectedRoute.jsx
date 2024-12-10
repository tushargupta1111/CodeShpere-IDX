import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('auth-token'); // Check if the user has a valid token
  return token ? children : <Navigate to="/login" />; // If no token, redirect to login
};

export default ProtectedRoute;