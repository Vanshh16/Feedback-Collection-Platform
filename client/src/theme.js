import { createTheme } from '@mui/material/styles';

// Define our custom color palette
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6366f1', // A modern indigo
    },
    secondary: {
      main: '#f43f5e', // A vibrant rose for accents
    },
    background: {
      default: '#f8fafc', // A very light grey for the page background
      paper: '#ffffff',
    },
    text: {
        primary: '#1e293b', // A darker slate for primary text
        secondary: '#64748b', // A lighter slate for secondary text
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 8, // Slightly more rounded corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // More modern buttons without all-caps
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
        styleOverrides: {
            root: {
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)', // A softer default shadow
            }
        }
    }
  },
});

export default theme;