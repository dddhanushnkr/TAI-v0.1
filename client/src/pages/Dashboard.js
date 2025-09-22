import React, { useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Flight as FlightIcon,
  Explore as ExploreIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  CameraAlt as CameraAltIcon,
  Map as MapIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const [language, setLanguage] = useState('en');
  const [showARModal, setShowARModal] = useState(false);

  // Mock data for demonstration
  const [userStats] = useState({
    totalTrips: 12,
    countriesVisited: 8,
    citiesExplored: 24,
    totalSpent: 125000,
    carbonFootprint: 2.3,
    sustainabilityScore: 8.5
  });

  const [recentItineraries] = useState([
    {
      id: '1',
      destination: 'Goa',
      duration: 5,
      startDate: '2024-01-15',
      endDate: '2024-01-20',
      budget: 25000,
      status: 'completed',
      sustainabilityScore: 8.5,
      arEnabled: true,
      socialShares: 15,
      photos: 45
    },
    {
      id: '2',
      destination: 'Rajasthan',
      duration: 7,
      startDate: '2024-02-10',
      endDate: '2024-02-17',
      budget: 35000,
      status: 'upcoming',
      sustainabilityScore: 9.2,
      arEnabled: true,
      socialShares: 8,
      photos: 0
    },
    {
      id: '3',
      destination: 'Kerala',
      duration: 4,
      startDate: '2024-03-05',
      endDate: '2024-03-09',
      budget: 20000,
      status: 'draft',
      sustainabilityScore: 7.8,
      arEnabled: false,
      socialShares: 0,
      photos: 0
    }
  ]);

  const [upcomingBookings] = useState([
    {
      id: 'B001',
      destination: 'Himachal Pradesh',
      checkIn: '2024-01-25',
      checkOut: '2024-01-30',
      status: 'confirmed',
      totalAmount: 45000,
      items: ['Flight', 'Hotel', 'Activities']
    },
    {
      id: 'B002',
      destination: 'Tamil Nadu',
      checkIn: '2024-02-15',
      checkOut: '2024-02-20',
      status: 'pending',
      totalAmount: 32000,
      items: ['Train', 'Hotel', 'Tours']
    }
  ]);

  const [quickActions] = useState([
    {
      title: 'Plan New Trip',
      description: 'Create AI-powered itinerary',
      icon: <AddIcon />,
      color: '#1976d2',
      action: () => navigate('/planner')
    },
    {
      title: 'AR Exploration',
      description: 'Explore cities with AR',
      icon: <CameraAltIcon />,
      color: '#9c27b0',
      action: () => setShowARModal(true)
    },
    {
      title: 'Social Sharing',
      description: 'Share your adventures',
      icon: <ShareIcon />,
      color: '#f57c00',
      action: () => handleSocialSharing()
    },
    {
      title: 'Sustainability',
      description: 'Track your impact',
      icon: <TrendingUpIcon />,
      color: '#388e3c',
      action: () => handleSustainability()
    }
  ]);

  const handleMenuClick = (event, itinerary) => {
    setAnchorEl(event.currentTarget);
    setSelectedItinerary(itinerary);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItinerary(null);
  };

  const handleItineraryAction = (action) => {
    if (selectedItinerary) {
      switch (action) {
        case 'view':
          navigate(`/itinerary/${selectedItinerary.id}`);
          break;
        case 'edit':
          navigate(`/planner?edit=${selectedItinerary.id}`);
          break;
        case 'share':
          handleShareItinerary(selectedItinerary);
          break;
        case 'download':
          handleDownloadItinerary(selectedItinerary);
          break;
        case 'delete':
          handleDeleteItinerary(selectedItinerary);
          break;
        default:
          break;
      }
    }
    handleMenuClose();
  };

  const handleShareItinerary = (itinerary) => {
    // Implement sharing logic
    toast.success(`Sharing ${itinerary.destination} itinerary!`);
  };

  const handleDownloadItinerary = (itinerary) => {
    // Implement download logic
    toast.success(`Downloading ${itinerary.destination} itinerary!`);
  };

  const handleDeleteItinerary = (itinerary) => {
    // Implement delete logic
    toast.success(`${itinerary.destination} itinerary deleted!`);
  };

  const handleSocialSharing = () => {
    toast.success('Opening social sharing options!');
  };

  const handleSustainability = () => {
    toast.success('Opening sustainability dashboard!');
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    toast.success(`Language changed to ${newLanguage}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'upcoming': return 'info';
      case 'draft': return 'warning';
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <ExploreIcon />;
      case 'upcoming': return <ScheduleIcon />;
      case 'draft': return <EditIcon />;
      case 'confirmed': return <FlightIcon />;
      case 'pending': return <ScheduleIcon />;
      default: return <ExploreIcon />;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back! 👋
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage your trips, explore with AR, and track your travel impact
        </Typography>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <FlightIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" component="div">
                      {userStats.totalTrips}
                    </Typography>
                    <Typography color="text.secondary">
                      Total Trips
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={75} 
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  +2 this month
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                    <MapIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" component="div">
                      {userStats.citiesExplored}
                    </Typography>
                    <Typography color="text.secondary">
                      Cities Explored
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={60} 
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {userStats.countriesVisited} countries
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" component="div">
                      {userStats.sustainabilityScore}/10
                    </Typography>
                    <Typography color="text.secondary">
                      Sustainability Score
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={userStats.sustainabilityScore * 10} 
                  color="success"
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {userStats.carbonFootprint} tons CO₂
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                    ₹
                  </Avatar>
                  <Box>
                    <Typography variant="h4" component="div">
                      ₹{userStats.totalSpent.toLocaleString()}
                    </Typography>
                    <Typography color="text.secondary">
                      Total Spent
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={65} 
                  color="warning"
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  ₹{Math.round(userStats.totalSpent / userStats.totalTrips).toLocaleString()} avg/trip
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}
                onClick={action.action}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Avatar sx={{ bgcolor: action.color, mx: 'auto', mb: 2, width: 56, height: 56 }}>
                    {action.icon}
                  </Avatar>
                  <Typography variant="h6" gutterBottom>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Recent Itineraries */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Recent Itineraries
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {recentItineraries.map((itinerary, index) => (
          <Grid item xs={12} md={6} lg={4} key={itinerary.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {itinerary.destination}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {itinerary.startDate} - {itinerary.endDate}
                      </Typography>
                    </Box>
                    <IconButton onClick={(e) => handleMenuClick(e, itinerary)}>
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip 
                      icon={getStatusIcon(itinerary.status)}
                      label={itinerary.status}
                      color={getStatusColor(itinerary.status)}
                      size="small"
                    />
                    {itinerary.arEnabled && (
                      <Chip 
                        icon={<CameraAltIcon />}
                        label="AR Enabled"
                        color="secondary"
                        size="small"
                      />
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Duration: {itinerary.duration} days
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Budget: ₹{itinerary.budget.toLocaleString()}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Sustainability Score
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={itinerary.sustainabilityScore * 10} 
                        color="success"
                        sx={{ width: 100, mt: 0.5 }}
                      />
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" color="text.secondary">
                        {itinerary.socialShares} shares
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {itinerary.photos} photos
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Upcoming Bookings */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Upcoming Bookings
      </Typography>
      <Grid container spacing={3}>
        {upcomingBookings.map((booking, index) => (
          <Grid item xs={12} md={6} key={booking.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {booking.destination}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {booking.checkIn} - {booking.checkOut}
                      </Typography>
                    </Box>
                    <Chip 
                      label={booking.status}
                      color={getStatusColor(booking.status)}
                      size="small"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Amount: ₹{booking.totalAmount.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Booking ID: {booking.id}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {booking.items.map((item, itemIndex) => (
                      <Chip 
                        key={itemIndex}
                        label={item}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Language Selector */}
      <Box sx={{ position: 'fixed', bottom: 16, right: 16 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Language</InputLabel>
          <Select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            label="Language"
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="hi">हिन्दी</MenuItem>
            <MenuItem value="te">తెలుగు</MenuItem>
            <MenuItem value="ta">தமிழ்</MenuItem>
            <MenuItem value="bn">বাংলা</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* AR Modal */}
      <Dialog open={showARModal} onClose={() => setShowARModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>AR City Exploration</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Explore cities with Augmented Reality! Point your camera at landmarks to get:
          </Typography>
          <ul>
            <li>Historical information overlays</li>
            <li>Interactive 3D models</li>
            <li>Cultural stories and legends</li>
            <li>Photo opportunities</li>
            <li>Social sharing moments</li>
          </ul>
          <Alert severity="info" sx={{ mt: 2 }}>
            AR features require camera access and work best with recent smartphones.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowARModal(false)}>Close</Button>
          <Button variant="contained" onClick={() => {
            setShowARModal(false);
            toast.success('AR exploration started!');
          }}>
            Start AR Exploration
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleItineraryAction('view')}>
          <ExploreIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => handleItineraryAction('edit')}>
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleItineraryAction('share')}>
          <ShareIcon sx={{ mr: 1 }} />
          Share
        </MenuItem>
        <MenuItem onClick={() => handleItineraryAction('download')}>
          <DownloadIcon sx={{ mr: 1 }} />
          Download
        </MenuItem>
        <MenuItem onClick={() => handleItineraryAction('delete')} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default Dashboard;
