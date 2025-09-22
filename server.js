const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import services with error handling
let aiService, mapsService, multilingualService, arService, bookingService, paymentService, voiceAssistantService, sustainabilityService, analyticsService, emtInventoryService;

try {
  aiService = require('./services/aiService');
} catch (error) {
  console.log('AI Service not available - using demo mode');
  aiService = { generateItinerary: () => Promise.resolve({ itinerary: { id: 'demo', days: [] } }) };
}

try {
  mapsService = require('./services/mapsService');
} catch (error) {
  console.log('Maps Service not available - using demo mode');
  mapsService = { getPlacesByType: () => Promise.resolve([]) };
}

try {
  multilingualService = require('./services/multilingualService');
} catch (error) {
  console.log('Multilingual Service not available - using demo mode');
  multilingualService = { translateContent: () => Promise.resolve('Demo translation') };
}

try {
  arService = require('./services/arService');
} catch (error) {
  console.log('AR Service not available - using demo mode');
  arService = { generateARContent: () => Promise.resolve({}) };
}

try {
  bookingService = require('./services/bookingService');
} catch (error) {
  console.log('Booking Service not available - using demo mode');
  bookingService = { bookItinerary: () => Promise.resolve({ id: 'demo-booking' }) };
}

try {
  paymentService = require('./services/paymentService');
} catch (error) {
  console.log('Payment Service not available - using demo mode');
  paymentService = { processPayment: () => Promise.resolve({ success: true }) };
}

try {
  voiceAssistantService = require('./services/voiceAssistantService');
} catch (error) {
  console.log('Voice Assistant Service not available - using demo mode');
  voiceAssistantService = { processVoiceCommand: () => Promise.resolve({}) };
}

try {
  sustainabilityService = require('./services/sustainabilityService');
} catch (error) {
  console.log('Sustainability Service not available - using demo mode');
  sustainabilityService = { calculateCarbonFootprint: () => Promise.resolve({}) };
}

try {
  analyticsService = require('./services/analyticsService');
} catch (error) {
  console.log('Analytics Service not available - using demo mode');
  analyticsService = { generateUserInsights: () => Promise.resolve({}) };
}

try {
  emtInventoryService = require('./services/emtInventoryService');
} catch (error) {
  console.log('EMT Inventory Service not available - using demo mode');
  emtInventoryService = { searchInventory: () => Promise.resolve([]) };
}

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(express.static(path.join(__dirname, 'client/build')));

// Basic routes for demo
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AI Trip Planner API is running!',
    timestamp: new Date().toISOString()
  });
});

// Enhanced AI endpoints
app.post('/api/ai/generate-itinerary', async (req, res) => {
  try {
    const { from, destination, duration, budget, interests, travelStyle, groupSize, specialRequirements, startDate, endDate } = req.body;
  
  if (!from || !destination || !duration || !budget || !interests) {
    return res.status(400).json({ 
      success: false, 
        message: 'Missing required itinerary parameters' 
      });
    }

    // Generate itinerary using AI service
    const itinerary = await aiService.generateItinerary({
      userId: req.user?.id || 'demo-user',
    from,
    destination,
    duration,
    budget,
    interests,
      travelStyle: travelStyle || 'balanced',
      groupSize: groupSize || 2,
      specialRequirements: specialRequirements || [],
      startDate: startDate || new Date().toISOString(),
      endDate: endDate || new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString()
    });

    res.json({
      success: true,
      itinerary,
      message: 'AI-powered itinerary generated successfully!'
    });
  } catch (error) {
    console.error('Error generating itinerary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate itinerary',
      error: error.message
    });
  }
});

// Get personalized recommendations
app.post('/api/ai/recommendations', async (req, res) => {
  try {
    const { destination, interests, currentLocation, budget, timeOfDay, weather } = req.body;
    
    const recommendations = await aiService.getPersonalizedRecommendations({
      userId: req.user?.id || 'demo-user',
      destination,
      interests,
      currentLocation,
      budget,
      timeOfDay,
      weather
    });

    res.json({
      success: true,
      recommendations,
      message: 'Personalized recommendations generated successfully!'
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message
    });
  }
});

