const axios = require('axios');

/**
 * EMT Inventory Service for seamless booking integration
 */
class EMTInventoryService {
  constructor() {
    this.apiKey = process.env.EMT_API_KEY || 'demo-key';
    this.baseUrl = process.env.EMT_BASE_URL || 'https://api.emt.com/v1';
    this.timeout = 30000; // 30 seconds
    
    // EMT service categories
    this.serviceCategories = {
      'transportation': {
        'flight': 'Airline tickets and flights',
        'train': 'Railway tickets and train services',
        'bus': 'Bus tickets and intercity transport',
        'metro': 'Local metro and public transport',
        'taxi': 'Taxi and cab services',
        'car_rental': 'Car rental services'
      },
      'accommodation': {
        'hotel': 'Hotels and resorts',
        'hostel': 'Hostels and budget accommodations',
        'homestay': 'Homestays and local accommodations',
        'apartment': 'Apartment rentals',
        'villa': 'Villa and luxury rentals'
      },
      'activities': {
        'tours': 'Guided tours and sightseeing',
        'adventures': 'Adventure activities and sports',
        'cultural': 'Cultural experiences and workshops',
        'food': 'Food tours and culinary experiences',
        'entertainment': 'Entertainment and shows',
        'wellness': 'Wellness and spa services'
      },
      'services': {
        'insurance': 'Travel insurance',
        'visa': 'Visa assistance',
        'guide': 'Local guide services',
        'translation': 'Translation services',
        'concierge': 'Concierge services'
      }
    };

    // Booking status mapping
    this.bookingStatus = {
      'pending': 'Booking is being processed',
      'confirmed': 'Booking confirmed',
      'cancelled': 'Booking cancelled',
      'completed': 'Service completed',
      'refunded': 'Booking refunded'
    };
  }

