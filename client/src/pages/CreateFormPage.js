import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container, Typography, Box, TextField, Button, Paper, IconButton, Select, MenuItem,
  FormControl, InputLabel, Grid, useTheme, Switch, FormControlLabel, Skeleton, Alert, Rating,
} from '@mui/material';
import { 
    Add as AddIcon, DeleteOutline as DeleteIcon, ShortText as ShortTextIcon, 
    RadioButtonChecked as RadioButtonCheckedIcon, ArrowBack as ArrowBackIcon, Save as SaveIcon,
    Notes as ParagraphIcon, CheckBox as CheckBoxIcon, ArrowDropDownCircle as DropdownIcon, Star as StarIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';

const CreateFormPage = () => {
  const { formId } = useParams(); // Check for a formId in the URL
  const isEditMode = Boolean(formId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(isEditMode); // Start loading if in edit mode
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();

  // Fetch form data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchForm = async () => {
        try {
          const res = await api.get(`/forms/${formId}`);
          setTitle(res.data.title);
          setDescription(res.data.description || '');
          // Ensure every question has a 'required' field for backward compatibility
          const fetchedQuestions = res.data.questions.map(q => ({ ...q, required: q.required || false }));
          setQuestions(fetchedQuestions);
        } catch (err) {
          console.error(err);
          toast.error('Could not load form for editing.');
          setError('Failed to load form data. You may not have permission to edit this form.');
        } finally {
          setLoading(false);
        }
      };
      fetchForm();
    } else {
        // If creating a new form, start with one default question
        setQuestions([{ questionText: '', questionType: 'text', options: [], required: false }]);
    }
  }, [formId, isEditMode]);

  const handleAddQuestion = () => {
    setQuestions([...questions, { questionText: '', questionType: 'text', options: [], required: false }]);
  };

  const handleRemoveQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };
  
  const handleQuestionUpdate = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleTypeChange = (index, newType) => {
    const newQuestions = [...questions];
    newQuestions[index].questionType = newType;
    // Reset options if switching to a type that doesn't use them
    if (!['multiple-choice', 'checkboxes', 'dropdown'].includes(newType)) {
      newQuestions[index].options = [];
    } else if (newQuestions[index].options.length === 0) {
      // Add a default option if switching to an option-based type
      newQuestions[index].options = ['Option 1'];
    }
    setQuestions(newQuestions);
  };

  const handleOptionUpdate = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const handleAddOption = (qIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push(`Option ${newQuestions[qIndex].options.length + 1}`);
    setQuestions(newQuestions);
  };

  const handleRemoveOption = (qIndex, oIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, i) => i !== oIndex);
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('Form title is required.'); return; }
    if (questions.some(q => !q.questionText.trim())) { toast.error('All question fields must be filled out.'); return; }
    if (questions.some(q => ['multiple-choice', 'checkboxes', 'dropdown'].includes(q.questionType) && q.options.some(opt => !opt.trim()))) {
      toast.error('All options for multiple-choice, checkbox, or dropdown questions must be filled out.'); return;
    }

    setSaving(true);
    const toastId = toast.loading(isEditMode ? 'Updating form...' : 'Saving form...');
    const formData = { title, description, questions };

    try {
      if (isEditMode) {
        await api.put(`/forms/${formId}`, formData);
        toast.success('Form updated successfully!', { id: toastId });
      } else {
        await api.post('/forms', formData);
        toast.success('Form created successfully!', { id: toastId });
      }
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} form.`;
      toast.error(message, { id: toastId });
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 }, exit: { opacity: 0 } };

  if (loading) {
    return (
        <Container maxWidth="md">
            <Skeleton variant="text" width={250} height={60} />
            <Skeleton variant="text" width={400} height={30} sx={{mb: 4}}/>
            <Grid container spacing={4}>
                <Grid item xs={12} md={4}><Skeleton variant="rectangular" height={150} sx={{borderRadius: 2}} /></Grid>
                <Grid item xs={12} md={8}><Skeleton variant="rectangular" height={250} sx={{borderRadius: 2}} /></Grid>
            </Grid>
        </Container>
    );
  }

  if (error) {
      return <Alert severity="error" sx={{m: 4}}>{error}</Alert>
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Button component={RouterLink} to="/" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>Back to Dashboard</Button>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>{isEditMode ? 'Edit Form' : 'Create a New Form'}</Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>{isEditMode ? 'Modify your form details below.' : 'Build your form by adding a title and your questions.'}</Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, position: 'sticky', top: theme.spacing(10) }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Form Settings</Typography>
              <TextField fullWidth label="Form Title" value={title} onChange={(e) => setTitle(e.target.value)} variant="filled" required />
              <TextField
                fullWidth
                label="Form Description (Optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                variant="filled"
                multiline
                rows={4}
                sx={{ mt: 2 }}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <AnimatePresence>
              {questions.map((q, qIndex) => (
                <motion.div key={qIndex} variants={itemVariants} initial="hidden" animate="visible" exit="exit" layout>
                  <Paper sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <TextField fullWidth placeholder="Enter your question here" value={q.questionText} onChange={(e) => handleQuestionUpdate(qIndex, 'questionText', e.target.value)} variant="standard" />
                      <FormControl sx={{ minWidth: 180 }} size="small">
                        <InputLabel>Type</InputLabel>
                        <Select value={q.questionType} label="Type" onChange={(e) => handleTypeChange(qIndex, e.target.value)}>
                          <MenuItem value="text"><ShortTextIcon sx={{ mr: 1 }}/> Text</MenuItem>
                          <MenuItem value="paragraph"><ParagraphIcon sx={{ mr: 1 }}/> Paragraph</MenuItem>
                          <MenuItem value="multiple-choice"><RadioButtonCheckedIcon sx={{ mr: 1 }}/> Multiple Choice</MenuItem>
                          <MenuItem value="checkboxes"><CheckBoxIcon sx={{ mr: 1 }}/> Checkboxes</MenuItem>
                          <MenuItem value="dropdown"><DropdownIcon sx={{ mr: 1 }}/> Dropdown</MenuItem>
                          <MenuItem value="rating-scale"><StarIcon sx={{ mr: 1 }}/> Rating (1-5)</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    {/* Render options for relevant question types */}
                    {['multiple-choice', 'checkboxes', 'dropdown'].includes(q.questionType) && (
                      <Box sx={{ mt: 2, ml: 4 }}>
                        {q.options.map((opt, oIndex) => (
                          <Box key={oIndex} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <TextField value={opt} onChange={(e) => handleOptionUpdate(qIndex, oIndex, e.target.value)} variant="standard" size="small" fullWidth />
                            <IconButton onClick={() => handleRemoveOption(qIndex, oIndex)} disabled={q.options.length <= 1} size="small"><DeleteIcon fontSize="small" /></IconButton>
                          </Box>
                        ))}
                        <Button size="small" startIcon={<AddIcon />} onClick={() => handleAddOption(qIndex)} sx={{ mt: 1 }}>Add Option</Button>
                      </Box>
                    )}
                    {q.questionType === 'rating-scale' && (
                        <Box sx={{mt: 2, ml: 4}}>
                            <Rating name="read-only" value={3} readOnly />
                            <Typography variant="caption" color="text.secondary" sx={{ml: 2}}>Preview of rating scale</Typography>
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 2, borderTop: 1, borderColor: 'divider', pt: 1 }}>
                      <FormControlLabel control={<Switch checked={q.required} onChange={(e) => handleQuestionUpdate(qIndex, 'required', e.target.checked)} />} label="Required" />
                      <IconButton onClick={() => handleRemoveQuestion(qIndex)} disabled={questions.length <= 1}><DeleteIcon /></IconButton>
                    </Box>
                  </Paper>
                </motion.div>
              ))}
            </AnimatePresence>
            <Button fullWidth startIcon={<AddIcon />} onClick={handleAddQuestion} variant="outlined" sx={{ mt: 1, py:1 }}>Add Question</Button>
          </Grid>
        </Grid>
        
        <Paper elevation={3} sx={{ position: 'sticky', bottom: 0, mt: 4, p: 2, zIndex: 1100 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <Button component={RouterLink} to="/" sx={{ mr: 2 }}>Cancel</Button>
                <Button type="submit" variant="contained" size="large" startIcon={<SaveIcon />} disabled={saving}>
                    {saving ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Form' : 'Save Form')}
                </Button>
            </Box>
        </Paper>
      </Box>
    </motion.div>
  );
};

export default CreateFormPage;