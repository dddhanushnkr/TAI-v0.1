import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Autocomplete,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FlightTakeoff,
  Hotel,
  Restaurant,
  Explore,
  TrendingUp,
  Security,
} from '@mui/icons-material';

const steps = [
  'Destination & Dates',
  'Preferences & Interests',
  'Budget & Group',
  'Generate Itinerary'
];

const interestOptions = [
  'Adventure', 'Culture', 'Food', 'History', 'Nature', 'Nightlife',
  'Photography', 'Relaxation', 'Shopping', 'Sports', 'Art', 'Music',
  'Architecture', 'Beaches', 'Mountains', 'Wildlife', 'Festivals',
  'Local Experiences', 'Luxury', 'Budget Travel'
];

const travelStyleOptions = [
  { value: 'budget', label: 'Budget Traveler' },
  { value: 'luxury', label: 'Luxury Traveler' },
  { value: 'adventure', label: 'Adventure Seeker' },
  { value: 'cultural', label: 'Cultural Explorer' },
  { value: 'relaxed', label: 'Relaxed Traveler' },
  { value: 'balanced', label: 'Balanced Traveler' }
];

const groupSizeOptions = [
  { value: 1, label: 'Solo Traveler' },
  { value: 2, label: 'Couple' },
  { value: 3, label: '3 People' },
  { value: 4, label: '4 People' },
  { value: 5, label: '5 People' },
  { value: 6, label: '6+ People' }
];

const budgetRanges = [
  { value: 10000, label: 'Under ₹10,000' },
  { value: 25000, label: '₹10,000 - ₹25,000' },
  { value: 50000, label: '₹25,000 - ₹50,000' },
  { value: 100000, label: '₹50,000 - ₹1,00,000' },
  { value: 200000, label: '₹1,00,000 - ₹2,00,000' },
  { value: 500000, label: 'Over ₹2,00,000' }
];

