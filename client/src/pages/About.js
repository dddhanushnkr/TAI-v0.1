import React from 'react';
import { Container, Typography } from '@mui/material';

const About = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        About AI Trip Planner
      </Typography>
      <Typography variant="body1" paragraph>
        AI Trip Planner is a revolutionary travel planning platform that uses artificial intelligence
        to create personalized itineraries for travelers around the world.
      </Typography>
      <Typography variant="body1" paragraph>
        Our mission is to make travel planning effortless and enjoyable by leveraging cutting-edge
        AI technology to understand your preferences and create the perfect trip for you.
      </Typography>
      <Typography variant="body1" paragraph>
        This project was created by three professionals out of boredom, blending our passion for travel
        and technology into something fun and useful.
      </Typography>
    </Container>
  );
};

export default About;
