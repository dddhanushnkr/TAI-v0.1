const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { db } = require('../config/firebase');

// Get user's trip history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const tripsSnapshot = await db.collection('itineraries')
      .where('userId', '==', req.user.id)
      .orderBy('createdAt', 'desc')
      .get();

    const trips = [];
    tripsSnapshot.forEach(doc => {
      trips.push({ id: doc.id, ...doc.data() });
    });

    res.json({
      success: true,
      trips
    });

  } catch (error) {
    console.error('Error getting trip history:', error);
    res.status(500).json({
      error: 'Failed to get trip history',
      message: error.message
    });
  }
});

// Get specific itinerary
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const itineraryDoc = await db.collection('itineraries').doc(id).get();
    
    if (!itineraryDoc.exists) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }

    const itinerary = itineraryDoc.data();

    // Verify user owns this itinerary
    if (itinerary.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    res.json({
      success: true,
      itinerary: { id, ...itinerary }
    });

  } catch (error) {
    console.error('Error getting itinerary:', error);
    res.status(500).json({
      error: 'Failed to get itinerary',
      message: error.message
    });
  }
});

// Save itinerary
router.post('/save', authenticateToken, async (req, res) => {
  try {
    const itineraryData = {
      ...req.body,
      userId: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection('itineraries').add(itineraryData);

    res.json({
      success: true,
      itineraryId: docRef.id,
      message: 'Itinerary saved successfully'
    });

  } catch (error) {
    console.error('Error saving itinerary:', error);
    res.status(500).json({
      error: 'Failed to save itinerary',
      message: error.message
    });
  }
});

// Update itinerary
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const itineraryDoc = await db.collection('itineraries').doc(id).get();
    
    if (!itineraryDoc.exists) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }

    const itinerary = itineraryDoc.data();

    // Verify user owns this itinerary
    if (itinerary.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    await db.collection('itineraries').doc(id).update(updateData);

    res.json({
      success: true,
      message: 'Itinerary updated successfully'
    });

  } catch (error) {
    console.error('Error updating itinerary:', error);
    res.status(500).json({
      error: 'Failed to update itinerary',
      message: error.message
    });
  }
});

// Delete itinerary
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const itineraryDoc = await db.collection('itineraries').doc(id).get();
    
    if (!itineraryDoc.exists) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }

    const itinerary = itineraryDoc.data();

    // Verify user owns this itinerary
    if (itinerary.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    await db.collection('itineraries').doc(id).delete();

    res.json({
      success: true,
      message: 'Itinerary deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting itinerary:', error);
    res.status(500).json({
      error: 'Failed to delete itinerary',
      message: error.message
    });
  }
});

// Share itinerary
router.post('/:id/share', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { shareWith, permissions } = req.body;
    
    const itineraryDoc = await db.collection('itineraries').doc(id).get();
    
    if (!itineraryDoc.exists) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }

    const itinerary = itineraryDoc.data();

    // Verify user owns this itinerary
    if (itinerary.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    // Create share record
    const shareData = {
      itineraryId: id,
      sharedBy: req.user.id,
      sharedWith,
      permissions: permissions || ['read'],
      createdAt: new Date().toISOString()
    };

    const shareRef = await db.collection('shares').add(shareData);

    res.json({
      success: true,
      shareId: shareRef.id,
      message: 'Itinerary shared successfully'
    });

  } catch (error) {
    console.error('Error sharing itinerary:', error);
    res.status(500).json({
      error: 'Failed to share itinerary',
      message: error.message
    });
  }
});

// Get popular destinations
router.get('/popular-destinations', async (req, res) => {
  try {
    // This would typically come from analytics data
    const popularDestinations = [
      { name: 'Paris, France', image: '/images/paris.jpg', popularity: 95 },
      { name: 'Tokyo, Japan', image: '/images/tokyo.jpg', popularity: 92 },
      { name: 'New York, USA', image: '/images/nyc.jpg', popularity: 90 },
      { name: 'London, UK', image: '/images/london.jpg', popularity: 88 },
      { name: 'Rome, Italy', image: '/images/rome.jpg', popularity: 85 },
      { name: 'Barcelona, Spain', image: '/images/barcelona.jpg', popularity: 82 },
      { name: 'Amsterdam, Netherlands', image: '/images/amsterdam.jpg', popularity: 80 },
      { name: 'Sydney, Australia', image: '/images/sydney.jpg', popularity: 78 }
    ];

    res.json({
      success: true,
      destinations: popularDestinations
    });

  } catch (error) {
    console.error('Error getting popular destinations:', error);
    res.status(500).json({
      error: 'Failed to get popular destinations',
      message: error.message
    });
  }
});

module.exports = router;

