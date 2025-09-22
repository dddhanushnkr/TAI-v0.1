import React from 'react';
import { Container, Typography } from '@mui/material';

const Booking = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Booking Details
      </Typography>
      <Typography variant="body1">
        This page will display booking information and confirmation details.
      </Typography>
    </Container>
  );
};

export default Booking;
