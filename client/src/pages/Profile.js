import React from 'react';
import { Container, Typography, Box, Card, CardContent, Chip } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        User Profile
      </Typography>
      {isAuthenticated && user ? (
        <Card>
          <CardContent>
            <Typography variant="h6">{user.name}</Typography>
            <Typography color="text.secondary">{user.email}</Typography>
            <Box mt={2}>
              <Chip label="Authenticated" color="success" />
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Typography variant="body1" color="text.secondary">
          You are not logged in.
        </Typography>
      )}
    </Container>
  );
};

export default Profile;