// AR content generation
app.post('/api/ar/content', async (req, res) => {
  try {
    const { landmark, destination } = req.body;
    
    const arContent = await arService.generateARContent(landmark, destination);
    
    res.json({
      success: true,
      arContent,
      message: 'AR content generated successfully!'
    });
  } catch (error) {
    console.error('Error generating AR content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AR content',
      error: error.message
    });
  }
});

// AR experiences
app.post('/api/ar/experiences', async (req, res) => {
  try {
    const { itinerary, userInterests } = req.body;
    
    const arExperiences = await arService.generateARExperiences(itinerary, userInterests);
    
    res.json({
      success: true,
      arExperiences,
      message: 'AR experiences generated successfully!'
    });
  } catch (error) {
    console.error('Error generating AR experiences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AR experiences',
      error: error.message
    });
  }
});

// Multilingual content
app.post('/api/multilingual/translate', async (req, res) => {
  try {
    const { content, targetLanguage, sourceLanguage = 'en' } = req.body;
    
    const translatedContent = await multilingualService.translateContent(content, targetLanguage, sourceLanguage);
    
    res.json({
      success: true,
      translatedContent,
      message: 'Content translated successfully!'
    });
  } catch (error) {
    console.error('Error translating content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to translate content',
      error: error.message
    });
  }
});

// Get travel phrases
app.post('/api/multilingual/phrases', async (req, res) => {
  try {
    const { destination, language } = req.body;
    
    const phrases = await multilingualService.getTravelPhrases(destination, language);
    
    res.json({
      success: true,
      phrases,
      message: 'Travel phrases generated successfully!'
    });
  } catch (error) {
    console.error('Error getting travel phrases:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get travel phrases',
      error: error.message
    });
  }
});

// Maps integration
app.get('/api/maps/places/:destination', async (req, res) => {
  try {
    const { destination } = req.params;
    const { type = 'tourist_attraction' } = req.query;
    
    const places = await mapsService.getPlacesByType(destination, type);
    
    res.json({
      success: true,
      places,
      message: 'Places retrieved successfully!'
    });
  } catch (error) {
    console.error('Error getting places:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get places',
      error: error.message
    });
  }
});

// Get tourist attractions
app.get('/api/maps/attractions/:destination', async (req, res) => {
  try {
    const { destination } = req.params;
    
    const attractions = await mapsService.getTouristAttractions(destination);

  res.json({
    success: true,
      attractions,
      message: 'Tourist attractions retrieved successfully!'
    });
  } catch (error) {
    console.error('Error getting attractions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get attractions',
      error: error.message
    });
  }
});

// Get restaurants
app.get('/api/maps/restaurants/:destination', async (req, res) => {
  try {
    const { destination } = req.params;
    const { cuisine } = req.query;
    
    const restaurants = await mapsService.getRestaurants(destination, cuisine);
    
    res.json({
      success: true,
      restaurants,
      message: 'Restaurants retrieved successfully!'
    });
  } catch (error) {
    console.error('Error getting restaurants:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get restaurants',
      error: error.message
    });
  }
});

// Get directions
app.get('/api/maps/directions', async (req, res) => {
  try {
    const { origin, destination, mode = 'driving' } = req.query;
    
    const directions = await mapsService.getDirections(origin, destination, mode);
    
    res.json({
      success: true,
      directions,
      message: 'Directions retrieved successfully!'
    });
  } catch (error) {
    console.error('Error getting directions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get directions',
      error: error.message
    });
  }
});

// Weather adjustments
app.post('/api/ai/weather-adjustments', async (req, res) => {
  try {
    const { itinerary, weatherData } = req.body;
    
    const adjustments = await aiService.generateWeatherAdjustments(itinerary, weatherData);

  res.json({
    success: true,
      adjustments,
      message: 'Weather adjustments generated successfully!'
    });
  } catch (error) {
    console.error('Error generating weather adjustments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate weather adjustments',
      error: error.message
    });
  }
});