function TripPlanner() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    from: '',
    destination: '',
    startDate: null,
    endDate: null,
    duration: 0,
    interests: [],
    travelStyle: 'balanced',
    budget: 25000,
    groupSize: 2,
    specialRequirements: []
  });

  // Calculate duration when dates change
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const diffTime = Math.abs(formData.endDate - formData.startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setFormData(prev => ({ ...prev, duration: diffDays }));
    }
  }, [formData.startDate, formData.endDate]);

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleGenerateItinerary();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleGenerateItinerary = async () => {
    if (!formData.from || !formData.destination || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate demo itinerary
      const demoItinerary = {
        id: `trip-${Date.now()}`,
        from: formData.from,
        destination: formData.destination,
        duration: formData.duration,
        budget: formData.budget,
        interests: formData.interests,
        days: Array.from({ length: formData.duration }, (_, i) => ({
          day: i + 1,
          activities: [
            { name: 'Visit local attractions', time: '09:00', duration: '3 hours', cost: 1500 },
            { name: 'Lunch at local restaurant', time: '12:00', duration: '1 hour', cost: 800 },
            { name: 'Cultural experience', time: '14:00', duration: '2 hours', cost: 1200 }
          ]
        }))
      };
      
      toast.success('Itinerary generated successfully!');
      navigate(`/itinerary/${demoItinerary.id}`);
    } catch (error) {
      toast.error('Failed to generate itinerary. Please try again.');
      console.error('Error generating itinerary:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isStepValid = (step) => {
    switch (step) {
      case 0:
        return formData.from && formData.destination && formData.startDate && formData.endDate;
      case 1:
        return formData.interests.length > 0;
      case 2:
        return formData.budget > 0 && formData.groupSize > 0;
      default:
        return true;
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="From"
                value={formData.from}
                onChange={(e) => handleInputChange('from', e.target.value)}
                placeholder="e.g., Mumbai, India"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Destination"
                value={formData.destination}
                onChange={(e) => handleInputChange('destination', e.target.value)}
                placeholder="e.g., Paris, France or Tokyo, Japan"
                required
              />
            </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(date) => handleInputChange('startDate', date)}
                  minDate={new Date()}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="End Date"
                  value={formData.endDate}
                  onChange={(date) => handleInputChange('endDate', date)}
                  minDate={formData.startDate || new Date()}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </Grid>
              {formData.duration > 0 && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    Trip Duration: {formData.duration} {formData.duration === 1 ? 'day' : 'days'}
                  </Alert>
                </Grid>
              )}
            </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={interestOptions}
                value={formData.interests}
                onChange={(event, newValue) => handleInputChange('interests', newValue)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                      key={option}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Interests & Activities"
                    placeholder="Select your interests"
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Travel Style</InputLabel>
                <Select
                  value={formData.travelStyle}
                  onChange={(e) => handleInputChange('travelStyle', e.target.value)}
                  label="Travel Style"
                >
                  {travelStyleOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Budget Range</InputLabel>
                <Select
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  label="Budget Range"
                >
                  {budgetRanges.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Group Size</InputLabel>
                <Select
                  value={formData.groupSize}
                  onChange={(e) => handleInputChange('groupSize', e.target.value)}
                  label="Group Size"
                >
                  {groupSizeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Special Requirements (Optional)"
                value={formData.specialRequirements.join(', ')}
                onChange={(e) => handleInputChange('specialRequirements', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                placeholder="e.g., wheelchair accessible, vegetarian options, pet-friendly"
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Box textAlign="center" py={4}>
            <Typography variant="h5" gutterBottom>
              Ready to Generate Your Itinerary?
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              We'll create a personalized itinerary based on your preferences using AI technology.
            </Typography>
            
            <Card sx={{ mt: 3, textAlign: 'left' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Trip Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      From
                    </Typography>
                    <Typography variant="body1">
                      {formData.from}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Destination
                    </Typography>
                    <Typography variant="body1">
                      {formData.destination}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Duration
                    </Typography>
                    <Typography variant="body1">
                      {formData.duration} days
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Budget
                    </Typography>
                    <Typography variant="body1">
                      ₹{formData.budget.toLocaleString('en-IN')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Group Size
                    </Typography>
                    <Typography variant="body1">
                      {formData.groupSize} people
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Interests
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {formData.interests.map((interest) => (
                        <Chip
                          key={interest}
                          label={interest}
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  const features = [
    {
      icon: <FlightTakeoff sx={{ fontSize: 40, color: '#1976d2' }} />,
      title: 'AI-Powered Planning',
      description: 'Get personalized itineraries created by advanced AI algorithms',
    },
    {
      icon: <Hotel sx={{ fontSize: 40, color: '#1976d2' }} />,
      title: 'Smart Booking',
      description: 'Seamlessly book hotels, flights, and activities in one place',
    },
    {
      icon: <Restaurant sx={{ fontSize: 40, color: '#1976d2' }} />,
      title: 'Local Experiences',
      description: 'Discover authentic local experiences and hidden gems',
    },
    {
      icon: <Explore sx={{ fontSize: 40, color: '#1976d2' }} />,
      title: 'Real-time Updates',
      description: 'Get live updates on weather, traffic, and local events',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40, color: '#1976d2' }} />,
      title: 'Budget Optimization',
      description: 'Find the best deals and optimize your travel budget',
    },
    {
      icon: <Security sx={{ fontSize: 40, color: '#1976d2' }} />,
      title: 'Secure Payments',
      description: 'Safe and secure payment processing for all bookings',
    },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            AI Trip Planner
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" align="center" paragraph>
            Create your perfect itinerary with AI-powered recommendations
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ minHeight: 400 }}>
            {renderStepContent(activeStep)}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!isStepValid(activeStep) || isGenerating}
              endIcon={isGenerating ? <CircularProgress size={20} /> : null}
            >
              {activeStep === steps.length - 1 ? 'Generate Itinerary' : 'Next'}
            </Button>
          </Box>
        </Paper>
      </Container>

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom>
            Plan Your Perfect Trip with AI
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            Discover amazing destinations, create personalized itineraries,
            and book everything you need for your next adventure.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/planner')}
              sx={{
                backgroundColor: 'white',
                color: '#1976d2',
                '&:hover': { backgroundColor: '#f5f5f5' },
              }}
            >
              Start Planning
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/about')}
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' },
              }}
            >
              Learn More
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Why Choose AI Trip Planner?
        </Typography>
        <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
          Experience the future of travel planning with our cutting-edge AI technology
        </Typography>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  textAlign: 'center',
                  p: 2,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          backgroundColor: '#f5f5f5',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" component="h2" gutterBottom>
            Ready to Start Your Journey?
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Join thousands of travelers who trust AI Trip Planner for their adventures
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register')}
            sx={{ mr: 2 }}
          >
            Get Started Free
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/login')}
          >
            Sign In
          </Button>
        </Container>
      </Box>
    </LocalizationProvider>
  );
}

export default TripPlanner;
