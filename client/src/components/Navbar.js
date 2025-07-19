import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar, Menu, MenuItem, IconButton, Tooltip, Divider } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BubbleChart as BubbleChartIcon, Logout as LogoutIcon, Dashboard as DashboardIcon } from '@mui/icons-material';
import toast from 'react-hot-toast';
import api from '../services/api'; // We'll use this to fetch admin data

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [admin, setAdmin] = useState(null); // New state to hold admin data
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // This effect now also fetches the admin's data when the token is present
  useEffect(() => {
    const updateAuthStatus = async () => {
        const currentToken = localStorage.getItem('token');
        setToken(currentToken);

        if (currentToken) {
            try {
                // Fetch admin data from the /api/auth/me endpoint
                const res = await api.get('/auth/me');
                setAdmin(res.data);
            } catch (err) {
                console.error("Failed to fetch admin data, token might be invalid.", err);
                // If the token is invalid, log the user out
                localStorage.removeItem('token');
                setToken(null);
                setAdmin(null);
                navigate('/login');
            }
        } else {
            setAdmin(null);
        }
    };
    
    updateAuthStatus();
  }, [location, navigate]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    toast.success('You have been logged out.');
    localStorage.removeItem('token');
    setToken(null);
    setAdmin(null); // Clear admin data on logout
    navigate('/login');
  };

  // Helper to get the first initial of the username
  const getInitial = () => {
      if (admin && admin.username) {
          return admin.username.charAt(0).toUpperCase();
      }
      return '?'; // Fallback if admin data isn't loaded yet
  };

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        background: (theme) => theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(18, 18, 18, 0.7)',
        backdropFilter: 'blur(10px)',
        boxShadow: 'inset 0px -1px 1px #E7EBF0',
        color: 'text.primary'
      }}
    >
      <Toolbar>
        <Box component={Link} to={token ? "/" : "/login"} sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
            <BubbleChartIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              FeedbackFlow
            </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {token ? (
          <Box>
            <Tooltip title="Account">
              <IconButton onClick={handleMenu} size="small" sx={{ ml: 2 }}>
                {/* Updated Avatar to display the user's initial */}
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                    {getInitial()}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              onClick={handleClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                  mt: 1.5,
                  '& .MuiAvatar-root': { width: 32, height: 32, ml: -0.5, mr: 1, },
                },
              }}
            >
              <MenuItem component={Link} to="/">
                <DashboardIcon sx={{ mr: 1.5 }}/> Dashboard
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{color: 'secondary.main'}}>
                <LogoutIcon sx={{ mr: 1.5 }}/> Logout
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box>
            <Button component={Link} to="/login" sx={{ color: 'text.secondary' }}>
              Login
            </Button>
            <Button component={Link} to="/register" variant="contained" disableElevation>
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;