// Social sharing templates
app.post('/api/social/templates', async (req, res) => {
  try {
    const { itinerary, platform } = req.body;
    
    const templates = await aiService.generateSocialTemplates(itinerary, platform);
    
    res.json({
      success: true,
      templates,
      message: 'Social templates generated successfully!'
    });
  } catch (error) {
    console.error('Error generating social templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate social templates',
      error: error.message
    });
  }
});

// Enhanced booking endpoints
app.post('/api/booking/create', async (req, res) => {
  try {
    const { itineraryId, travelerDetails, paymentDetails, specialRequests } = req.body;
    
    const booking = await bookingService.bookItinerary({
      userId: req.user?.id || 'demo-user',
      itineraryId,
      paymentId: paymentDetails.paymentId,
      contactInfo: travelerDetails,
      specialRequests
    });
    
    res.json({
      success: true,
      booking,
      message: 'Booking created successfully!'
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
});

// Get booking status
app.get('/api/booking/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user?.id || 'demo-user';
    
    const booking = await bookingService.getBookingStatus(bookingId, userId);
    
    res.json({
      success: true,
      booking,
      message: 'Booking status retrieved successfully!'
    });
  } catch (error) {
    console.error('Error getting booking status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get booking status',
      error: error.message
    });
  }
});

// Cancel booking
app.post('/api/booking/:bookingId/cancel', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    const userId = req.user?.id || 'demo-user';
    
    const result = await bookingService.cancelBooking(bookingId, userId, reason);
    
    res.json({
      success: true,
      result,
      message: 'Booking cancelled successfully!'
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message
    });
  }
});

// Get user bookings
app.get('/api/bookings', async (req, res) => {
  try {
    const userId = req.user?.id || 'demo-user';
    
    const bookings = await bookingService.getUserBookings(userId);
    
    res.json({
      success: true,
      bookings,
      message: 'User bookings retrieved successfully!'
    });
  } catch (error) {
    console.error('Error getting user bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user bookings',
      error: error.message
    });
  }
});

// Enhanced payment endpoints
app.post('/api/payment/process', async (req, res) => {
  try {
    const { userId, amount, currency, paymentMethod, paymentDetails } = req.body;
    
    const paymentResult = await paymentService.processPayment({
      userId: userId || 'demo-user',
      amount,
      currency: currency || 'INR',
      paymentMethod,
      paymentDetails
    });
    
    res.json({
      success: paymentResult.success,
      payment: paymentResult,
      message: paymentResult.success ? 'Payment processed successfully!' : 'Payment failed'
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment',
      error: error.message
    });
  }
});

// Create Razorpay order
app.post('/api/payment/razorpay/order', async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;
    
    const order = await paymentService.createRazorpayOrder(amount, currency);
    
    res.json({
      success: true,
      order,
      message: 'Razorpay order created successfully!'
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create Razorpay order',
      error: error.message
    });
  }
});

// Create Stripe payment intent
app.post('/api/payment/stripe/intent', async (req, res) => {
  try {
    const { amount, currency = 'USD' } = req.body;
    
    const paymentIntent = await paymentService.createStripePaymentIntent(amount, currency);
    
    res.json({
      success: true,
      paymentIntent,
      message: 'Stripe payment intent created successfully!'
    });
  } catch (error) {
    console.error('Error creating Stripe payment intent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create Stripe payment intent',
      error: error.message
    });
  }
});

// Refund payment
app.post('/api/payment/refund', async (req, res) => {
  try {
    const { paymentId, paymentMethod, amount, reason } = req.body;
    
    const refund = await paymentService.refundPayment(paymentId, paymentMethod, amount, reason);
    
    res.json({
      success: true,
      refund,
      message: 'Refund processed successfully!'
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: error.message
    });
  }
});

// Get payment status
app.get('/api/payment/:paymentId/status', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { paymentMethod } = req.query;
    
    const status = await paymentService.getPaymentStatus(paymentId, paymentMethod);
    
    res.json({
      success: true,
      status,
      message: 'Payment status retrieved successfully!'
    });
  } catch (error) {
    console.error('Error getting payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status',
      error: error.message
    });
  }
});

