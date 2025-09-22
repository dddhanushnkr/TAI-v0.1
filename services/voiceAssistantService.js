const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

/**
 * Voice Assistant Service for hands-free trip planning
 */
class VoiceAssistantService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'demo-key');
    
    // Voice commands mapping
    this.voiceCommands = {
      'plan_trip': {
        keywords: ['plan trip', 'create itinerary', 'plan vacation', 'trip planning'],
        action: 'generateItinerary',
        description: 'Start planning a new trip'
      },
      'modify_itinerary': {
        keywords: ['modify', 'change', 'update', 'edit itinerary'],
        action: 'modifyItinerary',
        description: 'Modify existing itinerary'
      },
      'weather_check': {
        keywords: ['weather', 'forecast', 'temperature', 'rain'],
        action: 'checkWeather',
        description: 'Check weather for destination'
      },
      'find_places': {
        keywords: ['find', 'search', 'nearby', 'places', 'restaurants'],
        action: 'searchPlaces',
        description: 'Search for places and attractions'
      },
      'book_activity': {
        keywords: ['book', 'reserve', 'buy tickets', 'booking'],
        action: 'bookActivity',
        description: 'Book activities and experiences'
      },
      'navigation': {
        keywords: ['navigate', 'directions', 'how to reach', 'route'],
        action: 'getDirections',
        description: 'Get navigation directions'
      },
      'translate': {
        keywords: ['translate', 'what does this mean', 'language'],
        action: 'translateText',
        description: 'Translate text or phrases'
      },
      'emergency': {
        keywords: ['help', 'emergency', 'sos', 'assistance'],
        action: 'emergencyAssistance',
        description: 'Get emergency assistance'
      }
    };

    // Voice responses templates
    this.responseTemplates = {
      greeting: [
        "Hello! I'm your AI travel assistant. How can I help you plan your perfect trip?",
        "Welcome! I'm here to help you create amazing travel experiences. What would you like to do?",
        "Hi there! Ready to explore the world? Tell me about your travel plans."
      ],
      confirmation: [
        "Got it! Let me help you with that.",
        "Perfect! I'll take care of that for you.",
        "Understood. Working on it right away."
      ],
      error: [
        "I'm sorry, I didn't quite catch that. Could you please repeat?",
        "I'm having trouble understanding. Can you try again?",
        "Let me help you with something else. What would you like to do?"
      ]
    };
  }

  /**
   * Process voice command
   */
  async processVoiceCommand(audioData, userId) {
    try {
      // In a real implementation, this would use speech-to-text API
      const transcript = await this.speechToText(audioData);
      
      // Find matching command
      const command = this.findMatchingCommand(transcript);
      
      if (!command) {
        return {
          success: false,
          message: this.getRandomResponse('error'),
          transcript
        };
      }

      // Execute the command
      const result = await this.executeCommand(command, transcript, userId);
      
      return {
        success: true,
        command: command.action,
        result,
        transcript
      };

    } catch (error) {
      console.error('Error processing voice command:', error);
      return {
        success: false,
        message: 'Sorry, I encountered an error. Please try again.',
        error: error.message
      };
    }
  }

  /**
   * Convert speech to text (mock implementation)
   */
  async speechToText(audioData) {
    // In a real implementation, this would use Google Speech-to-Text API
    // For now, return a mock transcript
    return "plan a trip to goa for 3 days";
  }

  /**
   * Find matching command from transcript
   */
  findMatchingCommand(transcript) {
    const lowerTranscript = transcript.toLowerCase();
    
    for (const [commandName, command] of Object.entries(this.voiceCommands)) {
      for (const keyword of command.keywords) {
        if (lowerTranscript.includes(keyword)) {
          return { name: commandName, ...command };
        }
      }
    }
    
    return null;
  }

  /**
   * Execute voice command
   */
  async executeCommand(command, transcript, userId) {
    switch (command.action) {
      case 'generateItinerary':
        return await this.handleTripPlanning(transcript, userId);
      
      case 'modifyItinerary':
        return await this.handleItineraryModification(transcript, userId);
      
      case 'checkWeather':
        return await this.handleWeatherCheck(transcript);
      
      case 'searchPlaces':
        return await this.handlePlaceSearch(transcript);
      
      case 'bookActivity':
        return await this.handleBooking(transcript, userId);
      
      case 'getDirections':
        return await this.handleNavigation(transcript);
      
      case 'translateText':
        return await this.handleTranslation(transcript);
      
      case 'emergencyAssistance':
        return await this.handleEmergency(transcript);
      
      default:
        return { message: 'Command not implemented yet' };
    }
  }

  /**
   * Handle trip planning via voice
   */
  async handleTripPlanning(transcript, userId) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
      Extract trip planning information from this voice command:
      
      Transcript: "${transcript}"
      
      Extract and return in JSON format:
      {
        "destination": "extracted destination",
        "duration": "extracted duration in days",
        "budget": "extracted budget if mentioned",
        "interests": ["extracted interests"],
        "travelStyle": "extracted travel style",
        "groupSize": "extracted group size",
        "startDate": "extracted start date if mentioned",
        "specialRequirements": ["extracted special requirements"]
      }
      
      If any information is not mentioned, use null or empty array.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const extractedData = JSON.parse(response.text());

      return {
        message: `Great! I'll help you plan a ${extractedData.duration}-day trip to ${extractedData.destination}. Let me create a personalized itinerary for you.`,
        extractedData,
        nextStep: 'confirm_details'
      };

    } catch (error) {
      console.error('Error handling trip planning:', error);
      return {
        message: 'I heard you want to plan a trip. Could you tell me your destination and how many days you want to travel?',
        nextStep: 'get_more_info'
      };
    }
  }

  /**
   * Handle itinerary modification via voice
   */
  async handleItineraryModification(transcript, userId) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
      Extract modification request from this voice command:
      
      Transcript: "${transcript}"
      
      Return in JSON format:
      {
        "modificationType": "add/remove/change/reorder",
        "target": "what to modify (activity, accommodation, transportation, etc.)",
        "details": "specific modification details",
        "day": "which day to modify (if applicable)"
      }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const modification = JSON.parse(response.text());

      return {
        message: `I understand you want to ${modification.modificationType} ${modification.target}. Let me help you with that.`,
        modification,
        nextStep: 'apply_modification'
      };

    } catch (error) {
      console.error('Error handling modification:', error);
      return {
        message: 'I heard you want to modify your itinerary. What specific changes would you like to make?',
        nextStep: 'get_modification_details'
      };
    }
  }

  /**
   * Handle weather check via voice
   */
  async handleWeatherCheck(transcript) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
      Extract location and date from this weather request:
      
      Transcript: "${transcript}"
      
      Return in JSON format:
      {
        "location": "extracted location",
        "date": "extracted date (if mentioned, otherwise 'today')",
        "timeframe": "today/tomorrow/this week/specific date"
      }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const weatherRequest = JSON.parse(response.text());

      // Mock weather data
      const weatherData = {
        location: weatherRequest.location,
        temperature: '28°C',
        condition: 'Sunny',
        humidity: '65%',
        windSpeed: '12 km/h',
        forecast: 'Clear skies with light breeze'
      };

      return {
        message: `The weather in ${weatherData.location} is ${weatherData.temperature} and ${weatherData.condition}. ${weatherData.forecast}`,
        weatherData,
        nextStep: 'weather_details'
      };

    } catch (error) {
      console.error('Error handling weather check:', error);
      return {
        message: 'I can help you check the weather. Which location would you like to know about?',
        nextStep: 'get_location'
      };
    }
  }

  /**
   * Handle place search via voice
   */
  async handlePlaceSearch(transcript) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
      Extract search parameters from this place search request:
      
      Transcript: "${transcript}"
      
      Return in JSON format:
      {
        "query": "what to search for",
        "location": "where to search",
        "type": "restaurant/attraction/hotel/activity",
        "filters": ["any filters mentioned"]
      }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const searchParams = JSON.parse(response.text());

      // Mock search results
      const searchResults = [
        {
          name: 'Popular Restaurant',
          type: 'restaurant',
          rating: '4.5',
          distance: '0.5 km',
          description: 'Great local cuisine'
        },
        {
          name: 'Historic Landmark',
          type: 'attraction',
          rating: '4.8',
          distance: '1.2 km',
          description: 'Must-visit historical site'
        }
      ];

      return {
        message: `I found ${searchResults.length} places matching "${searchParams.query}". Here are the top results.`,
        searchResults,
        nextStep: 'show_results'
      };

    } catch (error) {
      console.error('Error handling place search:', error);
      return {
        message: 'I can help you find places. What are you looking for?',
        nextStep: 'get_search_query'
      };
    }
  }

  /**
   * Handle booking via voice
   */
  async handleBooking(transcript, userId) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
      Extract booking information from this voice command:
      
      Transcript: "${transcript}"
      
      Return in JSON format:
      {
        "item": "what to book (hotel/activity/restaurant/transport)",
        "name": "specific name if mentioned",
        "date": "booking date",
        "time": "booking time if mentioned",
        "quantity": "number of people/tickets"
      }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const bookingInfo = JSON.parse(response.text());

      return {
        message: `I'll help you book ${bookingInfo.item}. Let me check availability and pricing for you.`,
        bookingInfo,
        nextStep: 'confirm_booking'
      };

    } catch (error) {
      console.error('Error handling booking:', error);
      return {
        message: 'I can help you make bookings. What would you like to book?',
        nextStep: 'get_booking_details'
      };
    }
  }

  /**
   * Handle navigation via voice
   */
  async handleNavigation(transcript) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
      Extract navigation information from this voice command:
      
      Transcript: "${transcript}"
      
      Return in JSON format:
      {
        "origin": "starting location",
        "destination": "destination location",
        "mode": "driving/walking/public transport",
        "preferences": ["any route preferences"]
      }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const navInfo = JSON.parse(response.text());

      // Mock navigation data
      const navigationData = {
        origin: navInfo.origin,
        destination: navInfo.destination,
        distance: '5.2 km',
        duration: '15 minutes',
        mode: navInfo.mode,
        steps: [
          'Head north on Main Street',
          'Turn right at the traffic light',
          'Continue for 2 km',
          'Arrive at destination'
        ]
      };

      return {
        message: `I'll guide you from ${navInfo.origin} to ${navInfo.destination}. The journey will take about ${navigationData.duration}.`,
        navigationData,
        nextStep: 'start_navigation'
      };

    } catch (error) {
      console.error('Error handling navigation:', error);
      return {
        message: 'I can help you with directions. Where would you like to go?',
        nextStep: 'get_destination'
      };
    }
  }

  /**
   * Handle translation via voice
   */
  async handleTranslation(transcript) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
      Extract translation request from this voice command:
      
      Transcript: "${transcript}"
      
      Return in JSON format:
      {
        "text": "text to translate",
        "targetLanguage": "target language",
        "context": "translation context if mentioned"
      }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const translationRequest = JSON.parse(response.text());

      // Mock translation
      const translation = {
        original: translationRequest.text,
        translated: 'Translated text in target language',
        language: translationRequest.targetLanguage,
        pronunciation: 'Pronunciation guide'
      };

      return {
        message: `"${translation.original}" translates to "${translation.translated}" in ${translation.language}.`,
        translation,
        nextStep: 'show_translation'
      };

    } catch (error) {
      console.error('Error handling translation:', error);
      return {
        message: 'I can help you translate. What would you like to translate?',
        nextStep: 'get_translation_text'
      };
    }
  }

  /**
   * Handle emergency assistance via voice
   */
  async handleEmergency(transcript) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
      Extract emergency information from this voice command:
      
      Transcript: "${transcript}"
      
      Return in JSON format:
      {
        "emergencyType": "medical/police/fire/other",
        "location": "current location if mentioned",
        "description": "description of emergency",
        "urgency": "high/medium/low"
      }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const emergencyInfo = JSON.parse(response.text());

      const emergencyContacts = {
        police: '100',
        medical: '108',
        fire: '101',
        general: '112'
      };

      return {
        message: `I understand you need ${emergencyInfo.emergencyType} assistance. I'm connecting you to the appropriate emergency services.`,
        emergencyInfo,
        contacts: emergencyContacts,
        nextStep: 'connect_emergency'
      };

    } catch (error) {
      console.error('Error handling emergency:', error);
      return {
        message: 'I understand you need emergency assistance. I\'m here to help. What type of emergency are you experiencing?',
        nextStep: 'get_emergency_details'
      };
    }
  }

  /**
   * Generate voice response
   */
  generateVoiceResponse(responseData) {
    const { message, nextStep, data } = responseData;
    
    return {
      text: message,
      audio: this.textToSpeech(message),
      nextStep,
      data,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Convert text to speech (mock implementation)
   */
  textToSpeech(text) {
    // In a real implementation, this would use Google Text-to-Speech API
    return {
      audioUrl: `https://api.example.com/tts?text=${encodeURIComponent(text)}`,
      duration: text.length * 0.1, // Rough estimate
      format: 'mp3'
    };
  }

  /**
   * Get random response from template
   */
  getRandomResponse(template) {
    const responses = this.responseTemplates[template];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Get available voice commands
   */
  getAvailableCommands() {
    return Object.entries(this.voiceCommands).map(([name, command]) => ({
      name,
      keywords: command.keywords,
      description: command.description
    }));
  }

  /**
   * Get voice assistant status
   */
  getStatus() {
    return {
      active: true,
      language: 'en',
      supportedCommands: Object.keys(this.voiceCommands).length,
      lastActivity: new Date().toISOString()
    };
  }
}

module.exports = new VoiceAssistantService();
