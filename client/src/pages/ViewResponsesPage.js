import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Skeleton,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Card,
  CardContent,
  Grid,
  useTheme,
  Chip
} from '@mui/material';
import { 
    Download as DownloadIcon, 
    ArrowBack as ArrowBackIcon,
    Assessment as AssessmentIcon,
    TableRows as TableRowsIcon,
    QuestionAnswer as QuestionAnswerIcon,
    PieChart as PieChartIcon,
    BarChart as BarChartIcon
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, PieChart, Pie, Legend } from 'recharts';
import api from '../services/api';

const ViewResponsesPage = () => {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('summary');
  const [chartType, setChartType] = useState('bar'); // State for chart type
  const theme = useTheme();

  const CHART_COLORS = ['#6366f1', '#818cf8', '#a78bfa', '#c084fc', '#e879f9', '#f472b6'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [formRes, responsesRes] = await Promise.all([
          api.get(`/forms/${formId}`),
          api.get(`/responses/${formId}`),
        ]);
        setForm(formRes.data);
        setResponses(responsesRes.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load form responses.');
        toast.error('Could not load responses.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [formId]);

  const handleViewChange = (_, newView) => {
    if (newView !== null) setView(newView);
  };
  
  const handleChartTypeChange = (_, newChartType) => {
    if (newChartType !== null) setChartType(newChartType);
  };

  const handleExport = async () => {
    const toastId = toast.loading('Preparing CSV export...');
    try {
      const response = await api.get(`/responses/${formId}/export`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = `form-${form?.publicUrl || 'export'}-responses.csv`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Download started!', { id: toastId });
    } catch (err) {
      console.error('Failed to export CSV', err);
      toast.error('Could not download the file.', { id: toastId });
    }
  };

  const summaryData = useMemo(() => {
    if (!form || !responses.length) return { optionCharts: [], ratingCharts: [] };
    
    // Process multiple-choice, checkboxes, dropdowns
    const optionQuestions = form.questions.filter(q => ['multiple-choice', 'checkboxes', 'dropdown'].includes(q.questionType));
    const optionCharts = optionQuestions.map(q => {
        const counts = q.options.map(opt => ({ name: opt, value: 0 }));
        responses.forEach(res => {
            const answerObj = res.answers.find(a => a.questionText === q.questionText);
            if (answerObj && answerObj.answer) {
                const answers = q.questionType === 'checkboxes' ? answerObj.answer.split(', ') : [answerObj.answer];
                answers.forEach(ans => {
                    const optionIndex = counts.findIndex(c => c.name === ans);
                    if (optionIndex !== -1) counts[optionIndex].value++;
                });
            }
        });
        return { question: q.questionText, data: counts.filter(c => c.value > 0) };
    });

    // Process rating-scale questions
    const ratingQuestions = form.questions.filter(q => q.questionType === 'rating-scale');
    const ratingCharts = ratingQuestions.map(q => {
        const counts = [
            { name: '1 Star', value: 0 }, { name: '2 Stars', value: 0 },
            { name: '3 Stars', value: 0 }, { name: '4 Stars', value: 0 }, { name: '5 Stars', value: 0 }
        ];
        responses.forEach(res => {
            const answerObj = res.answers.find(a => a.questionText === q.questionText);
            if (answerObj && answerObj.answer) {
                const rating = parseInt(answerObj.answer, 10);
                if (rating >= 1 && rating <= 5) {
                    counts[rating - 1].value++;
                }
            }
        });
        return { question: q.questionText, data: counts };
    });

    return { optionCharts, ratingCharts };
  }, [form, responses]);

  if (loading) {
    return (
        <Container maxWidth="lg">
            <Skeleton variant="text" width={200} height={40} sx={{mb: 2}} />
            <Skeleton variant="rectangular" height={60} sx={{mb: 4, borderRadius: 2}} />
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}><Skeleton variant="rectangular" height={350} sx={{borderRadius: 2}} /></Grid>
                <Grid item xs={12} md={6}><Skeleton variant="rectangular" height={350} sx={{borderRadius: 2}} /></Grid>
            </Grid>
        </Container>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;
  }

  return (
    <Box>
      <Button component={RouterLink} to="/" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
        Back to Dashboard
      </Button>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>{form?.title}</Typography>
            <Typography color="text.secondary">Analysis of <strong>{responses.length}</strong> submitted response(s).</Typography>
        </Box>
        <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleExport} disabled={responses.length === 0}>
          Export as CSV
        </Button>
      </Box>

      {responses.length === 0 ? (
        <Box textAlign="center" mt={8}><Typography variant="h5">No responses yet</Typography></Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <ToggleButtonGroup color="primary" value={view} exclusive onChange={handleViewChange}>
              <ToggleButton value="summary" sx={{px:3}}><AssessmentIcon sx={{mr:1}}/> Summary</ToggleButton>
              <ToggleButton value="table" sx={{px:3}}><TableRowsIcon sx={{mr:1}}/> Table</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          
          {view === 'summary' && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                <ToggleButtonGroup size="small" color="primary" value={chartType} exclusive onChange={handleChartTypeChange}>
                    <ToggleButton value="bar"><BarChartIcon sx={{mr:1}}/> Bar Charts</ToggleButton>
                    <ToggleButton value="pie"><PieChartIcon sx={{mr:1}}/> Pie Charts</ToggleButton>
                </ToggleButtonGroup>
            </Box>
          )}

          {view === 'summary' ? (
               <Grid container spacing={3} justifyContent="center">
                  {(summaryData.optionCharts.length === 0 && summaryData.ratingCharts.length === 0) && (
                      <Grid item xs={12} md={8}><Paper sx={{ p: 4, textAlign: 'center' }}><Typography>No visual data to display.</Typography></Paper></Grid>
                  )}
                  
                  {/* Rating Scale Charts */}
                  {summaryData.ratingCharts.map((chart, index) => (
                      <Grid item xs={12} md={6} key={`rating-${index}`}>
                          <Card><CardContent><Typography variant="h6">{chart.question}</Typography></CardContent>
                              <Box sx={{ p: 2 }}>
                                <BarChart width={500} height={300} data={chart.data}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false}/>
                                    <Tooltip />
                                    <Bar dataKey="value" name="Responses" radius={[4, 4, 0, 0]}>
                                        {chart.data.map((entry, i) => <Cell key={`cell-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                                    </Bar>
                                </BarChart>
                              </Box>
                          </Card>
                      </Grid>
                  ))}

                  {/* Option-based Charts (Bar or Pie) */}
                  {summaryData.optionCharts.map((chart, index) => (
                      <Grid item xs={12} md={6} key={`option-${index}`}>
                          <Card>
                              <CardContent><Typography variant="h6">{chart.question}</Typography></CardContent>
                              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                                {chartType === 'bar' ? (
                                    <BarChart width={500} height={300} data={chart.data}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis allowDecimals={false}/>
                                        <Tooltip />
                                        <Bar dataKey="value" name="Responses" radius={[4, 4, 0, 0]}>
                                            {chart.data.map((entry, i) => <Cell key={`cell-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                                        </Bar>
                                    </BarChart>
                                ) : (
                                    <PieChart width={400} height={300}>
                                        <Pie data={chart.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                            {chart.data.map((entry, i) => <Cell key={`cell-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                )}
                              </Box>
                          </Card>
                      </Grid>
                  ))}
              </Grid>
          ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <TableContainer component={Paper} variant="outlined" sx={{ maxWidth: '100%' }}>
                    <Table>
                        <TableHead sx={{backgroundColor: 'background.default'}}>
                            <TableRow>
                                <TableCell sx={{fontWeight: 'bold'}}>Submitted At</TableCell>
                                {form?.questions.map(q => <TableCell key={q._id} sx={{fontWeight: 'bold'}}>{q.questionText}</TableCell>)}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {responses.map(res => (
                                <TableRow key={res._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell><Chip label={new Date(res.createdAt).toLocaleString()} size="small" /></TableCell>
                                    {form?.questions.map(q => {
                                        const answer = res.answers.find(a => a.questionText === q.questionText);
                                        return <TableCell key={q._id}>{answer ? answer.answer : '—'}</TableCell>;
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
              </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default ViewResponsesPage;