  /**
   * Search available inventory
   */
  async searchInventory(searchParams) {
    try {
      const {
        category,
        subcategory,
        destination,
        startDate,
        endDate,
        passengers = 1,
        budget,
        preferences = {}
      } = searchParams;

      const requestData = {
        category,
        subcategory,
        destination,
        start_date: startDate,
        end_date: endDate,
        passengers,
        budget,
        preferences,
        api_key: this.apiKey
      };

      const response = await axios.post(`${this.baseUrl}/inventory/search`, requestData, {
        timeout: this.timeout,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return {
        success: true,
        results: response.data.results || [],
        totalResults: response.data.total_results || 0,
        searchId: response.data.search_id,
        filters: response.data.available_filters || {}
      };

    } catch (error) {
      console.error('Error searching EMT inventory:', error);
      return {
        success: false,
        error: error.message,
        results: [],
        totalResults: 0
      };
    }
  }

  /**
   * Get detailed information about a specific item
   */
  async getItemDetails(itemId, category) {
    try {
      const response = await axios.get(`${this.baseUrl}/inventory/item/${itemId}`, {
        params: {
          category,
          api_key: this.apiKey
        },
        timeout: this.timeout,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return {
        success: true,
        item: response.data.item,
        availability: response.data.availability,
        pricing: response.data.pricing,
        policies: response.data.policies
      };

    } catch (error) {
      console.error('Error getting item details:', error);
      return {
        success: false,
        error: error.message,
        item: null
      };
    }
  }

  /**
   * Check availability for specific dates
   */
  async checkAvailability(itemId, category, startDate, endDate, passengers = 1) {
    try {
      const response = await axios.post(`${this.baseUrl}/inventory/availability`, {
        item_id: itemId,
        category,
        start_date: startDate,
        end_date: endDate,
        passengers,
        api_key: this.apiKey
      }, {
        timeout: this.timeout,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return {
        success: true,
        available: response.data.available,
        price: response.data.price,
        currency: response.data.currency,
        availability: response.data.availability_details,
        bookingDeadline: response.data.booking_deadline
      };

    } catch (error) {
      console.error('Error checking availability:', error);
      return {
        success: false,
        error: error.message,
        available: false
      };
    }
  }

  /**
   * Create a booking
   */
  async createBooking(bookingData) {
    try {
      const {
        itemId,
        category,
        startDate,
        endDate,
        passengers,
        customerInfo,
        paymentInfo,
        specialRequests = []
      } = bookingData;

      const requestData = {
        item_id: itemId,
        category,
        start_date: startDate,
        end_date: endDate,
        passengers,
        customer_info: customerInfo,
        payment_info: paymentInfo,
        special_requests: specialRequests,
        api_key: this.apiKey
      };

      const response = await axios.post(`${this.baseUrl}/bookings/create`, requestData, {
        timeout: this.timeout,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return {
        success: true,
        bookingId: response.data.booking_id,
        status: response.data.status,
        confirmationNumber: response.data.confirmation_number,
        totalAmount: response.data.total_amount,
        currency: response.data.currency,
        bookingDetails: response.data.booking_details,
        cancellationPolicy: response.data.cancellation_policy
      };

    } catch (error) {
      console.error('Error creating booking:', error);
      return {
        success: false,
        error: error.message,
        bookingId: null
      };
    }
  }

  /**
   * Get booking status
   */
  async getBookingStatus(bookingId) {
    try {
      const response = await axios.get(`${this.baseUrl}/bookings/${bookingId}`, {
        params: {
          api_key: this.apiKey
        },
        timeout: this.timeout,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return {
        success: true,
        bookingId: response.data.booking_id,
        status: response.data.status,
        statusDescription: this.bookingStatus[response.data.status],
        bookingDetails: response.data.booking_details,
        totalAmount: response.data.total_amount,
        currency: response.data.currency,
        confirmationNumber: response.data.confirmation_number,
        cancellationPolicy: response.data.cancellation_policy,
        lastUpdated: response.data.last_updated
      };

    } catch (error) {
      console.error('Error getting booking status:', error);
      return {
        success: false,
        error: error.message,
        bookingId: null
      };
    }
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId, reason = 'User requested cancellation') {
    try {
      const response = await axios.post(`${this.baseUrl}/bookings/${bookingId}/cancel`, {
        reason,
        api_key: this.apiKey
      }, {
        timeout: this.timeout,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return {
        success: true,
        bookingId: response.data.booking_id,
        status: response.data.status,
        refundAmount: response.data.refund_amount,
        refundCurrency: response.data.refund_currency,
        refundStatus: response.data.refund_status,
        cancellationFee: response.data.cancellation_fee
      };

    } catch (error) {
      console.error('Error cancelling booking:', error);
      return {
        success: false,
        error: error.message,
        bookingId: null
      };
    }
  }

  /**
   * Modify a booking
   */
  async modifyBooking(bookingId, modifications) {
    try {
      const response = await axios.post(`${this.baseUrl}/bookings/${bookingId}/modify`, {
        modifications,
        api_key: this.apiKey
      }, {
        timeout: this.timeout,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return {
        success: true,
        bookingId: response.data.booking_id,
        status: response.data.status,
        modifications: response.data.applied_modifications,
        priceDifference: response.data.price_difference,
        newTotalAmount: response.data.new_total_amount,
        currency: response.data.currency
      };

    } catch (error) {
      console.error('Error modifying booking:', error);
      return {
        success: false,
        error: error.message,
        bookingId: null
      };
    }
  }

  /**
   * Get user's booking history
   */
  async getBookingHistory(userId, limit = 10, offset = 0) {
    try {
      const response = await axios.get(`${this.baseUrl}/bookings/history`, {
        params: {
          user_id: userId,
          limit,
          offset,
          api_key: this.apiKey
        },
        timeout: this.timeout,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return {
        success: true,
        bookings: response.data.bookings || [],
        totalBookings: response.data.total_bookings || 0,
        hasMore: response.data.has_more || false
      };

    } catch (error) {
      console.error('Error getting booking history:', error);
      return {
        success: false,
        error: error.message,
        bookings: [],
        totalBookings: 0
      };
    }
  }

  /**
   * Search transportation options
   */
  async searchTransportation(origin, destination, startDate, passengers = 1, preferences = {}) {
    try {
      const searchParams = {
        category: 'transportation',
        subcategory: preferences.mode || 'flight',
        destination: `${origin} to ${destination}`,
        startDate,
        endDate: startDate, // For one-way trips
        passengers,
        budget: preferences.budget,
        preferences: {
          class: preferences.class || 'economy',
          direct_flight: preferences.directFlight || false,
          flexible_dates: preferences.flexibleDates || false
        }
      };

      return await this.searchInventory(searchParams);

    } catch (error) {
      console.error('Error searching transportation:', error);
      return {
        success: false,
        error: error.message,
        results: []
      };
    }
  }

  /**
   * Search accommodation options
   */
  async searchAccommodation(destination, startDate, endDate, guests = 1, preferences = {}) {
    try {
      const searchParams = {
        category: 'accommodation',
        subcategory: preferences.type || 'hotel',
        destination,
        startDate,
        endDate,
        passengers: guests,
        budget: preferences.budget,
        preferences: {
          amenities: preferences.amenities || [],
          rating: preferences.rating || 3,
          location: preferences.location || 'city_center',
          breakfast_included: preferences.breakfastIncluded || false
        }
      };

      return await this.searchInventory(searchParams);

    } catch (error) {
      console.error('Error searching accommodation:', error);
      return {
        success: false,
        error: error.message,
        results: []
      };
    }
  }

  /**
   * Search activity options
   */
  async searchActivities(destination, startDate, endDate, participants = 1, preferences = {}) {
    try {
      const searchParams = {
        category: 'activities',
        subcategory: preferences.type || 'tours',
        destination,
        startDate,
        endDate,
        passengers: participants,
        budget: preferences.budget,
        preferences: {
          duration: preferences.duration || 'half_day',
          difficulty: preferences.difficulty || 'easy',
          language: preferences.language || 'english',
          group_size: preferences.groupSize || 'small'
        }
      };

      return await this.searchInventory(searchParams);

    } catch (error) {
      console.error('Error searching activities:', error);
      return {
        success: false,
        error: error.message,
        results: []
      };
    }
  }

  /**
   * Book complete itinerary
   */
  async bookCompleteItinerary(itinerary, customerInfo, paymentInfo) {
    try {
      const bookings = [];
      const errors = [];

      // Book transportation
      if (itinerary.bookingInfo?.transportation) {
        for (const transport of itinerary.bookingInfo.transportation) {
          try {
            const booking = await this.createBooking({
              itemId: transport.emtItemId,
              category: 'transportation',
              startDate: transport.startDate,
              endDate: transport.endDate,
              passengers: transport.passengers,
              customerInfo,
              paymentInfo,
              specialRequests: transport.specialRequests || []
            });

            if (booking.success) {
              bookings.push({
                type: 'transportation',
                bookingId: booking.bookingId,
                item: transport,
                status: booking.status
              });
            } else {
              errors.push({
                type: 'transportation',
                item: transport,
                error: booking.error
              });
            }
          } catch (error) {
            errors.push({
              type: 'transportation',
              item: transport,
              error: error.message
            });
          }
        }
      }

      // Book accommodations
      if (itinerary.bookingInfo?.accommodations) {
        for (const accommodation of itinerary.bookingInfo.accommodations) {
          try {
            const booking = await this.createBooking({
              itemId: accommodation.emtItemId,
              category: 'accommodation',
              startDate: accommodation.startDate,
              endDate: accommodation.endDate,
              passengers: accommodation.guests,
              customerInfo,
              paymentInfo,
              specialRequests: accommodation.specialRequests || []
            });

            if (booking.success) {
              bookings.push({
                type: 'accommodation',
                bookingId: booking.bookingId,
                item: accommodation,
                status: booking.status
              });
            } else {
              errors.push({
                type: 'accommodation',
                item: accommodation,
                error: booking.error
              });
            }
          } catch (error) {
            errors.push({
              type: 'accommodation',
              item: accommodation,
              error: error.message
            });
          }
        }
      }

      // Book activities
      if (itinerary.bookingInfo?.activities) {
        for (const activity of itinerary.bookingInfo.activities) {
          try {
            const booking = await this.createBooking({
              itemId: activity.emtItemId,
              category: 'activities',
              startDate: activity.startDate,
              endDate: activity.endDate,
              passengers: activity.participants,
              customerInfo,
              paymentInfo,
              specialRequests: activity.specialRequests || []
            });

            if (booking.success) {
              bookings.push({
                type: 'activity',
                bookingId: booking.bookingId,
                item: activity,
                status: booking.status
              });
            } else {
              errors.push({
                type: 'activity',
                item: activity,
                error: booking.error
              });
            }
          } catch (error) {
            errors.push({
              type: 'activity',
              item: activity,
              error: error.message
            });
          }
        }
      }

      return {
        success: bookings.length > 0,
        bookings,
        errors,
        totalBookings: bookings.length,
        totalErrors: errors.length,
        summary: {
          successful: bookings.length,
          failed: errors.length,
          total: bookings.length + errors.length
        }
      };

    } catch (error) {
      console.error('Error booking complete itinerary:', error);
      return {
        success: false,
        error: error.message,
        bookings: [],
        errors: []
      };
    }
  }

  /**
   * Get real-time pricing
   */
  async getRealTimePricing(itemId, category, startDate, endDate, passengers = 1) {
    try {
      const response = await axios.get(`${this.baseUrl}/pricing/realtime`, {
        params: {
          item_id: itemId,
          category,
          start_date: startDate,
          end_date: endDate,
          passengers,
          api_key: this.apiKey
        },
        timeout: this.timeout,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return {
        success: true,
        price: response.data.price,
        currency: response.data.currency,
        originalPrice: response.data.original_price,
        discount: response.data.discount,
        taxes: response.data.taxes,
        fees: response.data.fees,
        totalPrice: response.data.total_price,
        priceValidUntil: response.data.price_valid_until,
        dynamicPricing: response.data.dynamic_pricing
      };

    } catch (error) {
      console.error('Error getting real-time pricing:', error);
      return {
        success: false,
        error: error.message,
        price: null
      };
    }
  }

  /**
   * Get booking confirmation details
   */
  async getBookingConfirmation(bookingId) {
    try {
      const response = await axios.get(`${this.baseUrl}/bookings/${bookingId}/confirmation`, {
        params: {
          api_key: this.apiKey
        },
        timeout: this.timeout,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return {
        success: true,
        confirmation: {
          bookingId: response.data.booking_id,
          confirmationNumber: response.data.confirmation_number,
          status: response.data.status,
          itemDetails: response.data.item_details,
          customerInfo: response.data.customer_info,
          bookingDates: response.data.booking_dates,
          totalAmount: response.data.total_amount,
          currency: response.data.currency,
          cancellationPolicy: response.data.cancellation_policy,
          contactInfo: response.data.contact_info,
          specialInstructions: response.data.special_instructions
        }
      };

    } catch (error) {
      console.error('Error getting booking confirmation:', error);
      return {
        success: false,
        error: error.message,
        confirmation: null
      };
    }
  }

  /**
   * Get available service categories
   */
  getServiceCategories() {
    return this.serviceCategories;
  }

  /**
   * Get booking status descriptions
   */
  getBookingStatusDescriptions() {
    return this.bookingStatus;
  }

  /**
   * Validate booking data
   */
  validateBookingData(bookingData) {
    const requiredFields = ['itemId', 'category', 'startDate', 'customerInfo', 'paymentInfo'];
    const missingFields = requiredFields.filter(field => !bookingData[field]);
    
    if (missingFields.length > 0) {
      return {
        valid: false,
        errors: [`Missing required fields: ${missingFields.join(', ')}`]
      };
    }

    // Validate date format
    const startDate = new Date(bookingData.startDate);
    if (isNaN(startDate.getTime())) {
      return {
        valid: false,
        errors: ['Invalid start date format']
      };
    }

    // Validate category
    const validCategories = Object.keys(this.serviceCategories);
    if (!validCategories.includes(bookingData.category)) {
      return {
        valid: false,
        errors: [`Invalid category. Must be one of: ${validCategories.join(', ')}`]
      };
    }

    return {
      valid: true,
      errors: []
    };
  }

  /**
   * Generate booking summary
   */
  generateBookingSummary(bookings) {
    const summary = {
      totalBookings: bookings.length,
      byType: {},
      byStatus: {},
      totalAmount: 0,
      currency: 'INR'
    };

    bookings.forEach(booking => {
      // Count by type
      summary.byType[booking.type] = (summary.byType[booking.type] || 0) + 1;
      
      // Count by status
      summary.byStatus[booking.status] = (summary.byStatus[booking.status] || 0) + 1;
      
      // Add to total amount
      if (booking.item?.price) {
        summary.totalAmount += booking.item.price;
      }
    });

    return summary;
  }
}

module.exports = new EMTInventoryService();
