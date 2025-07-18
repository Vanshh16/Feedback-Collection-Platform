import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar, Menu, MenuItem, IconButton, Tooltip, Divider } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BubbleChart as BubbleChartIcon, Logout as LogoutIcon, Dashboard as DashboardIcon } from '@mui/icons-material';
import toast from 'react-hot-toast';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Hook to listen to path changes
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // This effect listens for changes in the URL path.
  // It re-checks for the token, which is useful for ensuring the navbar
  // is in sync after login/registration navigation.
  useEffect(() => {
    setToken(localStorage.getItem('token'));
  }, [location]);

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
    setToken(null); // Update state to re-render the navbar
    navigate('/login');
  };

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        // Glassmorphism effect
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
          // --- Logged-in admin view ---
          <Box>
            <Tooltip title="Account settings">
              <IconButton onClick={handleMenu} size="small" sx={{ ml: 2 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>A</Avatar>
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
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
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
          // --- Logged-out view ---
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