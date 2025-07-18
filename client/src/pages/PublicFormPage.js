import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container, Typography, Box, TextField, Button, Paper, CircularProgress, Radio, RadioGroup,
  FormControlLabel, FormControl, FormLabel, Skeleton, Checkbox, FormGroup, Rating, Select, MenuItem, InputLabel,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import { CheckCircleOutline as CheckCircleIcon, ErrorOutline as ErrorIcon, Lock as LockIcon } from '@mui/icons-material';

// Helper component to render the correct input based on question type
const QuestionRenderer = ({ question, answer, handleAnswerChange }) => {
    const questionId = question._id; // Use the unique question ID for state

    switch (question.questionType) {
        case 'text':
            return <TextField fullWidth variant="filled" placeholder="Your answer here..." value={answer || ''} onChange={(e) => handleAnswerChange(questionId, e.target.value)} />;
        case 'paragraph':
            return <TextField fullWidth variant="filled" multiline rows={4} placeholder="Your detailed answer here..." value={answer || ''} onChange={(e) => handleAnswerChange(questionId, e.target.value)} />;
        case 'multiple-choice':
            return (
                <RadioGroup value={answer || ''} onChange={(e) => handleAnswerChange(questionId, e.target.value)}>
                    {question.options.map((option, oIndex) => (
                        <FormControlLabel key={oIndex} value={option} control={<Radio />} label={option} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, m: 0, mb: 1, p: 0.5, '&:hover': { borderColor: 'primary.main' } }} />
                    ))}
                </RadioGroup>
            );
        case 'checkboxes':
            const handleCheckboxChange = (option) => {
                const currentAnswers = answer || [];
                const newAnswers = currentAnswers.includes(option)
                    ? currentAnswers.filter(a => a !== option)
                    : [...currentAnswers, option];
                handleAnswerChange(questionId, newAnswers);
            };
            return (
                <FormGroup>
                    {question.options.map((option, oIndex) => (
                        <FormControlLabel key={oIndex} control={<Checkbox checked={(answer || []).includes(option)} onChange={() => handleCheckboxChange(option)} />} label={option} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, m: 0, mb: 1, p: 0.5, '&:hover': { borderColor: 'primary.main' } }} />
                    ))}
                </FormGroup>
            );
        case 'dropdown':
            return (
                <FormControl fullWidth variant="filled">
                    <InputLabel>Select an option</InputLabel>
                    <Select value={answer || ''} onChange={(e) => handleAnswerChange(questionId, e.target.value)}>
                        {question.options.map((option, oIndex) => (
                            <MenuItem key={oIndex} value={option}>{option}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            );
        case 'rating-scale':
            return <Rating size="large" value={Number(answer) || 0} onChange={(e, newValue) => handleAnswerChange(questionId, newValue)} />;
        default:
            return null;
    }
};

const PublicFormPage = () => {
  const { formUrl } = useParams();
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formStatus, setFormStatus] = useState('open');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 700));
        const res = await api.get(`/forms/public/${formUrl}`);
        setForm(res.data);
        const initialAnswers = {};
        res.data.questions.forEach(q => {
          initialAnswers[q._id] = q.questionType === 'checkboxes' ? [] : '';
        });
        setAnswers(initialAnswers);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Form not found or the link is invalid.');
        if (err.response?.data?.formStatus) {
            setFormStatus(err.response.data.formStatus);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [formUrl]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // New Validation Logic
    for (const q of form.questions) {
        if (q.required) {
            const answer = answers[q._id];
            if (q.questionType === 'checkboxes') {
                if (!answer || answer.length === 0) {
                    toast.error(`Question "${q.questionText}" is required.`);
                    return;
                }
            } else {
                if (!answer || String(answer).trim() === '') {
                    toast.error(`Question "${q.questionText}" is required.`);
                    return;
                }
            }
        }
    }

    const formattedAnswers = form.questions.map(q => ({
        questionText: q.questionText,
        answer: Array.isArray(answers[q._id]) ? answers[q._id].join(', ') : String(answers[q._id])
    }));

    setSubmitting(true);
    try {
        await api.post(`/responses/${form._id}`, { answers: formattedAnswers });
        setSubmitted(true);
    } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || 'There was an error submitting your feedback.');
    } finally {
        setSubmitting(false);
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Skeleton variant="text" width="70%" height={60} />
        <Skeleton variant="text" width="40%" height={30} sx={{mb: 4}} />
        <Skeleton variant="rectangular" height={100} sx={{ mb: 3, borderRadius: 2 }} />
        <Skeleton variant="rectangular" height={150} sx={{ mb: 3, borderRadius: 2 }} />
      </Container>
    );
  }

  if (error) {
    return (
        <Box textAlign="center" mt={10}>
            {formStatus === 'closed' ? <LockIcon sx={{ fontSize: 80, color: 'secondary.main' }} /> : <ErrorIcon sx={{ fontSize: 80, color: 'secondary.main' }} />}
            <Typography variant="h5" sx={{ mt: 2, fontWeight: 600 }}>{formStatus === 'closed' ? 'Form Closed' : 'Oops! Form Not Found'}</Typography>
            <Typography color="text.secondary">{error}</Typography>
        </Box>
    );
  }
  
  if (submitted) {
    return (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring' }}>
            <Box textAlign="center" mt={10}>
                <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main' }} />
                <Typography variant="h4" sx={{ mt: 2, fontWeight: 'bold' }}>Thank You!</Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>Your feedback has been submitted successfully.</Typography>
            </Box>
        </motion.div>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ my: 4 }}>
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <Paper elevation={0} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
          <motion.div variants={itemVariants}>
            <Typography variant="h4" component="h1" gutterBottom textAlign="center" sx={{ fontWeight: 'bold' }}>{form.title}</Typography>
            <Typography color="text.secondary" textAlign="center" sx={{ mb: 4 }}>Please fill out the form below.</Typography>
          </motion.div>
          <Box component="form" onSubmit={handleSubmit}>
              {form.questions.map((q, index) => (
                <motion.div key={q._id} variants={itemVariants}>
                  <Box sx={{ mb: 4 }}>
                    <FormControl component="fieldset" fullWidth>
                      <FormLabel component="legend" sx={{ mb: 1.5, fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}>
                        {`Q${index + 1}: ${q.questionText}`}
                        {q.required && <Typography component="span" color="error" sx={{ ml: 0.5 }}>*</Typography>}
                      </FormLabel>
                      <QuestionRenderer question={q} answer={answers[q._id]} handleAnswerChange={handleAnswerChange} />
                    </FormControl>
                  </Box>
                </motion.div>
              ))}
            <motion.div variants={itemVariants}>
                <Box sx={{ position: 'relative' }}>
                    <Button type="submit" fullWidth variant="contained" size="large" disabled={submitting} sx={{ mt: 2, py: 1.5, fontWeight: 'bold' }}>
                        Submit Feedback
                    </Button>
                    {submitting && <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', left: '50%', marginTop: '-12px', marginLeft: '-12px' }} />}
                </Box>
            </motion.div>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default PublicFormPage;