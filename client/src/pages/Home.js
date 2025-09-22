import React from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, CardMedia, Button } from '@mui/material';
import ExploreIcon from '@mui/icons-material/Explore';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import { useNavigate } from 'react-router-dom';

const images = [
  {
    src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    alt: 'Beach',
    label: 'Relaxing Beaches',
  },
  {
    src: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
    alt: 'Mountains',
    label: 'Majestic Mountains',
  },
  {
    src: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80',
    alt: 'City',
    label: 'Vibrant Cities',
  },
];

const Home = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', py: 8, minHeight: '60vh' }}>
      <Container maxWidth="md">
        <Box textAlign="center" mb={6}>
          <FlightTakeoffIcon sx={{ fontSize: 60, mb: 2, color: 'white' }} />
          <Typography variant="h2" component="h1" gutterBottom fontWeight={700}>
            AI Trip Planner
          </Typography>
          <Typography variant="h6" sx={{ mb: 2, opacity: 0.9 }}>
            Plan. Explore. Experience.
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{ mt: 2, background: 'white', color: '#1976d2', fontWeight: 600 }}
            onClick={() => navigate('/planner')}
          >
            Start Planning
          </Button>
        </Box>
        <Grid container spacing={4} justifyContent="center">
          {images.map((img, idx) => (
            <Grid item xs={12} sm={4} key={idx}>
              <Card sx={{ borderRadius: 4, boxShadow: 3, background: 'rgba(255,255,255,0.08)' }}>
                <CardMedia
                  component="img"
                  height="180"
                  image={img.src}
                  alt={img.alt}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography variant="subtitle1" align="center" fontWeight={600}>
                    {img.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={4} mt={4} justifyContent="center">
          <Grid item xs={12} sm={4}>
            <Box textAlign="center">
              <ExploreIcon sx={{ fontSize: 40, color: 'white', mb: 1 }} />
              <Typography variant="subtitle1" fontWeight={600}>Discover Destinations</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box textAlign="center">
              <EmojiObjectsIcon sx={{ fontSize: 40, color: 'white', mb: 1 }} />
              <Typography variant="subtitle1" fontWeight={600}>Smart AI Suggestions</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box textAlign="center">
              <FlightTakeoffIcon sx={{ fontSize: 40, color: 'white', mb: 1 }} />
              <Typography variant="subtitle1" fontWeight={600}>Easy Booking</Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;
