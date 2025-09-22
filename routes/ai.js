const express = require('express');
const router = express.Router();
const { generateItinerary, getPersonalizedRecommendations, analyzeUserPreferences } = require('../services/aiService');
const { authenticateToken } = require('../middleware/auth');

// Generate personalized itinerary
router.post('/generate-itinerary', authenticateToken, async (req, res) => {
  try {
    const {
      destination,
      duration,
      budget,
      interests,
      travelStyle,
      groupSize,
      startDate,
      endDate,
      specialRequirements
    } = req.body;

    // Validate required fields
    if (!destination || !duration || !budget) {
      return res.status(400).json({
        error: 'Missing required fields: destination, duration, budget'
      });
    }

    const itinerary = await generateItinerary({
      userId: req.user.id,
      destination,
      duration: parseInt(duration),
      budget: parseFloat(budget),
      interests: interests || [],
      travelStyle: travelStyle || 'balanced',
      groupSize: parseInt(groupSize) || 1,
      startDate,
      endDate,
      specialRequirements: specialRequirements || []
    });

    res.json({
      success: true,
      itinerary,
      message: 'Itinerary generated successfully'
    });

  } catch (error) {
    console.error('Error generating itinerary:', error);
    res.status(500).json({
      error: 'Failed to generate itinerary',
      message: error.message
    });
  }
});

// Get personalized recommendations
router.post('/recommendations', authenticateToken, async (req, res) => {
  try {
    const {
      destination,
      currentLocation,
      interests,
      budget,
      timeOfDay,
      weather
    } = req.body;

    const recommendations = await getPersonalizedRecommendations({
      userId: req.user.id,
      destination,
      currentLocation,
      interests: interests || [],
      budget: parseFloat(budget) || 0,
      timeOfDay: timeOfDay || 'any',
      weather: weather || 'clear'
    });

    res.json({
      success: true,
      recommendations,
      message: 'Recommendations generated successfully'
    });

  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({
      error: 'Failed to get recommendations',
      message: error.message
    });
  }
});

// Analyze user preferences
router.post('/analyze-preferences', authenticateToken, async (req, res) => {
  try {
    const { tripHistory, feedback, preferences } = req.body;

    const analysis = await analyzeUserPreferences({
      userId: req.user.id,
      tripHistory: tripHistory || [],
      feedback: feedback || [],
      preferences: preferences || {}
    });

    res.json({
      success: true,
      analysis,
      message: 'Preferences analyzed successfully'
    });

  } catch (error) {
    console.error('Error analyzing preferences:', error);
    res.status(500).json({
      error: 'Failed to analyze preferences',
      message: error.message
    });
  }
});

// Real-time itinerary adjustments
router.post('/adjust-itinerary', authenticateToken, async (req, res) => {
  try {
    const {
      itineraryId,
      adjustments,
      reason,
      currentLocation,
      weather,
      timeConstraints
    } = req.body;

    const adjustedItinerary = await adjustItinerary({
      userId: req.user.id,
      itineraryId,
      adjustments,
      reason,
      currentLocation,
      weather,
      timeConstraints
    });

    res.json({
      success: true,
      itinerary: adjustedItinerary,
      message: 'Itinerary adjusted successfully'
    });

  } catch (error) {
    console.error('Error adjusting itinerary:', error);
    res.status(500).json({
      error: 'Failed to adjust itinerary',
      message: error.message
    });
  }
});

module.exports = router;
