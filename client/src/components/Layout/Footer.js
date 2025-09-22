import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  IconButton,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Email,
  Phone,
  LocationOn,
} from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#1976d2',
        color: 'white',
        py: 4,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              AI Trip Planner
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Your intelligent travel companion for personalized trip planning
              with AI-powered recommendations and seamless booking experiences.
            </Typography>
            <Box>
              <IconButton color="inherit" sx={{ mr: 1 }}>
                <Facebook />
              </IconButton>
              <IconButton color="inherit" sx={{ mr: 1 }}>
                <Twitter />
              </IconButton>
              <IconButton color="inherit" sx={{ mr: 1 }}>
                <Instagram />
              </IconButton>
              <IconButton color="inherit">
                <LinkedIn />
              </IconButton>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Link href="/" color="inherit" sx={{ mb: 1 }}>
                Home
              </Link>
              <Link href="/about" color="inherit" sx={{ mb: 1 }}>
                About
              </Link>
              <Link href="/contact" color="inherit" sx={{ mb: 1 }}>
                Contact
              </Link>
              <Link href="/planner" color="inherit" sx={{ mb: 1 }}>
                Plan Trip
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Typography variant="h6" gutterBottom>
              Services
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Link href="#" color="inherit" sx={{ mb: 1 }}>
                AI Itinerary Planning
              </Link>
              <Link href="#" color="inherit" sx={{ mb: 1 }}>
                Hotel Booking
              </Link>
              <Link href="#" color="inherit" sx={{ mb: 1 }}>
                Flight Search
              </Link>
              <Link href="#" color="inherit" sx={{ mb: 1 }}>
                Local Experiences
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Typography variant="h6" gutterBottom>
              Contact Info
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Email sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="body2">
                support@aitripplanner.com
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Phone sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="body2">
                +1 (555) 123-4567
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOn sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="body2">
                San Francisco, CA
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Box
          sx={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            mt: 3,
            pt: 3,
            textAlign: 'center',
          }}
        >
          <Typography variant="body2">
            © 2024 AI Trip Planner. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
