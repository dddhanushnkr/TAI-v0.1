import React from 'react';
import { Container, Typography } from '@mui/material';

const Contact = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Contact Us
      </Typography>
      <Typography variant="body1" paragraph>
        Have questions or need help? We're here to assist you with your travel planning needs.
      </Typography>
      <Typography variant="body1" paragraph>
        Email: support@aitripplanner.com
      </Typography>
      <Typography variant="body1" paragraph>
        Phone: +1 (555) 123-4567
      </Typography>
    </Container>
  );
};

export default Contact;
