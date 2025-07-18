import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Container } from '@mui/material';
import { Toaster } from 'react-hot-toast'; // Import the toaster
import theme from './theme'; // Import our custom theme

// Import Page Components (assuming they exist)
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import CreateFormPage from './pages/CreateFormPage';
import ViewResponsesPage from './pages/ViewResponsesPage';
import PublicFormPage from './pages/PublicFormPage';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Normalizes styles across browsers */}
      <Toaster position="bottom-right" /> {/* Toaster for notifications */}
      <Router>
        <Navbar />
        <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Routes>
            {/* Routes remain the same */}
            <Route path="/form/:formUrl" element={<PublicFormPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<PrivateRoute />}>
              <Route path="/" element={<AdminDashboard />} />
            </Route>
            <Route path="/create-form" element={<PrivateRoute />}>
              <Route path="/create-form" element={<CreateFormPage />} />
            </Route>
            <Route path="/form/:formId/responses" element={<PrivateRoute />}>
              <Route path="/form/:formId/responses" element={<ViewResponsesPage />} />
            </Route>
            <Route path="/form/edit/:formId" element={<PrivateRoute />}>
              <Route path="/form/edit/:formId" element={<CreateFormPage />} />
            </Route>
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;