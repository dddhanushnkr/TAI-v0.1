import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Eco,
  LocalFireDepartment,
  Public,
  TrendingUp,
  TrendingDown,
  Info,
  Lightbulb,
  Recycle,
  Nature,
  DirectionsCar,
  Hotel,
  Restaurant,
  Close
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useMutation } from 'react-query';
import toast from 'react-hot-toast';

// Services
import { 
  calculateCarbonFootprint, 
  calculateLocalImpact, 
  generateSustainabilityReport,
  getEcoFriendlyAlternatives 
} from '../../services/sustainabilityService';

const SustainabilityDashboard = ({ itinerary }) => {
  const [carbonFootprint, setCarbonFootprint] = useState(null);
  const [localImpact, setLocalImpact] = useState(null);
  const [sustainabilityReport, setSustainabilityReport] = useState(null);
  const [alternatives, setAlternatives] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mutations
  const carbonFootprintMutation = useMutation(calculateCarbonFootprint, {
    onSuccess: (data) => {
      setCarbonFootprint(data.carbonFootprint);
    },
    onError: (error) => {
      toast.error('Failed to calculate carbon footprint');
    }
  });

  const localImpactMutation = useMutation(calculateLocalImpact, {
    onSuccess: (data) => {
      setLocalImpact(data.localImpact);
    },
    onError: (error) => {
      toast.error('Failed to calculate local impact');
    }
  });

  const reportMutation = useMutation(generateSustainabilityReport, {
    onSuccess: (data) => {
      setSustainabilityReport(data.report);
    },
    onError: (error) => {
      toast.error('Failed to generate sustainability report');
    }
  });

  const alternativesMutation = useMutation(getEcoFriendlyAlternatives, {
    onSuccess: (data) => {
      setAlternatives(data.alternatives);
    },
    onError: (error) => {
      toast.error('Failed to get eco-friendly alternatives');
    }
  });

  useEffect(() => {
    if (itinerary) {
      calculateSustainabilityMetrics();
    }
  }, [itinerary]);

  const calculateSustainabilityMetrics = async () => {
    setLoading(true);
    
    try {
      await Promise.all([
        carbonFootprintMutation.mutate({ itinerary }),
        localImpactMutation.mutate({ itinerary }),
        reportMutation.mutate({ itinerary }),
        alternativesMutation.mutate({ itinerary })
      ]);
    } catch (error) {
      console.error('Error calculating sustainability metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCarbonRatingColor = (rating) => {
    switch (rating?.level) {
      case 'excellent': return '#4caf50';
      case 'good': return '#8bc34a';
      case 'moderate': return '#ff9800';
      case 'high': return '#ff5722';
      case 'very_high': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getImpactRatingColor = (rating) => {
    switch (rating?.level) {
      case 'excellent': return '#4caf50';
      case 'good': return '#8bc34a';
      case 'moderate': return '#ff9800';
      case 'low': return '#ff5722';
      case 'very_low': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const carbonBreakdownData = carbonFootprint?.breakdown ? [
    { name: 'Transportation', value: carbonFootprint.breakdown.transportation, color: '#ff6b6b' },
    { name: 'Accommodation', value: carbonFootprint.breakdown.accommodation, color: '#4ecdc4' },
    { name: 'Activities', value: carbonFootprint.breakdown.activities, color: '#45b7d1' },
    { name: 'Food', value: carbonFootprint.breakdown.food, color: '#96ceb4' }
  ] : [];

  const sustainabilityScore = sustainabilityReport?.overallScore || 0;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Eco color="primary" />
        Sustainability Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Carbon Footprint Card */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalFireDepartment />
                    Carbon Footprint
                  </Typography>
                  <Chip
                    label={carbonFootprint?.rating?.level?.toUpperCase() || 'N/A'}
                    sx={{
                      background: getCarbonRatingColor(carbonFootprint?.rating),
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>

                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {carbonFootprint?.totalCarbon || 0} kg CO₂
                </Typography>

                <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                  {carbonFootprint?.rating?.message || 'Calculating...'}
                </Typography>

                {carbonFootprint?.breakdown && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Breakdown by Category
                    </Typography>
                    {Object.entries(carbonFootprint.breakdown).map(([category, value]) => (
                      <Box key={category} sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {category}
                          </Typography>
                          <Typography variant="body2">
                            {value} kg
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(value / carbonFootprint.totalCarbon) * 100}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            background: 'rgba(255,255,255,0.2)',
                            '& .MuiLinearProgress-bar': {
                              background: 'rgba(255,255,255,0.8)'
                            }
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}

                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setShowDetails(true)}
                  sx={{
                    mt: 2,
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.5)',
                    '&:hover': {
                      borderColor: 'white',
                      background: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Local Impact Card */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Public />
                    Local Impact
                  </Typography>
                  <Chip
                    label={localImpact?.rating?.level?.toUpperCase() || 'N/A'}
                    sx={{
                      background: getImpactRatingColor(localImpact?.rating),
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>

                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {localImpact?.score || 0}%
                </Typography>

                <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                  {localImpact?.rating?.message || 'Calculating...'}
                </Typography>

                {localImpact?.factors && localImpact.factors.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Positive Impact Areas
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {localImpact.factors.map((factor, index) => (
                        <Chip
                          key={index}
                          label={factor}
                          size="small"
                          sx={{
                            background: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            fontSize: '0.7rem'
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setShowDetails(true)}
                  sx={{
                    mt: 2,
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.5)',
                    '&:hover': {
                      borderColor: 'white',
                      background: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Overall Sustainability Score */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUp />
                  Overall Sustainability Score
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={sustainabilityScore}
                      sx={{
                        height: 20,
                        borderRadius: 10,
                        background: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          background: sustainabilityScore >= 80 ? '#4caf50' : 
                                     sustainabilityScore >= 60 ? '#8bc34a' :
                                     sustainabilityScore >= 40 ? '#ff9800' : '#f44336',
                          borderRadius: 10
                        }
                      }}
                    />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', minWidth: 60 }}>
                    {sustainabilityScore}/100
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary">
                  {sustainabilityScore >= 80 ? 'Excellent! You\'re making a very positive impact.' :
                   sustainabilityScore >= 60 ? 'Good job! You\'re contributing positively to sustainability.' :
                   sustainabilityScore >= 40 ? 'There\'s room for improvement in your sustainability practices.' :
                   'Consider more eco-friendly options for your next trip.'}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Carbon Breakdown Chart */}
        {carbonBreakdownData.length > 0 && (
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Carbon Footprint Breakdown
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={carbonBreakdownData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {carbonBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => `${value} kg CO₂`} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        )}

        {/* Recommendations */}
        {carbonFootprint?.recommendations && (
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Lightbulb />
                    Recommendations
                  </Typography>
                  <List dense>
                    {carbonFootprint.recommendations.slice(0, 5).map((rec, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Recycle color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={rec.tip}
                          secondary={`${rec.impact} • ${rec.difficulty}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        )}
      </Grid>

      {/* Detailed Sustainability Report Dialog */}
      <Dialog
        open={showDetails}
        onClose={() => setShowDetails(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Detailed Sustainability Report
          </Typography>
          <IconButton onClick={() => setShowDetails(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {sustainabilityReport && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {sustainabilityReport.overallAssessment}
              </Typography>
              <Typography variant="body1" paragraph>
                {sustainabilityReport.environmentalImpact}
              </Typography>
              <Typography variant="body1" paragraph>
                {sustainabilityReport.socialImpact}
              </Typography>
              
              {sustainabilityReport.recommendations && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Recommendations
                  </Typography>
                  <List>
                    {sustainabilityReport.recommendations.map((rec, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Info color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={rec} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetails(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SustainabilityDashboard;
