import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// A simple custom hook to check for authentication status
const useAuth = () => {
  // Check for the token in localStorage
  const token = localStorage.getItem('token');
  if (token) {
    // In a real-world app, you might also want to decode the token
    // to check if it's expired. For this assignment, just checking
    // for its existence is sufficient.
    return true;
  }
  return false;
};

const PrivateRoute = () => {
  const isAuthenticated = useAuth();

  // If the user is authenticated, render the child route's content.
  // The <Outlet /> component from react-router-dom does this.
  // If not, redirect them to the /login page.
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;