import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Typography,
  Button,
  Box,
  Grid,
  Skeleton,
  Alert,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Switch,
  Chip,
  Stack,
  Paper,
} from '@mui/material';
import { 
    Add as AddIcon, 
    ContentCopy as CopyIcon, 
    DeleteOutline as DeleteIcon, 
    BarChart as ChartIcon,
    Edit as EditIcon,
    LockOpen as LockOpenIcon,
    Lock as LockIcon,
    LooksOne as LooksOneIcon,
    LooksTwo as LooksTwoIcon,
    Looks3 as Looks3Icon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';

// Updated Empty State with Onboarding Guide
const EmptyStateVector = () => (
    <Box>
        <Typography variant="h5" sx={{ mt: 3, fontWeight: '600' }}>Welcome to FeedbackFlow!</Typography>
        <Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>
            It looks like you're ready to gather some feedback. Follow these steps to get started.
        </Typography>
        <Stack spacing={3}>
            <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <LooksOneIcon color="primary" />
                <Typography>Click <strong>"Create Form"</strong> to build your first feedback form.</Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <LooksTwoIcon color="primary" />
                <Typography>Add your questions and share the public link with your users.</Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Looks3Icon color="primary" />
                <Typography>Come back here to see the responses and analyze the results!</Typography>
            </Paper>
        </Stack>
    </Box>
);

const AdminDashboard = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchForms = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500)); 
        const res = await api.get('/forms');
        setForms(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch forms. Please try again later.');
        toast.error('Could not fetch forms.');
      } finally {
        setLoading(false);
      }
    };
    fetchForms();
  }, []);

  const openDeleteDialog = (form) => {
    setFormToDelete(form);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setFormToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!formToDelete) return;
    const toastId = toast.loading('Deleting form...');
    try {
      await api.delete(`/forms/${formToDelete._id}`);
      setForms(forms.filter((form) => form._id !== formToDelete._id));
      toast.success('Form deleted successfully!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete form.', { id: toastId });
    } finally {
      closeDeleteDialog();
    }
  };

  const handleCopyLink = (publicUrl) => {
    const link = `${window.location.origin}/form/${publicUrl}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard!');
  };

  // ***** NEW FUNCTION for toggling form status *****
  const handleToggleStatus = async (formId, currentStatus) => {
    const newStatus = currentStatus === 'open' ? 'closed' : 'open';
    const toastId = toast.loading(`Setting form to ${newStatus}...`);
    try {
        const res = await api.put(`/forms/${formId}`, { status: newStatus });
        setForms(forms.map(form => form._id === formId ? res.data : form));
        toast.success(`Form is now ${newStatus}!`, { id: toastId });
    } catch (err) {
        console.error(err);
        toast.error('Could not update form status.', { id: toastId });
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>Your Forms</Typography>
            <Typography variant="subtitle1" color="text.secondary">Manage, share, and analyze your feedback forms.</Typography>
          </Box>
          <Button variant="contained" size="large" startIcon={<AddIcon />} component={RouterLink} to="/create-form" sx={{ boxShadow: (theme) => `0 4px 14px 0 ${theme.palette.primary.main}40` }}>
            Create Form
          </Button>
        </Box>
      </motion.div>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Grid container spacing={3}>
          {Array.from(new Array(3)).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}><Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} /></Grid>
          ))}
        </Grid>
      ) : forms.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            <Box textAlign="center" mt={8} mx="auto" maxWidth="md">
                <EmptyStateVector />
            </Box>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <Grid container spacing={6}>
            <AnimatePresence>
              {forms.map((form) => (
                <Grid size={5} item xs={12} sm={6} md={4} key={form._id}>
                  <motion.div variants={itemVariants} layout exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.3 }} whileHover={{ y: -5, scale: 1.02 }}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.3s', '&:hover': { boxShadow: 6 } }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="h6" component="h2" sx={{ fontWeight: '600', mb: 1, pr: 1 }}>
                            {form.title}
                            </Typography>
                            <Tooltip title={`Status: ${form.status}. Click to toggle.`}>
                                <Switch checked={form.status === 'open'} onChange={() => handleToggleStatus(form._id, form.status)} />
                            </Tooltip>
                        </Box>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                            <Chip 
                                icon={form.status === 'open' ? <LockOpenIcon /> : <LockIcon />}
                                label={form.status} 
                                color={form.status === 'open' ? 'success' : 'error'} 
                                size="small" 
                                variant="outlined"
                            />
                            <Chip 
                                label={`${form.responseCount} Response(s)`} 
                                size="small" 
                            />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          Created: {new Date(form.createdAt).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'flex-end', pr: 1, pb: 1 }}>
                        <Tooltip title={form.responseCount > 0 ? "Cannot edit forms with responses" : "Edit Form"}>
                            <span> {/* Span is needed to allow tooltip on a disabled button */}
                                <IconButton onClick={() => navigate(`/form/edit/${form._id}`)} disabled={form.responseCount > 0}>
                                    <EditIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="Copy Share Link"><IconButton onClick={() => handleCopyLink(form.publicUrl)}><CopyIcon /></IconButton></Tooltip>
                        <Tooltip title="View Responses"><IconButton onClick={() => navigate(`/form/${form._id}/responses`)}><ChartIcon /></IconButton></Tooltip>
                        <Tooltip title="Delete Form"><IconButton onClick={() => openDeleteDialog(form)} sx={{ color: 'secondary.main' }}><DeleteIcon /></IconButton></Tooltip>
                      </CardActions>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </AnimatePresence>
          </Grid>
        </motion.div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle sx={{ fontWeight: '600' }}>Delete Form?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the form "<strong>{formToDelete?.title}</strong>"? All of its responses will be permanently deleted. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="secondary" autoFocus>Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminDashboard;