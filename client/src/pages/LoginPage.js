import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Link,
  Grid,
  Paper,
  Avatar,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { LockOutlined as LockOutlinedIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';

// A simple SVG for the branding panel, can be replaced with any image/logo
const AuthVector = () => (
    <svg width="100%" height="100%" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#818cf8', stopOpacity:1}} />
                <stop offset="100%" style={{stopColor: '#c084fc', stopOpacity:1}} />
            </linearGradient>
        </defs>
        <path d="M125.7,366.3C37.3,313.4,2,216,43.2,137.7c41.2-78.3,138.7-110.3,222.2-83.5c83.5,26.8,140.2,108.4,144.3,195.7c4.1,87.3-46.5,171.5-128.4,204.2C199.5,487.4,179.9,400.1,125.7,366.3z" fill="url(#grad1)"/>
    </svg>
);


const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { username, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error('Please fill in all fields.');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Signing in...');

    try {
      const res = await api.post('/auth/login', { username, password });
      
      localStorage.setItem('token', res.data.token);
      
      toast.success('Login successful! Redirecting...', { id: toastId });

      // Navigate to the dashboard. The PrivateRoute will handle the rest.
      // We removed window.location.reload() for a smoother SPA experience.
      navigate('/');

    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message, { id: toastId });
      console.error(err);
    } finally {
      // setLoading(false) is not strictly needed here because we navigate away on success.
      // But it's good practice if you have flows that don't navigate.
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="lg" sx={{ height: 'calc(100vh - 64px)', display: 'flex' }}>
      <Grid container sx={{ flexGrow: 1 }}>
        
        {/* Left Branding Panel - Hidden on Mobile */}
        {!isMobile && (
          <Grid
            item
            xs={false}
            sm={4}
            md={7}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
            }}
          >
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
            >
                <Box sx={{ width: '80%', maxWidth: 400 }}>
                    <AuthVector />
                </Box>
                <Typography variant="h4" sx={{ mt: 3, fontWeight: 'bold', color: 'text.primary' }}>
                    Unlock Your Feedback
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Gain insights and drive growth with valuable customer feedback.
                </Typography>
            </motion.div>
          </Grid>
        )}

        {/* Right Login Form Panel */}
        <Grid item xs={12} sm={12} md={5} component={Paper} elevation={6} square sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: isMobile ? 'transparent' : 'background.paper', boxShadow: isMobile ? 'none' : 'inherit' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ width: '100%'}}
          >
            <Box
              sx={{
                my: 8,
                mx: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                <LockOutlinedIcon />
              </Avatar>
              <Typography component="h1" variant="h5">
                Admin Sign In
              </Typography>
              <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 3, width: '100%' }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  value={username}
                  onChange={onChange}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={onChange}
                />
                <Box sx={{ position: 'relative' }}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{ mt: 3, mb: 2, py: 1.5 }}
                  >
                    Sign In
                  </Button>
                  {loading && (
                    <CircularProgress
                      size={24}
                      sx={{
                        color: 'primary.main',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        marginTop: '-12px',
                        marginLeft: '-12px',
                      }}
                    />
                  )}
                </Box>
                <Box textAlign="center">
                  <Link component={RouterLink} to="/register" variant="body2">
                    {"Don't have an account? Register"}
                  </Link>
                </Box>
              </Box>
            </Box>
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LoginPage;