// Webhook handlers
app.post('/api/payment/stripe/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    const result = await paymentService.handleStripeWebhook(req.body, signature);
    
    res.json(result);
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/payment/razorpay/webhook', async (req, res) => {
  try {
    const result = await paymentService.handleRazorpayWebhook(req.body);
    
    res.json(result);
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Email confirmation endpoint
app.post('/api/send-confirmation-email', (req, res) => {
  try {
    const { email, bookingId, itinerary, booking } = req.body;
    
    // Simulate email sending
    const emailData = {
      to: email,
      subject: `Trip Booking Confirmed - ${bookingId}`,
      bookingId,
      itinerary,
      booking,
      sentAt: new Date().toISOString()
    };
    
    // In a real app, use SendGrid, Nodemailer, or similar
    console.log('Confirmation email sent:', emailData);
    
    res.json({
      success: true,
      message: 'Confirmation email sent successfully!',
      emailData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// SMS notification endpoint
app.post('/api/send-sms', (req, res) => {
  try {
    const { phone, message, bookingId } = req.body;
    
    // Simulate SMS sending
    const smsData = {
      to: phone,
      message,
      bookingId,
      sentAt: new Date().toISOString()
    };
    
    // In a real app, use Twilio or similar
    console.log('SMS sent:', smsData);
    
    res.json({
      success: true,
      message: 'SMS sent successfully!',
      smsData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get booking details
app.get('/api/booking/:bookingId', (req, res) => {
  try {
    const { bookingId } = req.params;
    
    // In a real app, fetch from database
    const booking = {
      id: bookingId,
      status: 'confirmed',
      itinerary: {
        destination: 'Goa',
        duration: 3,
        from: 'Mumbai'
      },
      traveler: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+91 9876543210'
      },
      payment: {
        amount: 25000,
        currency: 'INR',
        method: 'razorpay'
      }
    };
    
    res.json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Voice Assistant endpoints
app.post('/api/voice/process', async (req, res) => {
  try {
    const { audioData, userId } = req.body;
    
    const result = await voiceAssistantService.processVoiceCommand(audioData, userId);
    
    res.json({
      success: true,
      result,
      message: 'Voice command processed successfully!'
    });
  } catch (error) {
    console.error('Error processing voice command:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process voice command',
      error: error.message
    });
  }
});

app.get('/api/voice/commands', (req, res) => {
  try {
    const commands = voiceAssistantService.getAvailableCommands();
    
    res.json({
      success: true,
      commands,
      message: 'Voice commands retrieved successfully!'
    });
  } catch (error) {
    console.error('Error getting voice commands:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get voice commands',
      error: error.message
    });
  }
});

// Sustainability endpoints
app.post('/api/sustainability/carbon-footprint', async (req, res) => {
  try {
    const { itinerary } = req.body;
    
    const carbonFootprint = await sustainabilityService.calculateCarbonFootprint(itinerary);
    
    res.json({
      success: true,
      carbonFootprint,
      message: 'Carbon footprint calculated successfully!'
    });
  } catch (error) {
    console.error('Error calculating carbon footprint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate carbon footprint',
      error: error.message
    });
  }
});

app.post('/api/sustainability/local-impact', async (req, res) => {
  try {
    const { itinerary } = req.body;
    
    const localImpact = sustainabilityService.calculateLocalImpact(itinerary);
    
    res.json({
      success: true,
      localImpact,
      message: 'Local impact calculated successfully!'
    });
  } catch (error) {
    console.error('Error calculating local impact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate local impact',
      error: error.message
    });
  }
});

app.post('/api/sustainability/report', async (req, res) => {
  try {
    const { itinerary } = req.body;
    
    const report = await sustainabilityService.generateSustainabilityReport(itinerary);
    
    res.json({
      success: true,
      report,
      message: 'Sustainability report generated successfully!'
    });
  } catch (error) {
    console.error('Error generating sustainability report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate sustainability report',
      error: error.message
    });
  }
});

app.post('/api/sustainability/alternatives', async (req, res) => {
  try {
    const { itinerary } = req.body;
    
    const alternatives = await sustainabilityService.getEcoFriendlyAlternatives(itinerary);
    
    res.json({
      success: true,
      alternatives,
      message: 'Eco-friendly alternatives generated successfully!'
    });
  } catch (error) {
    console.error('Error getting eco-friendly alternatives:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get eco-friendly alternatives',
      error: error.message
    });
  }
});

// Analytics endpoints
app.get('/api/analytics/insights/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const insights = await analyticsService.generateUserInsights(userId);
    
    res.json({
      success: true,
      insights,
      message: 'User insights generated successfully!'
    });
  } catch (error) {
    console.error('Error generating user insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate user insights',
      error: error.message
    });
  }
});

app.get('/api/analytics/dashboard/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const dashboard = await analyticsService.getAnalyticsDashboard(userId);
    
    res.json({
      success: true,
      dashboard,
      message: 'Analytics dashboard retrieved successfully!'
    });
  } catch (error) {
    console.error('Error getting analytics dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics dashboard',
      error: error.message
    });
  }
});

app.post('/api/analytics/track-recommendation', async (req, res) => {
  try {
    const { userId, recommendationId, action } = req.body;
    
    const result = await analyticsService.trackRecommendationEffectiveness(userId, recommendationId, action);
    
    res.json({
      success: true,
      result,
      message: 'Recommendation tracking recorded successfully!'
    });
  } catch (error) {
    console.error('Error tracking recommendation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track recommendation',
      error: error.message
    });
  }
});

// EMT Inventory endpoints
app.post('/api/emt/search', async (req, res) => {
  try {
    const searchParams = req.body;
    
    const results = await emtInventoryService.searchInventory(searchParams);
    
    res.json({
      success: true,
      results,
      message: 'EMT inventory search completed successfully!'
    });
  } catch (error) {
    console.error('Error searching EMT inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search EMT inventory',
      error: error.message
    });
  }
});

