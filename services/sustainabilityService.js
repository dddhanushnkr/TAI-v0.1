const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

/**
 * Sustainability Service for eco-friendly travel tracking
 */
class SustainabilityService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'demo-key');
    
    // Carbon footprint factors (kg CO2 per km per person)
    this.carbonFactors = {
      flight: 0.285,
      train: 0.041,
      bus: 0.089,
      car: 0.192,
      metro: 0.041,
      walking: 0,
      cycling: 0,
      auto: 0.089,
      taxi: 0.192
    };

    // Eco-friendly accommodation ratings
    this.ecoAccommodations = {
      'eco_lodge': { rating: 9, features: ['Solar power', 'Water conservation', 'Local materials'] },
      'green_hotel': { rating: 7, features: ['Energy efficient', 'Waste reduction', 'Local sourcing'] },
      'sustainable_hostel': { rating: 6, features: ['Shared facilities', 'Local community support'] },
      'regular_hotel': { rating: 3, features: ['Standard amenities'] },
      'luxury_hotel': { rating: 2, features: ['High resource usage'] }
    };

    // Sustainable activity categories
    this.sustainableActivities = {
      'nature_walk': { impact: 'positive', carbonOffset: 0.1 },
      'local_cooking_class': { impact: 'positive', carbonOffset: 0.05 },
      'cultural_museum': { impact: 'neutral', carbonOffset: 0 },
      'eco_tour': { impact: 'positive', carbonOffset: 0.2 },
      'volunteer_work': { impact: 'positive', carbonOffset: 0.3 },
      'shopping_mall': { impact: 'negative', carbonOffset: -0.1 },
      'theme_park': { impact: 'negative', carbonOffset: -0.2 }
    };

    // Local impact metrics
    this.localImpactFactors = {
      'local_businesses': { multiplier: 1.5, description: 'Supporting local economy' },
      'street_food': { multiplier: 1.2, description: 'Local food culture' },
      'public_transport': { multiplier: 1.3, description: 'Reducing traffic congestion' },
      'cultural_sites': { multiplier: 1.1, description: 'Preserving heritage' },
      'eco_activities': { multiplier: 1.4, description: 'Environmental awareness' }
    };
  }

  /**
   * Calculate carbon footprint for itinerary
   */
  async calculateCarbonFootprint(itinerary) {
    try {
      let totalCarbon = 0;
      const breakdown = {
        transportation: 0,
        accommodation: 0,
        activities: 0,
        food: 0
      };

      // Calculate transportation carbon
      if (itinerary.itinerary?.days) {
        for (const day of itinerary.itinerary.days) {
          if (day.transportation) {
            const transportCarbon = this.calculateTransportCarbon(day.transportation);
            breakdown.transportation += transportCarbon;
            totalCarbon += transportCarbon;
          }

          // Calculate activity carbon
          if (day.activities) {
            for (const activity of day.activities) {
              const activityCarbon = this.calculateActivityCarbon(activity);
              breakdown.activities += activityCarbon;
              totalCarbon += activityCarbon;
            }
          }
        }
      }

      // Calculate accommodation carbon
      if (itinerary.bookingInfo?.accommodations) {
        for (const accommodation of itinerary.bookingInfo.accommodations) {
          const accommodationCarbon = this.calculateAccommodationCarbon(accommodation);
          breakdown.accommodation += accommodationCarbon;
          totalCarbon += accommodationCarbon;
        }
      }

      // Calculate food carbon (estimated)
      breakdown.food = this.calculateFoodCarbon(itinerary);

      return {
        totalCarbon: Math.round(totalCarbon * 100) / 100,
        breakdown,
        rating: this.getCarbonRating(totalCarbon),
        recommendations: await this.generateCarbonReductionTips(totalCarbon, breakdown)
      };

    } catch (error) {
      console.error('Error calculating carbon footprint:', error);
      return this.getFallbackCarbonFootprint();
    }
  }

  /**
   * Calculate transportation carbon
   */
  calculateTransportCarbon(transportation) {
    const mode = transportation.mode?.toLowerCase() || 'car';
    const distance = this.extractDistance(transportation.distance) || 10; // Default 10km
    const passengers = transportation.passengers || 1;
    
    const factor = this.carbonFactors[mode] || this.carbonFactors.car;
    return distance * factor * passengers;
  }

  /**
   * Calculate activity carbon
   */
  calculateActivityCarbon(activity) {
    const category = this.categorizeActivity(activity.activity);
    const sustainableActivity = this.sustainableActivities[category];
    
    if (sustainableActivity) {
      return sustainableActivity.carbonOffset || 0;
    }
    
    return 0; // Neutral impact for unlisted activities
  }

  /**
   * Calculate accommodation carbon
   */
  calculateAccommodationCarbon(accommodation) {
    const type = accommodation.type?.toLowerCase() || 'regular_hotel';
    const ecoAccommodation = this.ecoAccommodations[type];
    
    if (ecoAccommodation) {
      // Lower rating = higher carbon footprint
      return (10 - ecoAccommodation.rating) * 0.5;
    }
    
    return 2; // Default carbon footprint
  }

  /**
   * Calculate food carbon
   */
  calculateFoodCarbon(itinerary) {
    // Estimate based on meal types and local sourcing
    let foodCarbon = 0;
    
    if (itinerary.itinerary?.days) {
      for (const day of itinerary.itinerary.days) {
        if (day.meals) {
          for (const meal of day.meals) {
            // Local food has lower carbon footprint
            if (meal.cuisine?.toLowerCase().includes('local')) {
              foodCarbon += 0.5;
            } else {
              foodCarbon += 1.0;
            }
          }
        }
      }
    }
    
    return foodCarbon;
  }

  /**
   * Get carbon rating
   */
  getCarbonRating(totalCarbon) {
    if (totalCarbon < 50) return { level: 'excellent', color: 'green', message: 'Very eco-friendly trip!' };
    if (totalCarbon < 100) return { level: 'good', color: 'blue', message: 'Good environmental impact' };
    if (totalCarbon < 200) return { level: 'moderate', color: 'yellow', message: 'Moderate environmental impact' };
    if (totalCarbon < 300) return { level: 'high', color: 'orange', message: 'High environmental impact' };
    return { level: 'very_high', color: 'red', message: 'Very high environmental impact' };
  }

  /**
   * Generate carbon reduction tips
   */
  async generateCarbonReductionTips(totalCarbon, breakdown) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
      Generate personalized carbon reduction tips for this travel itinerary:
      
      Total Carbon: ${totalCarbon} kg CO2
      Breakdown: ${JSON.stringify(breakdown)}
      
      Provide 5-7 specific, actionable tips to reduce carbon footprint, focusing on:
      1. Transportation alternatives
      2. Accommodation choices
      3. Activity selections
      4. Food choices
      5. General eco-friendly practices
      
      Format as JSON array with tip objects containing:
      - category: "transportation/accommodation/activities/food/general"
      - tip: "specific actionable advice"
      - impact: "estimated carbon reduction"
      - difficulty: "easy/medium/hard"
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const tipsText = response.text();

      try {
        const jsonMatch = tipsText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Error parsing carbon reduction tips:', parseError);
      }

      return this.getFallbackCarbonTips();

    } catch (error) {
      console.error('Error generating carbon reduction tips:', error);
      return this.getFallbackCarbonTips();
    }
  }

  /**
   * Calculate local impact score
   */
  calculateLocalImpact(itinerary) {
    let impactScore = 0;
    let maxScore = 0;
    const factors = [];

    if (itinerary.itinerary?.days) {
      for (const day of itinerary.itinerary.days) {
        // Check for local business support
        if (day.activities) {
          for (const activity of day.activities) {
            if (this.isLocalBusiness(activity)) {
              const factor = this.localImpactFactors.local_businesses;
              impactScore += factor.multiplier;
              maxScore += 1;
              factors.push(factor.description);
            }
          }
        }

        // Check for street food/local cuisine
        if (day.meals) {
          for (const meal of day.meals) {
            if (this.isLocalFood(meal)) {
              const factor = this.localImpactFactors.street_food;
              impactScore += factor.multiplier;
              maxScore += 1;
              factors.push(factor.description);
            }
          }
        }

        // Check for public transport usage
        if (day.transportation?.mode === 'metro' || day.transportation?.mode === 'bus') {
          const factor = this.localImpactFactors.public_transport;
          impactScore += factor.multiplier;
          maxScore += 1;
          factors.push(factor.description);
        }

        // Check for cultural sites
        if (day.activities) {
          for (const activity of day.activities) {
            if (this.isCulturalSite(activity)) {
              const factor = this.localImpactFactors.cultural_sites;
              impactScore += factor.multiplier;
              maxScore += 1;
              factors.push(factor.description);
            }
          }
        }
      }
    }

    const score = maxScore > 0 ? (impactScore / maxScore) * 100 : 0;
    
    return {
      score: Math.round(score),
      rating: this.getImpactRating(score),
      factors: [...new Set(factors)], // Remove duplicates
      recommendations: this.generateLocalImpactRecommendations(score)
    };
  }

  /**
   * Check if activity supports local business
   */
  isLocalBusiness(activity) {
    const localKeywords = ['local', 'traditional', 'artisan', 'handmade', 'family-owned', 'small business'];
    const activityText = (activity.activity + ' ' + (activity.description || '')).toLowerCase();
    
    return localKeywords.some(keyword => activityText.includes(keyword));
  }

  /**
   * Check if meal is local food
   */
  isLocalFood(meal) {
    const localKeywords = ['local', 'traditional', 'street food', 'home-cooked', 'regional'];
    const mealText = (meal.cuisine + ' ' + (meal.restaurant || '')).toLowerCase();
    
    return localKeywords.some(keyword => mealText.includes(keyword));
  }

  /**
   * Check if activity is cultural site
   */
  isCulturalSite(activity) {
    const culturalKeywords = ['temple', 'museum', 'heritage', 'monument', 'cultural', 'historical', 'art gallery'];
    const activityText = (activity.activity + ' ' + (activity.description || '')).toLowerCase();
    
    return culturalKeywords.some(keyword => activityText.includes(keyword));
  }

  /**
   * Get impact rating
   */
  getImpactRating(score) {
    if (score >= 80) return { level: 'excellent', color: 'green', message: 'Excellent local impact!' };
    if (score >= 60) return { level: 'good', color: 'blue', message: 'Good local community support' };
    if (score >= 40) return { level: 'moderate', color: 'yellow', message: 'Moderate local impact' };
    if (score >= 20) return { level: 'low', color: 'orange', message: 'Low local impact' };
    return { level: 'very_low', color: 'red', message: 'Very low local impact' };
  }

  /**
   * Generate local impact recommendations
   */
  generateLocalImpactRecommendations(score) {
    const recommendations = [];

    if (score < 40) {
      recommendations.push('Try more local restaurants and street food');
      recommendations.push('Visit local markets and artisan shops');
      recommendations.push('Use public transportation instead of private vehicles');
      recommendations.push('Participate in cultural activities and festivals');
    }

    if (score < 60) {
      recommendations.push('Stay in locally-owned accommodations');
      recommendations.push('Book tours with local guides');
      recommendations.push('Buy souvenirs from local artisans');
    }

    if (score < 80) {
      recommendations.push('Volunteer with local community projects');
      recommendations.push('Learn about local customs and traditions');
      recommendations.push('Support local environmental initiatives');
    }

    return recommendations;
  }

  /**
   * Generate sustainability report
   */
  async generateSustainabilityReport(itinerary) {
    try {
      const carbonFootprint = await this.calculateCarbonFootprint(itinerary);
      const localImpact = this.calculateLocalImpact(itinerary);
      
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
      Generate a comprehensive sustainability report for this travel itinerary:
      
      Carbon Footprint: ${carbonFootprint.totalCarbon} kg CO2
      Local Impact Score: ${localImpact.score}/100
      
      Itinerary: ${JSON.stringify(itinerary.itinerary?.days?.slice(0, 3))}
      
      Provide:
      1. Overall sustainability assessment
      2. Environmental impact analysis
      3. Social and economic impact
      4. Specific recommendations for improvement
      5. Eco-friendly alternatives
      6. Long-term sustainability goals
      
      Format as JSON with detailed analysis and actionable recommendations.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const reportText = response.text();

      try {
        const jsonMatch = reportText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const aiReport = JSON.parse(jsonMatch[0]);
          return {
            ...aiReport,
            carbonFootprint,
            localImpact,
            generatedAt: new Date().toISOString()
          };
        }
      } catch (parseError) {
        console.error('Error parsing sustainability report:', parseError);
      }

      return this.getFallbackSustainabilityReport(carbonFootprint, localImpact);

    } catch (error) {
      console.error('Error generating sustainability report:', error);
      return this.getFallbackSustainabilityReport();
    }
  }

  /**
   * Get eco-friendly alternatives
   */
  async getEcoFriendlyAlternatives(itinerary) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
      Suggest eco-friendly alternatives for this travel itinerary:
      
      Itinerary: ${JSON.stringify(itinerary.itinerary?.days?.slice(0, 3))}
      
      Provide alternatives for:
      1. Transportation methods
      2. Accommodation options
      3. Activities and experiences
      4. Food and dining choices
      5. Shopping and souvenirs
      
      Format as JSON with specific alternatives and their environmental benefits.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const alternativesText = response.text();

      try {
        const jsonMatch = alternativesText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Error parsing eco-friendly alternatives:', parseError);
      }

      return this.getFallbackAlternatives();

    } catch (error) {
      console.error('Error generating eco-friendly alternatives:', error);
      return this.getFallbackAlternatives();
    }
  }

  /**
   * Track sustainability progress
   */
  trackProgress(userId, itinerary) {
    // This would integrate with a database to track user's sustainability progress
    return {
      userId,
      tripId: itinerary.id,
      carbonSaved: this.calculateCarbonSaved(itinerary),
      localBusinessesSupported: this.countLocalBusinesses(itinerary),
      ecoActivitiesCompleted: this.countEcoActivities(itinerary),
      sustainabilityScore: this.calculateOverallScore(itinerary),
      achievements: this.getAchievements(itinerary),
      nextGoals: this.getNextGoals(itinerary)
    };
  }

  /**
   * Helper functions
   */
  extractDistance(distanceString) {
    if (!distanceString) return 0;
    const match = distanceString.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 0;
  }

  categorizeActivity(activityName) {
    const activity = activityName.toLowerCase();
    
    if (activity.includes('walk') || activity.includes('hike')) return 'nature_walk';
    if (activity.includes('cook') || activity.includes('food')) return 'local_cooking_class';
    if (activity.includes('museum') || activity.includes('gallery')) return 'cultural_museum';
    if (activity.includes('eco') || activity.includes('nature')) return 'eco_tour';
    if (activity.includes('volunteer') || activity.includes('help')) return 'volunteer_work';
    if (activity.includes('shop') || activity.includes('mall')) return 'shopping_mall';
    if (activity.includes('theme') || activity.includes('park')) return 'theme_park';
    
    return 'cultural_museum'; // Default neutral impact
  }

  calculateCarbonSaved(itinerary) {
    // Calculate carbon saved compared to a high-impact trip
    const highImpactCarbon = 300; // kg CO2 for high-impact trip
    const actualCarbon = this.calculateCarbonFootprint(itinerary).totalCarbon;
    return Math.max(0, highImpactCarbon - actualCarbon);
  }

  countLocalBusinesses(itinerary) {
    let count = 0;
    if (itinerary.itinerary?.days) {
      for (const day of itinerary.itinerary.days) {
        if (day.activities) {
          count += day.activities.filter(activity => this.isLocalBusiness(activity)).length;
        }
      }
    }
    return count;
  }

  countEcoActivities(itinerary) {
    let count = 0;
    if (itinerary.itinerary?.days) {
      for (const day of itinerary.itinerary.days) {
        if (day.activities) {
          count += day.activities.filter(activity => 
            this.sustainableActivities[this.categorizeActivity(activity.activity)]?.impact === 'positive'
          ).length;
        }
      }
    }
    return count;
  }

  calculateOverallScore(itinerary) {
    const carbonFootprint = this.calculateCarbonFootprint(itinerary);
    const localImpact = this.calculateLocalImpact(itinerary);
    
    // Weighted score: 60% carbon footprint, 40% local impact
    const carbonScore = Math.max(0, 100 - (carbonFootprint.totalCarbon / 3));
    const impactScore = localImpact.score;
    
    return Math.round((carbonScore * 0.6) + (impactScore * 0.4));
  }

  getAchievements(itinerary) {
    const achievements = [];
    const score = this.calculateOverallScore(itinerary);
    
    if (score >= 90) achievements.push('Sustainability Champion');
    if (score >= 80) achievements.push('Eco Warrior');
    if (score >= 70) achievements.push('Green Traveler');
    if (this.countEcoActivities(itinerary) >= 5) achievements.push('Eco Explorer');
    if (this.countLocalBusinesses(itinerary) >= 10) achievements.push('Local Supporter');
    
    return achievements;
  }

  getNextGoals(itinerary) {
    const goals = [];
    const score = this.calculateOverallScore(itinerary);
    
    if (score < 70) goals.push('Increase eco-friendly activities');
    if (this.countLocalBusinesses(itinerary) < 5) goals.push('Support more local businesses');
    if (this.calculateCarbonFootprint(itinerary).totalCarbon > 100) goals.push('Reduce carbon footprint');
    
    return goals;
  }

  /**
   * Fallback functions
   */
  getFallbackCarbonFootprint() {
    return {
      totalCarbon: 150,
      breakdown: { transportation: 100, accommodation: 30, activities: 15, food: 5 },
      rating: { level: 'moderate', color: 'yellow', message: 'Moderate environmental impact' },
      recommendations: this.getFallbackCarbonTips()
    };
  }

  getFallbackCarbonTips() {
    return [
      {
        category: 'transportation',
        tip: 'Use public transportation instead of private vehicles',
        impact: 'Reduce carbon by 50-70%',
        difficulty: 'easy'
      },
      {
        category: 'accommodation',
        tip: 'Choose eco-friendly accommodations with green certifications',
        impact: 'Reduce carbon by 20-30%',
        difficulty: 'medium'
      },
      {
        category: 'activities',
        tip: 'Include more nature-based and cultural activities',
        impact: 'Reduce carbon by 10-20%',
        difficulty: 'easy'
      }
    ];
  }

  getFallbackSustainabilityReport() {
    return {
      overallAssessment: 'Moderate sustainability with room for improvement',
      environmentalImpact: 'Average carbon footprint with some eco-friendly choices',
      socialImpact: 'Good local community support',
      recommendations: ['Use more public transport', 'Choose local accommodations', 'Support local businesses'],
      generatedAt: new Date().toISOString()
    };
  }

  getFallbackAlternatives() {
    return {
      transportation: ['Metro/bus instead of taxi', 'Walking/cycling for short distances'],
      accommodation: ['Eco-lodges', 'Green hotels', 'Homestays'],
      activities: ['Nature walks', 'Cultural museums', 'Local cooking classes'],
      food: ['Street food', 'Local restaurants', 'Farm-to-table dining'],
      shopping: ['Local artisan markets', 'Handmade souvenirs', 'Local crafts']
    };
  }
}

module.exports = new SustainabilityService();
