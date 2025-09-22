import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, Alert, Card, CardContent, Chip } from '@mui/material';
import { getItinerary } from '../services/tripService';

const Itinerary = () => {
  const { id } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const data = await getItinerary(id);
        setItinerary(data.itinerary || data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchItinerary();
  }, [id]);

  if (loading) return <Box textAlign="center" py={8}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!itinerary) return <Alert severity="info">No itinerary found.</Alert>;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Itinerary for {itinerary.destination || itinerary.params?.destination || 'Trip'}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Duration: {itinerary.duration || itinerary.params?.duration} days | Budget: ₹{itinerary.budget || itinerary.params?.budget}
      </Typography>
      {itinerary.days && itinerary.days.length > 0 ? (
        itinerary.days.map((day, idx) => (
          <Card key={idx} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6">Day {day.day || idx + 1}</Typography>
              {day.theme && <Chip label={day.theme} sx={{ mb: 1, ml: 1 }} />}
              <ul>
                {(day.activities || []).map((activity, i) => (
                  <li key={i}>
                    <strong>{activity.time ? activity.time + ' - ' : ''}{activity.activity || activity.name}</strong>
                    {activity.description && <span>: {activity.description}</span>}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))
      ) : (
        <Alert severity="info">No days/activities found in this itinerary.</Alert>
      )}
    </Container>
  );
};

export default Itinerary;