app.get('/api/emt/item/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { category } = req.query;
    
    const details = await emtInventoryService.getItemDetails(itemId, category);
    
    res.json({
      success: true,
      details,
      message: 'Item details retrieved successfully!'
    });
  } catch (error) {
    console.error('Error getting item details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get item details',
      error: error.message
    });
  }
});

app.post('/api/emt/availability', async (req, res) => {
  try {
    const { itemId, category, startDate, endDate, passengers } = req.body;
    
    const availability = await emtInventoryService.checkAvailability(itemId, category, startDate, endDate, passengers);
    
    res.json({
      success: true,
      availability,
      message: 'Availability checked successfully!'
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check availability',
      error: error.message
    });
  }
});

app.post('/api/emt/book', async (req, res) => {
  try {
    const bookingData = req.body;
    
    const booking = await emtInventoryService.createBooking(bookingData);
    
    res.json({
      success: true,
      booking,
      message: 'Booking created successfully!'
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
});

app.post('/api/emt/book-itinerary', async (req, res) => {
  try {
    const { itinerary, customerInfo, paymentInfo } = req.body;
    
    const result = await emtInventoryService.bookCompleteItinerary(itinerary, customerInfo, paymentInfo);
    
    res.json({
      success: true,
      result,
      message: 'Complete itinerary booking processed successfully!'
    });
  } catch (error) {
    console.error('Error booking complete itinerary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book complete itinerary',
      error: error.message
    });
  }
});

app.get('/api/emt/booking/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await emtInventoryService.getBookingStatus(bookingId);
    
    res.json({
      success: true,
      booking,
      message: 'Booking status retrieved successfully!'
    });
  } catch (error) {
    console.error('Error getting booking status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get booking status',
      error: error.message
    });
  }
});

app.post('/api/emt/booking/:bookingId/cancel', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    
    const result = await emtInventoryService.cancelBooking(bookingId, reason);
    
    res.json({
      success: true,
      result,
      message: 'Booking cancelled successfully!'
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message
    });
  }
});

app.get('/api/emt/categories', (req, res) => {
  try {
    const categories = emtInventoryService.getServiceCategories();
    
    res.json({
      success: true,
      categories,
      message: 'Service categories retrieved successfully!'
    });
  } catch (error) {
    console.error('Error getting service categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get service categories',
      error: error.message
    });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 AI Trip Planner Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Open http://localhost:${PORT} to view the application`);
});
