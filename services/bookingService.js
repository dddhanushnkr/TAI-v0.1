const { db } = require('../config/firebase');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

/**
 * Book itinerary with EMT inventory
 */
async function bookItinerary(bookingData) {
  try {
    const {
      userId,
      itineraryId,
      paymentId,
      contactInfo,
      specialRequests
    } = bookingData;

    // Get itinerary details
    const itineraryDoc = await db.collection('itineraries').doc(itineraryId).get();
    if (!itineraryDoc.exists) {
      throw new Error('Itinerary not found');
    }

    const itinerary = itineraryDoc.data();

    // Generate booking ID
    const bookingId = uuidv4();

    // Book transportation through EMT API
    const transportationBookings = await bookTransportation(itinerary, contactInfo);

    // Book accommodations
    const accommodationBookings = await bookAccommodations(itinerary, contactInfo);

    // Book activities
    const activityBookings = await bookActivities(itinerary, contactInfo);

    // Create booking record
    const booking = {
      id: bookingId,
      userId,
      itineraryId,
      paymentId,
      status: 'confirmed',
      contactInfo,
      specialRequests: specialRequests || [],
      bookings: {
        transportation: transportationBookings,
        accommodations: accommodationBookings,
        activities: activityBookings
      },
      totalCost: calculateTotalCost(transportationBookings, accommodationBookings, activityBookings),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save booking to database
    await db.collection('bookings').doc(bookingId).set(booking);

    // Update itinerary status
    await db.collection('itineraries').doc(itineraryId).update({
      status: 'booked',
      bookingId,
      updatedAt: new Date().toISOString()
    });

    // Send confirmation notifications
    await sendBookingConfirmation(booking);

    return booking;

  } catch (error) {
    console.error('Error booking itinerary:', error);
    throw new Error(`Failed to book itinerary: ${error.message}`);
  }
}

/**
 * Book transportation through EMT API
 */
async function bookTransportation(itinerary, contactInfo) {
  try {
    const bookings = [];

    // Extract transportation needs from itinerary
    const transportationNeeds = extractTransportationNeeds(itinerary);

    for (const transport of transportationNeeds) {
      try {
        // Call EMT API for booking
        const bookingResponse = await axios.post(`${process.env.EMT_API_URL}/book`, {
          route: transport.route,
          date: transport.date,
          time: transport.time,
          passengers: transport.passengers,
          contactInfo,
          preferences: transport.preferences
        }, {
          headers: {
            'Authorization': `Bearer ${process.env.EMT_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        if (bookingResponse.data.success) {
          bookings.push({
            type: 'transportation',
            provider: 'EMT',
            bookingId: bookingResponse.data.bookingId,
            route: transport.route,
            date: transport.date,
            time: transport.time,
            passengers: transport.passengers,
            cost: bookingResponse.data.cost,
            status: 'confirmed',
            confirmationCode: bookingResponse.data.confirmationCode,
            ticketUrl: bookingResponse.data.ticketUrl
          });
        }
      } catch (error) {
        console.error(`Error booking transportation for ${transport.route}:`, error);
        // Continue with other bookings even if one fails
        bookings.push({
          type: 'transportation',
          provider: 'EMT',
          route: transport.route,
          date: transport.date,
          time: transport.time,
          passengers: transport.passengers,
          status: 'failed',
          error: error.message
        });
      }
    }

    return bookings;

  } catch (error) {
    console.error('Error booking transportation:', error);
    throw new Error(`Failed to book transportation: ${error.message}`);
  }
}

/**
 * Book accommodations
 */
async function bookAccommodations(itinerary, contactInfo) {
  try {
    const bookings = [];

    // Extract accommodation needs from itinerary
    const accommodationNeeds = extractAccommodationNeeds(itinerary);

    for (const accommodation of accommodationNeeds) {
      try {
        // For demo purposes, we'll simulate accommodation booking
        // In production, this would integrate with accommodation APIs
        const bookingId = uuidv4();

        bookings.push({
          type: 'accommodation',
          provider: accommodation.provider || 'Booking.com',
          bookingId,
          name: accommodation.name,
          checkIn: accommodation.checkIn,
          checkOut: accommodation.checkOut,
          guests: accommodation.guests,
          cost: accommodation.cost,
          status: 'confirmed',
          confirmationCode: `ACC-${bookingId.substring(0, 8).toUpperCase()}`,
          bookingUrl: `https://booking.com/confirmation/${bookingId}`
        });
      } catch (error) {
        console.error(`Error booking accommodation ${accommodation.name}:`, error);
        bookings.push({
          type: 'accommodation',
          name: accommodation.name,
          checkIn: accommodation.checkIn,
          checkOut: accommodation.checkOut,
          guests: accommodation.guests,
          status: 'failed',
          error: error.message
        });
      }
    }

    return bookings;

  } catch (error) {
    console.error('Error booking accommodations:', error);
    throw new Error(`Failed to book accommodations: ${error.message}`);
  }
}

/**
 * Book activities
 */
async function bookActivities(itinerary, contactInfo) {
  try {
    const bookings = [];

    // Extract activity needs from itinerary
    const activityNeeds = extractActivityNeeds(itinerary);

    for (const activity of activityNeeds) {
      if (activity.bookingRequired) {
        try {
          // For demo purposes, we'll simulate activity booking
          const bookingId = uuidv4();

          bookings.push({
            type: 'activity',
            provider: activity.provider || 'Viator',
            bookingId,
            name: activity.name,
            date: activity.date,
            time: activity.time,
            participants: activity.participants,
            cost: activity.cost,
            status: 'confirmed',
            confirmationCode: `ACT-${bookingId.substring(0, 8).toUpperCase()}`,
            bookingUrl: `https://viator.com/confirmation/${bookingId}`
          });
        } catch (error) {
          console.error(`Error booking activity ${activity.name}:`, error);
          bookings.push({
            type: 'activity',
            name: activity.name,
            date: activity.date,
            time: activity.time,
            participants: activity.participants,
            status: 'failed',
            error: error.message
          });
        }
      }
    }

    return bookings;

  } catch (error) {
    console.error('Error booking activities:', error);
    throw new Error(`Failed to book activities: ${error.message}`);
  }
}

/**
 * Get booking status
 */
async function getBookingStatus(bookingId, userId) {
  try {
    const bookingDoc = await db.collection('bookings').doc(bookingId).get();
    
    if (!bookingDoc.exists) {
      throw new Error('Booking not found');
    }

    const booking = bookingDoc.data();

    // Verify user owns this booking
    if (booking.userId !== userId) {
      throw new Error('Unauthorized access to booking');
    }

    // Check real-time status of individual bookings
    const updatedBookings = await checkBookingStatuses(booking.bookings);

    // Update booking if statuses changed
    if (JSON.stringify(updatedBookings) !== JSON.stringify(booking.bookings)) {
      await db.collection('bookings').doc(bookingId).update({
        bookings: updatedBookings,
        updatedAt: new Date().toISOString()
      });
      booking.bookings = updatedBookings;
    }

    return booking;

  } catch (error) {
    console.error('Error getting booking status:', error);
    throw new Error(`Failed to get booking status: ${error.message}`);
  }
}

/**
 * Cancel booking
 */
async function cancelBooking(bookingId, userId, reason) {
  try {
    const bookingDoc = await db.collection('bookings').doc(bookingId).get();
    
    if (!bookingDoc.exists) {
      throw new Error('Booking not found');
    }

    const booking = bookingDoc.data();

    // Verify user owns this booking
    if (booking.userId !== userId) {
      throw new Error('Unauthorized access to booking');
    }

    // Cancel individual bookings
    const cancellationResults = await cancelIndividualBookings(booking.bookings);

    // Update booking status
    await db.collection('bookings').doc(bookingId).update({
      status: 'cancelled',
      cancellationReason: reason,
      cancelledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Process refunds
    const refundResult = await processRefund(booking.paymentId, reason);

    return {
      bookingId,
      status: 'cancelled',
      cancellationResults,
      refund: refundResult
    };

  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw new Error(`Failed to cancel booking: ${error.message}`);
  }
}

/**
 * Helper functions
 */
function extractTransportationNeeds(itinerary) {
  const transportation = [];
  
  if (itinerary.bookingInfo?.transportation) {
    for (const transport of itinerary.bookingInfo.transportation) {
      transportation.push({
        route: transport.route,
        date: transport.date,
        time: transport.time,
        passengers: transport.passengers || 1,
        preferences: transport.preferences || {}
      });
    }
  }

  return transportation;
}

function extractAccommodationNeeds(itinerary) {
  const accommodations = [];
  
  if (itinerary.bookingInfo?.accommodations) {
    for (const accommodation of itinerary.bookingInfo.accommodations) {
      accommodations.push({
        name: accommodation.name,
        checkIn: accommodation.checkIn,
        checkOut: accommodation.checkOut,
        guests: accommodation.guests || 1,
        cost: accommodation.price,
        provider: accommodation.provider
      });
    }
  }

  return accommodations;
}

function extractActivityNeeds(itinerary) {
  const activities = [];
  
  if (itinerary.itinerary?.days) {
    for (const day of itinerary.itinerary.days) {
      for (const activity of day.activities) {
        if (activity.bookingRequired) {
          activities.push({
            name: activity.activity,
            date: day.date,
            time: activity.time,
            participants: activity.participants || 1,
            cost: activity.cost,
            provider: activity.provider
          });
        }
      }
    }
  }

  return activities;
}

function calculateTotalCost(transportation, accommodations, activities) {
  let total = 0;
  
  transportation.forEach(booking => {
    if (booking.cost) {
      total += parseFloat(booking.cost.replace(/[^0-9.-]+/g, ''));
    }
  });
  
  accommodations.forEach(booking => {
    if (booking.cost) {
      total += parseFloat(booking.cost.replace(/[^0-9.-]+/g, ''));
    }
  });
  
  activities.forEach(booking => {
    if (booking.cost) {
      total += parseFloat(booking.cost.replace(/[^0-9.-]+/g, ''));
    }
  });
  
  return total;
}

async function checkBookingStatuses(bookings) {
  // This would check real-time status with providers
  // For demo purposes, return as-is
  return bookings;
}

async function cancelIndividualBookings(bookings) {
  const results = [];
  
  // Cancel transportation bookings
  for (const booking of bookings.transportation) {
    if (booking.status === 'confirmed') {
      try {
        // Call EMT API to cancel
        await axios.post(`${process.env.EMT_API_URL}/cancel`, {
          bookingId: booking.bookingId
        }, {
          headers: {
            'Authorization': `Bearer ${process.env.EMT_API_KEY}`
          }
        });
        results.push({ type: 'transportation', bookingId: booking.bookingId, status: 'cancelled' });
      } catch (error) {
        results.push({ type: 'transportation', bookingId: booking.bookingId, status: 'cancellation_failed', error: error.message });
      }
    }
  }
  
  // Cancel accommodation and activity bookings
  // Similar logic for other booking types
  
  return results;
}

async function processRefund(paymentId, reason) {
  // This would integrate with payment service to process refunds
  return {
    refundId: uuidv4(),
    amount: 0, // Would be calculated based on cancellation policy
    status: 'pending',
    reason
  };
}

async function sendBookingConfirmation(booking) {
  // This would send email/SMS confirmations
  console.log('Sending booking confirmation for:', booking.id);
}

async function getUserBookings(userId) {
  try {
    const bookingsSnapshot = await db.collection('bookings')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const bookings = [];
    bookingsSnapshot.forEach(doc => {
      bookings.push({ id: doc.id, ...doc.data() });
    });

    return bookings;
  } catch (error) {
    console.error('Error getting user bookings:', error);
    throw new Error('Failed to get user bookings');
  }
}

async function getBookingDetails(bookingId, userId) {
  try {
    const bookingDoc = await db.collection('bookings').doc(bookingId).get();
    
    if (!bookingDoc.exists) {
      throw new Error('Booking not found');
    }

    const booking = bookingDoc.data();

    if (booking.userId !== userId) {
      throw new Error('Unauthorized access to booking');
    }

    return { id: bookingId, ...booking };
  } catch (error) {
    console.error('Error getting booking details:', error);
    throw new Error('Failed to get booking details');
  }
}

module.exports = {
  bookItinerary,
  getBookingStatus,
  cancelBooking,
  getUserBookings,
  getBookingDetails
};
