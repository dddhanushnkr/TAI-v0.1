const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { bookItinerary, getBookingStatus, cancelBooking } = require('../services/bookingService');
const { processPayment } = require('../services/paymentService');

// Book itinerary
router.post('/book', authenticateToken, async (req, res) => {
  try {
    const {
      itineraryId,
      paymentMethod,
      paymentDetails,
      contactInfo,
      specialRequests
    } = req.body;

    // Validate required fields
    if (!itineraryId || !paymentMethod || !paymentDetails) {
      return res.status(400).json({
        error: 'Missing required fields: itineraryId, paymentMethod, paymentDetails'
      });
    }

    // Process payment first
    const paymentResult = await processPayment({
      userId: req.user.id,
      amount: paymentDetails.amount,
      currency: paymentDetails.currency || 'USD',
      paymentMethod,
      paymentDetails
    });

    if (!paymentResult.success) {
      return res.status(400).json({
        error: 'Payment failed',
        message: paymentResult.message
      });
    }

    // Book the itinerary
    const bookingResult = await bookItinerary({
      userId: req.user.id,
      itineraryId,
      paymentId: paymentResult.paymentId,
      contactInfo,
      specialRequests
    });

    res.json({
      success: true,
      booking: bookingResult,
      payment: paymentResult,
      message: 'Booking completed successfully'
    });

  } catch (error) {
    console.error('Error booking itinerary:', error);
    res.status(500).json({
      error: 'Failed to book itinerary',
      message: error.message
    });
  }
});

// Get booking status
router.get('/status/:bookingId', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const bookingStatus = await getBookingStatus(bookingId, req.user.id);

    res.json({
      success: true,
      booking: bookingStatus
    });

  } catch (error) {
    console.error('Error getting booking status:', error);
    res.status(500).json({
      error: 'Failed to get booking status',
      message: error.message
    });
  }
});

// Cancel booking
router.post('/cancel/:bookingId', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const cancelResult = await cancelBooking(bookingId, req.user.id, reason);

    res.json({
      success: true,
      cancellation: cancelResult,
      message: 'Booking cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      error: 'Failed to cancel booking',
      message: error.message
    });
  }
});

// Get user's bookings
router.get('/my-bookings', authenticateToken, async (req, res) => {
  try {
    const bookings = await getUserBookings(req.user.id);

    res.json({
      success: true,
      bookings
    });

  } catch (error) {
    console.error('Error getting user bookings:', error);
    res.status(500).json({
      error: 'Failed to get bookings',
      message: error.message
    });
  }
});

// Get booking details
router.get('/:bookingId', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await getBookingDetails(bookingId, req.user.id);

    res.json({
      success: true,
      booking
    });

  } catch (error) {
    console.error('Error getting booking details:', error);
    res.status(500).json({
      error: 'Failed to get booking details',
      message: error.message
    });
  }
});

module.exports = router;
