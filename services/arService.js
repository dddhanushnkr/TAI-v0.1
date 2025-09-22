const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

/**
 * AR Service for immersive travel experiences
 */
class ARService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'demo-key');
    
    // AR landmarks data for Indian cities
    this.arLandmarks = {
      'Mumbai': [
        {
          name: 'Gateway of India',
          coordinates: { lat: 18.9220, lng: 72.8347 },
          arFeatures: ['Historical overlay', '360° view', 'Photo spots'],
          historicalPeriod: 'British Raj (1911)',
          culturalSignificance: 'Symbol of Mumbai and India\'s independence'
        },
        {
          name: 'Chhatrapati Shivaji Terminus',
          coordinates: { lat: 18.9398, lng: 72.8355 },
          arFeatures: ['Architectural details', 'Historical timeline', 'Virtual tour'],
          historicalPeriod: 'Victorian Gothic (1887)',
          culturalSignificance: 'UNESCO World Heritage Site'
        }
      ],
      'Delhi': [
        {
          name: 'Red Fort',
          coordinates: { lat: 28.6562, lng: 77.2410 },
          arFeatures: ['Mughal architecture overlay', 'Historical reenactment', 'Sound effects'],
          historicalPeriod: 'Mughal Empire (1639)',
          culturalSignificance: 'Symbol of Mughal power and Indian independence'
        },
        {
          name: 'India Gate',
          coordinates: { lat: 28.6129, lng: 77.2295 },
          arFeatures: ['War memorial details', 'Flame animation', 'Historical photos'],
          historicalPeriod: 'British Raj (1931)',
          culturalSignificance: 'Memorial to Indian soldiers'
        }
      ],
      'Bangalore': [
        {
          name: 'Vidhana Soudha',
          coordinates: { lat: 12.9791, lng: 77.5913 },
          arFeatures: ['Architectural analysis', 'Government building info', 'Light show'],
          historicalPeriod: 'Modern India (1956)',
          culturalSignificance: 'Seat of Karnataka state legislature'
        }
      ],
      'Chennai': [
        {
          name: 'Kapaleeshwarar Temple',
          coordinates: { lat: 13.0330, lng: 80.2697 },
          arFeatures: ['Temple architecture', 'Religious significance', 'Cultural stories'],
          historicalPeriod: 'Chola Dynasty (7th century)',
          culturalSignificance: 'Important Hindu temple'
        }
      ]
    };

    // AR experiences by category
    this.arExperiences = {
      'historical': {
        name: 'Historical Reenactment',
        description: 'Experience historical events through AR',
        features: ['3D historical figures', 'Period-accurate environments', 'Interactive timeline']
      },
      'cultural': {
        name: 'Cultural Immersion',
        description: 'Learn about local culture through AR',
        features: ['Traditional dance tutorials', 'Cultural artifact exploration', 'Language learning']
      },
      'culinary': {
        name: 'Culinary Journey',
        description: 'Explore food culture through AR',
        features: ['Recipe demonstrations', 'Ingredient identification', 'Restaurant recommendations']
      },
      'nature': {
        name: 'Nature Exploration',
        description: 'Discover natural wonders through AR',
        features: ['Wildlife identification', 'Geological information', 'Ecosystem education']
      }
    };
  }

  /**
   * Generate AR content for a landmark
   */
  async generateARContent(landmark, destination) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
      Create comprehensive AR content for ${landmark} in ${destination}:
      
      Provide:
      1. Historical information and timeline
      2. Cultural significance and stories
      3. Interactive AR elements
      4. Photo opportunities and angles
      5. Local legends and myths
      6. Best times for AR exploration
      7. Accessibility information
      8. Nearby attractions
      9. AR overlay information
      10. Social sharing moments
      
      Format as JSON:
      {
        "landmark": "${landmark}",
        "destination": "${destination}",
        "arContent": {
          "historicalInfo": "Detailed historical background",
          "culturalSignificance": "Cultural importance and stories",
          "interactiveElements": ["AR features available"],
          "photoSpots": ["Best photo locations and angles"],
          "localLegends": ["Local stories and myths"],
          "bestTimes": "Optimal times for AR exploration",
          "accessibility": "Accessibility information",
          "nearbyAttractions": ["Nearby points of interest"],
          "arOverlay": "AR overlay information",
          "socialMoments": ["Instagram-worthy AR moments"]
        },
        "arFeatures": {
          "historicalTimeline": "Interactive historical timeline",
          "3dModels": "3D models and reconstructions",
          "audioGuide": "Audio narration and sound effects",
          "photoFilters": "AR photo filters and effects",
          "gamification": "AR games and challenges"
        }
      }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const contentText = response.text();

      try {
        const jsonMatch = contentText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Error parsing AR content:', parseError);
      }

      return this.getFallbackARContent(landmark, destination);

    } catch (error) {
      console.error('Error generating AR content:', error);
      return this.getFallbackARContent(landmark, destination);
    }
  }

  /**
   * Get AR landmarks for a destination
   */
  getARLandmarks(destination) {
    return this.arLandmarks[destination] || [];
  }

  /**
   * Generate AR experience recommendations
   */
  async generateARExperiences(itinerary, userInterests) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
      Recommend AR experiences for this itinerary based on user interests:
      
      Itinerary: ${JSON.stringify(itinerary.itinerary.days.slice(0, 3))}
      User Interests: ${userInterests.join(', ')}
      
      Provide:
      1. AR experiences for each day
      2. Landmark-specific AR content
      3. Interactive activities
      4. Photo opportunities
      5. Educational content
      6. Social sharing moments
      
      Format as JSON with daily AR recommendations.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const experiencesText = response.text();

      try {
        const jsonMatch = experiencesText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Error parsing AR experiences:', parseError);
      }

      return this.getFallbackARExperiences(itinerary);

    } catch (error) {
      console.error('Error generating AR experiences:', error);
      return this.getFallbackARExperiences(itinerary);
    }
  }

  /**
   * Generate AR photo filters
   */
  async generateARPhotoFilters(landmark, destination) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
      Create AR photo filter suggestions for ${landmark} in ${destination}:
      
      Include:
      1. Historical period filters
      2. Cultural theme filters
      3. Weather-based filters
      4. Time-of-day filters
      5. Special effect filters
      6. Social media ready filters
      
      Format as JSON with filter details.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const filtersText = response.text();

      try {
        const jsonMatch = filtersText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Error parsing AR photo filters:', parseError);
      }

      return this.getFallbackPhotoFilters(landmark);

    } catch (error) {
      console.error('Error generating AR photo filters:', error);
      return this.getFallbackPhotoFilters(landmark);
    }
  }

  /**
   * Generate AR games and challenges
   */
  async generateARGames(itinerary) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
      Create AR games and challenges for this travel itinerary:
      
      Itinerary: ${JSON.stringify(itinerary.itinerary.days.slice(0, 3))}
      
      Include:
      1. Scavenger hunts
      2. Photo challenges
      3. Cultural quizzes
      4. Historical puzzles
      5. Social challenges
      6. Educational games
      
      Format as JSON with game details and rewards.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const gamesText = response.text();

      try {
        const jsonMatch = gamesText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Error parsing AR games:', parseError);
      }

      return this.getFallbackARGames();

    } catch (error) {
      console.error('Error generating AR games:', error);
      return this.getFallbackARGames();
    }
  }

  /**
   * Generate AR social sharing content
   */
  async generateARSocialContent(landmark, destination) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
      Create AR social sharing content for ${landmark} in ${destination}:
      
      Include:
      1. Instagram story templates
      2. TikTok video ideas
      3. Facebook post suggestions
      4. Twitter moment ideas
      5. Hashtag recommendations
      6. Caption templates
      
      Format as JSON with platform-specific content.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const socialText = response.text();

      try {
        const jsonMatch = socialText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Error parsing AR social content:', parseError);
      }

      return this.getFallbackSocialContent(landmark);

    } catch (error) {
      console.error('Error generating AR social content:', error);
      return this.getFallbackSocialContent(landmark);
    }
  }

  /**
   * Get AR accessibility features
   */
  getARAccessibilityFeatures() {
    return {
      visual: [
        'High contrast mode',
        'Large text options',
        'Color blind friendly filters',
        'Audio descriptions'
      ],
      auditory: [
        'Visual sound indicators',
        'Subtitles for audio content',
        'Haptic feedback',
        'Sign language support'
      ],
      motor: [
        'Voice commands',
        'Gesture recognition',
        'One-handed operation',
        'Switch control support'
      ],
      cognitive: [
        'Simplified interfaces',
        'Step-by-step guidance',
        'Pause and resume features',
        'Clear instructions'
      ]
    };
  }

  /**
   * Generate AR navigation assistance
   */
  async generateARNavigation(origin, destination, landmarks) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
      Create AR navigation assistance from ${origin} to ${destination}:
      
      Landmarks to highlight: ${landmarks.join(', ')}
      
      Include:
      1. AR waypoint markers
      2. Distance indicators
      3. Landmark information
      4. Alternative routes
      5. Safety tips
      6. Photo opportunities along the way
      
      Format as JSON with navigation details.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const navigationText = response.text();

      try {
        const jsonMatch = navigationText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Error parsing AR navigation:', parseError);
      }

      return this.getFallbackARNavigation(origin, destination);

    } catch (error) {
      console.error('Error generating AR navigation:', error);
      return this.getFallbackARNavigation(origin, destination);
    }
  }

  /**
   * Helper functions for fallback data
   */
  getFallbackARContent(landmark, destination) {
    return {
      landmark,
      destination,
      arContent: {
        historicalInfo: `Historical information about ${landmark}`,
        culturalSignificance: `Cultural importance of ${landmark}`,
        interactiveElements: ['Basic AR overlay', 'Photo opportunities'],
        photoSpots: ['Main entrance', 'Best viewing angle'],
        localLegends: [`Local stories about ${landmark}`],
        bestTimes: 'Early morning or late afternoon',
        accessibility: 'Check with venue for accessibility details',
        nearbyAttractions: ['Nearby points of interest'],
        arOverlay: 'Basic landmark information',
        socialMoments: ['Instagram-worthy spots']
      },
      arFeatures: {
        historicalTimeline: 'Interactive timeline available',
        '3dModels': '3D models of the landmark',
        audioGuide: 'Audio narration available',
        photoFilters: 'Historical period filters',
        gamification: 'AR scavenger hunt available'
      }
    };
  }

  getFallbackARExperiences(itinerary) {
    return {
      experiences: [
        {
          day: 1,
          arActivities: [
            'Historical landmark exploration',
            'Cultural photo challenges',
            'Local cuisine AR guide'
          ]
        }
      ]
    };
  }

  getFallbackPhotoFilters(landmark) {
    return {
      filters: [
        {
          name: 'Historical',
          description: 'Transport yourself to the historical period',
          effects: ['Sepia tone', 'Vintage frame', 'Historical overlay']
        },
        {
          name: 'Cultural',
          description: 'Celebrate local culture',
          effects: ['Traditional patterns', 'Cultural colors', 'Local motifs']
        }
      ]
    };
  }

  getFallbackARGames() {
    return {
      games: [
        {
          name: 'Landmark Scavenger Hunt',
          description: 'Find and photograph specific architectural details',
          rewards: ['Badges', 'Points', 'Social recognition']
        },
        {
          name: 'Cultural Quiz',
          description: 'Answer questions about local culture and history',
          rewards: ['Knowledge points', 'Achievement badges']
        }
      ]
    };
  }

  getFallbackSocialContent(landmark) {
    return {
      instagram: {
        storyTemplate: `Exploring ${landmark} with AR! #travel #ar #${landmark.toLowerCase().replace(/\s+/g, '')}`,
        hashtags: ['#travel', '#ar', '#explore', '#india']
      },
      tiktok: {
        videoIdea: `AR tour of ${landmark} - before and after`,
        hashtags: ['#travel', '#ar', '#tiktok']
      }
    };
  }

  getFallbackARNavigation(origin, destination) {
    return {
      route: `${origin} to ${destination}`,
      waypoints: ['Key landmarks along the route'],
      arMarkers: ['AR direction arrows', 'Distance indicators'],
      safetyTips: ['Stay aware of surroundings', 'Keep device charged']
    };
  }
}

module.exports = new ARService();
