const { GoogleGenerativeAI } = require('@google/generative-ai');
const { db } = require('../config/firebase');

/**
 * Advanced Analytics Service for personalized insights
 */
class AnalyticsService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'demo-key');
    
    // Analytics categories
    this.analyticsCategories = {
      'travel_patterns': 'Travel behavior and preferences analysis',
      'budget_optimization': 'Spending patterns and cost optimization',
      'destination_preferences': 'Location and activity preferences',
      'seasonal_trends': 'Time-based travel patterns',
      'group_dynamics': 'Travel group size and composition analysis',
      'sustainability_metrics': 'Environmental impact tracking',
      'satisfaction_analysis': 'User satisfaction and feedback analysis',
      'recommendation_effectiveness': 'AI recommendation performance'
    };

    // User behavior tracking
    this.behaviorMetrics = {
      'search_frequency': 'How often user searches for trips',
      'booking_conversion': 'Rate of itinerary to booking conversion',
      'modification_rate': 'Frequency of itinerary modifications',
      'completion_rate': 'Rate of completed vs planned trips',
      'satisfaction_score': 'Average user satisfaction rating',
      'repeat_usage': 'Frequency of app usage',
      'feature_adoption': 'Usage of different app features'
    };
  }

  /**
   * Analyze user travel patterns
   */
  async analyzeTravelPatterns(userId) {
    try {
      // Get user's trip history
      const userTrips = await this.getUserTripHistory(userId);
      
      if (userTrips.length === 0) {
        return this.getEmptyAnalysisResult();
      }

      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
      Analyze travel patterns from this user's trip history:
      
      User ID: ${userId}
      Trip History: ${JSON.stringify(userTrips.slice(0, 10))}
      
      Provide comprehensive analysis including:
      1. Preferred destinations and regions
      2. Travel frequency and seasonality
      3. Budget patterns and spending behavior
      4. Group size preferences
      5. Activity and interest patterns
      6. Booking and planning behavior
      7. Satisfaction trends
      8. Predictions for future travel
      
      Format as JSON with detailed insights and recommendations.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysisText = response.text();

      try {
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          
          // Enhance with additional metrics
          const enhancedAnalysis = {
            ...analysis,
            userId,
            totalTrips: userTrips.length,
            analysisDate: new Date().toISOString(),
            confidence: this.calculateAnalysisConfidence(userTrips),
            trends: this.calculateTrends(userTrips),
            recommendations: this.generatePersonalizedRecommendations(analysis, userTrips)
          };

          // Save analysis to database
          await this.saveAnalysis(userId, 'travel_patterns', enhancedAnalysis);
          
          return enhancedAnalysis;
        }
      } catch (parseError) {
        console.error('Error parsing travel patterns analysis:', parseError);
      }

      return this.getFallbackTravelAnalysis(userTrips);

    } catch (error) {
      console.error('Error analyzing travel patterns:', error);
      return this.getFallbackTravelAnalysis();
    }
  }

  /**
   * Analyze budget optimization opportunities
   */
  async analyzeBudgetOptimization(userId) {
    try {
      const userTrips = await this.getUserTripHistory(userId);
      const budgetData = this.extractBudgetData(userTrips);
      
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
      Analyze budget optimization opportunities for this user:
      
      User ID: ${userId}
      Budget Data: ${JSON.stringify(budgetData)}
      
      Provide analysis including:
      1. Spending patterns by category
      2. Cost per day trends
      3. Budget vs actual spending analysis
      4. Seasonal price variations
      5. Cost-saving opportunities
      6. Budget allocation recommendations
      7. Price prediction for future trips
      8. Alternative cost-effective options
      
      Format as JSON with specific recommendations and savings estimates.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysisText = response.text();

      try {
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          
          const enhancedAnalysis = {
            ...analysis,
            userId,
            totalSavings: this.calculatePotentialSavings(analysis),
            budgetEfficiency: this.calculateBudgetEfficiency(budgetData),
            analysisDate: new Date().toISOString()
          };

          await this.saveAnalysis(userId, 'budget_optimization', enhancedAnalysis);
          
          return enhancedAnalysis;
        }
      } catch (parseError) {
        console.error('Error parsing budget analysis:', parseError);
      }

      return this.getFallbackBudgetAnalysis();

    } catch (error) {
      console.error('Error analyzing budget optimization:', error);
      return this.getFallbackBudgetAnalysis();
    }
  }

  /**
   * Analyze destination preferences
   */
  async analyzeDestinationPreferences(userId) {
    try {
      const userTrips = await this.getUserTripHistory(userId);
      const destinationData = this.extractDestinationData(userTrips);
      
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
      Analyze destination preferences for this user:
      
      User ID: ${userId}
      Destination Data: ${JSON.stringify(destinationData)}
      
      Provide analysis including:
      1. Preferred destination types and regions
      2. Activity preferences by destination
      3. Seasonal destination preferences
      4. Budget vs destination correlation
      5. Satisfaction by destination type
      6. Unexplored destination recommendations
      7. Similar destination suggestions
      8. Cultural and geographical patterns
      
      Format as JSON with detailed insights and recommendations.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysisText = response.text();

      try {
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          
          const enhancedAnalysis = {
            ...analysis,
            userId,
            destinationDiversity: this.calculateDestinationDiversity(destinationData),
            explorationScore: this.calculateExplorationScore(destinationData),
            analysisDate: new Date().toISOString()
          };

          await this.saveAnalysis(userId, 'destination_preferences', enhancedAnalysis);
          
          return enhancedAnalysis;
        }
      } catch (parseError) {
        console.error('Error parsing destination analysis:', parseError);
      }

      return this.getFallbackDestinationAnalysis();

    } catch (error) {
      console.error('Error analyzing destination preferences:', error);
      return this.getFallbackDestinationAnalysis();
    }
  }

  /**
   * Analyze seasonal trends
   */
  async analyzeSeasonalTrends(userId) {
    try {
      const userTrips = await this.getUserTripHistory(userId);
      const seasonalData = this.extractSeasonalData(userTrips);
      
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
      Analyze seasonal travel trends for this user:
      
      User ID: ${userId}
      Seasonal Data: ${JSON.stringify(seasonalData)}
      
      Provide analysis including:
      1. Peak travel seasons and months
      2. Seasonal destination preferences
      3. Weather-based travel patterns
      4. Seasonal budget variations
      5. Holiday and festival travel patterns
      6. Off-season opportunities
      7. Seasonal activity preferences
      8. Future seasonal predictions
      
      Format as JSON with seasonal insights and recommendations.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysisText = response.text();

      try {
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          
          const enhancedAnalysis = {
            ...analysis,
            userId,
            seasonalConsistency: this.calculateSeasonalConsistency(seasonalData),
            weatherPreferences: this.analyzeWeatherPreferences(seasonalData),
            analysisDate: new Date().toISOString()
          };

          await this.saveAnalysis(userId, 'seasonal_trends', enhancedAnalysis);
          
          return enhancedAnalysis;
        }
      } catch (parseError) {
        console.error('Error parsing seasonal analysis:', parseError);
      }

      return this.getFallbackSeasonalAnalysis();

    } catch (error) {
      console.error('Error analyzing seasonal trends:', error);
      return this.getFallbackSeasonalAnalysis();
    }
  }

  /**
   * Analyze group dynamics
   */
  async analyzeGroupDynamics(userId) {
    try {
      const userTrips = await this.getUserTripHistory(userId);
      const groupData = this.extractGroupData(userTrips);
      
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
      Analyze group travel dynamics for this user:
      
      User ID: ${userId}
      Group Data: ${JSON.stringify(groupData)}
      
      Provide analysis including:
      1. Preferred group sizes and compositions
      2. Group size vs satisfaction correlation
      3. Activity preferences by group size
      4. Budget implications of group size
      5. Social vs solo travel patterns
      6. Group decision-making patterns
      7. Group activity preferences
      8. Recommendations for group travel
      
      Format as JSON with group dynamics insights.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysisText = response.text();

      try {
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          
          const enhancedAnalysis = {
            ...analysis,
            userId,
            groupPreference: this.calculateGroupPreference(groupData),
            socialScore: this.calculateSocialScore(groupData),
            analysisDate: new Date().toISOString()
          };

          await this.saveAnalysis(userId, 'group_dynamics', enhancedAnalysis);
          
          return enhancedAnalysis;
        }
      } catch (parseError) {
        console.error('Error parsing group dynamics analysis:', parseError);
      }

      return this.getFallbackGroupAnalysis();

    } catch (error) {
      console.error('Error analyzing group dynamics:', error);
      return this.getFallbackGroupAnalysis();
    }
  }

  /**
   * Generate comprehensive user insights
   */
  async generateUserInsights(userId) {
    try {
      // Get all analysis categories
      const analyses = await Promise.all([
        this.analyzeTravelPatterns(userId),
        this.analyzeBudgetOptimization(userId),
        this.analyzeDestinationPreferences(userId),
        this.analyzeSeasonalTrends(userId),
        this.analyzeGroupDynamics(userId)
      ]);

      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
      Generate comprehensive user insights by combining these analyses:
      
      Travel Patterns: ${JSON.stringify(analyses[0])}
      Budget Optimization: ${JSON.stringify(analyses[1])}
      Destination Preferences: ${JSON.stringify(analyses[2])}
      Seasonal Trends: ${JSON.stringify(analyses[3])}
      Group Dynamics: ${JSON.stringify(analyses[4])}
      
      Provide:
      1. Overall user profile summary
      2. Key behavioral patterns
      3. Personalized recommendations
      4. Future travel predictions
      5. Optimization opportunities
      6. Risk factors and considerations
      7. Actionable next steps
      
      Format as JSON with comprehensive insights.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const insightsText = response.text();

      try {
        const jsonMatch = insightsText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const insights = JSON.parse(jsonMatch[0]);
          
          const comprehensiveInsights = {
            ...insights,
            userId,
            analysisDate: new Date().toISOString(),
            confidence: this.calculateOverallConfidence(analyses),
            categories: Object.keys(this.analyticsCategories),
            lastUpdated: new Date().toISOString()
          };

          await this.saveAnalysis(userId, 'comprehensive_insights', comprehensiveInsights);
          
          return comprehensiveInsights;
        }
      } catch (parseError) {
        console.error('Error parsing comprehensive insights:', parseError);
      }

      return this.getFallbackComprehensiveInsights();

    } catch (error) {
      console.error('Error generating comprehensive insights:', error);
      return this.getFallbackComprehensiveInsights();
    }
  }

  /**
   * Track recommendation effectiveness
   */
  async trackRecommendationEffectiveness(userId, recommendationId, action) {
    try {
      const trackingData = {
        userId,
        recommendationId,
        action, // 'viewed', 'clicked', 'booked', 'ignored'
        timestamp: new Date().toISOString(),
        sessionId: this.generateSessionId()
      };

      await db.collection('recommendation_tracking').add(trackingData);
      
      return {
        success: true,
        message: 'Recommendation tracking recorded',
        trackingData
      };

    } catch (error) {
      console.error('Error tracking recommendation effectiveness:', error);
      return {
        success: false,
        message: 'Failed to track recommendation',
        error: error.message
      };
    }
  }

  /**
   * Get user analytics dashboard data
   */
  async getAnalyticsDashboard(userId) {
    try {
      const userInsights = await this.generateUserInsights(userId);
      const recentTrips = await this.getUserTripHistory(userId, 5);
      const recommendationStats = await this.getRecommendationStats(userId);
      const sustainabilityMetrics = await this.getSustainabilityMetrics(userId);
      
      return {
        userInsights,
        recentTrips,
        recommendationStats,
        sustainabilityMetrics,
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error getting analytics dashboard:', error);
      return this.getFallbackDashboard();
    }
  }

  /**
   * Helper functions
   */
  async getUserTripHistory(userId, limit = null) {
    try {
      let query = db.collection('itineraries').where('userId', '==', userId);
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting user trip history:', error);
      return [];
    }
  }

  extractBudgetData(trips) {
    return trips.map(trip => ({
      totalBudget: trip.params?.budget || 0,
      estimatedCost: trip.itinerary?.estimatedCost || 0,
      actualCost: trip.booking?.totalCost || 0,
      duration: trip.params?.duration || 0,
      destination: trip.params?.destination || '',
      date: trip.createdAt
    }));
  }

  extractDestinationData(trips) {
    return trips.map(trip => ({
      destination: trip.params?.destination || '',
      region: this.getRegionFromDestination(trip.params?.destination || ''),
      interests: trip.params?.interests || [],
      satisfaction: trip.feedback?.rating || 0,
      duration: trip.params?.duration || 0,
      budget: trip.params?.budget || 0,
      date: trip.createdAt
    }));
  }

  extractSeasonalData(trips) {
    return trips.map(trip => ({
      month: new Date(trip.createdAt).getMonth(),
      season: this.getSeasonFromDate(trip.createdAt),
      destination: trip.params?.destination || '',
      weather: trip.realTimeData?.weather || null,
      budget: trip.params?.budget || 0,
      satisfaction: trip.feedback?.rating || 0
    }));
  }

  extractGroupData(trips) {
    return trips.map(trip => ({
      groupSize: trip.params?.groupSize || 1,
      travelStyle: trip.params?.travelStyle || 'balanced',
      interests: trip.params?.interests || [],
      budget: trip.params?.budget || 0,
      satisfaction: trip.feedback?.rating || 0,
      activities: trip.itinerary?.days?.flatMap(day => day.activities || []) || []
    }));
  }

  getRegionFromDestination(destination) {
    const regionMap = {
      'Mumbai': 'West',
      'Delhi': 'North',
      'Bangalore': 'South',
      'Chennai': 'South',
      'Kolkata': 'East',
      'Hyderabad': 'South',
      'Pune': 'West',
      'Ahmedabad': 'West',
      'Jaipur': 'North',
      'Goa': 'West'
    };
    return regionMap[destination] || 'Unknown';
  }

  getSeasonFromDate(dateString) {
    const month = new Date(dateString).getMonth();
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Autumn';
    return 'Winter';
  }

  calculateAnalysisConfidence(trips) {
    if (trips.length < 3) return 0.3;
    if (trips.length < 10) return 0.6;
    return 0.9;
  }

  calculateTrends(trips) {
    // Simple trend calculation based on recent vs older trips
    const recentTrips = trips.slice(0, Math.ceil(trips.length / 2));
    const olderTrips = trips.slice(Math.ceil(trips.length / 2));
    
    return {
      budgetTrend: this.calculateTrend(recentTrips, olderTrips, 'budget'),
      durationTrend: this.calculateTrend(recentTrips, olderTrips, 'duration'),
      satisfactionTrend: this.calculateTrend(recentTrips, olderTrips, 'satisfaction')
    };
  }

  calculateTrend(recent, older, field) {
    const recentAvg = recent.reduce((sum, trip) => sum + (trip[field] || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, trip) => sum + (trip[field] || 0), 0) / older.length;
    
    if (olderAvg === 0) return 0;
    return ((recentAvg - olderAvg) / olderAvg) * 100;
  }

  generatePersonalizedRecommendations(analysis, trips) {
    // Generate recommendations based on analysis
    const recommendations = [];
    
    if (analysis.preferredDestinations) {
      recommendations.push({
        type: 'destination',
        title: 'Explore Similar Destinations',
        description: 'Based on your preferences, try these destinations',
        destinations: analysis.preferredDestinations.slice(0, 3)
      });
    }
    
    if (analysis.budgetOptimization) {
      recommendations.push({
        type: 'budget',
        title: 'Budget Optimization',
        description: 'Save money with these tips',
        tips: analysis.budgetOptimization.slice(0, 3)
      });
    }
    
    return recommendations;
  }

  calculatePotentialSavings(analysis) {
    // Calculate potential savings from budget optimization
    return analysis.potentialSavings || 0;
  }

  calculateBudgetEfficiency(budgetData) {
    if (budgetData.length === 0) return 0;
    
    const totalBudget = budgetData.reduce((sum, trip) => sum + trip.totalBudget, 0);
    const totalActual = budgetData.reduce((sum, trip) => sum + trip.actualCost, 0);
    
    if (totalBudget === 0) return 0;
    return ((totalBudget - totalActual) / totalBudget) * 100;
  }

  calculateDestinationDiversity(destinationData) {
    const uniqueDestinations = new Set(destinationData.map(trip => trip.destination));
    return uniqueDestinations.size;
  }

  calculateExplorationScore(destinationData) {
    const uniqueDestinations = new Set(destinationData.map(trip => trip.destination));
    const totalTrips = destinationData.length;
    
    return (uniqueDestinations.size / totalTrips) * 100;
  }

  calculateSeasonalConsistency(seasonalData) {
    const seasonCounts = seasonalData.reduce((counts, trip) => {
      counts[trip.season] = (counts[trip.season] || 0) + 1;
      return counts;
    }, {});
    
    const maxCount = Math.max(...Object.values(seasonCounts));
    const totalTrips = seasonalData.length;
    
    return (maxCount / totalTrips) * 100;
  }

  analyzeWeatherPreferences(seasonalData) {
    const weatherCounts = seasonalData.reduce((counts, trip) => {
      if (trip.weather) {
        const condition = trip.weather.condition || 'unknown';
        counts[condition] = (counts[condition] || 0) + 1;
      }
      return counts;
    }, {});
    
    return weatherCounts;
  }

  calculateGroupPreference(groupData) {
    const groupSizeCounts = groupData.reduce((counts, trip) => {
      counts[trip.groupSize] = (counts[trip.groupSize] || 0) + 1;
      return counts;
    }, {});
    
    return Object.keys(groupSizeCounts).reduce((a, b) => 
      groupSizeCounts[a] > groupSizeCounts[b] ? a : b
    );
  }

  calculateSocialScore(groupData) {
    const soloTrips = groupData.filter(trip => trip.groupSize === 1).length;
    const groupTrips = groupData.length - soloTrips;
    
    return groupTrips > soloTrips ? 'social' : 'solo';
  }

  calculateOverallConfidence(analyses) {
    const confidences = analyses.map(analysis => analysis.confidence || 0.5);
    return confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
  }

  async saveAnalysis(userId, category, analysis) {
    try {
      await db.collection('user_analytics').doc(userId).collection(category).add({
        ...analysis,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving analysis:', error);
    }
  }

  async getRecommendationStats(userId) {
    try {
      const snapshot = await db.collection('recommendation_tracking')
        .where('userId', '==', userId)
        .get();
      
      const stats = {
        total: snapshot.size,
        viewed: 0,
        clicked: 0,
        booked: 0,
        ignored: 0
      };
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        stats[data.action] = (stats[data.action] || 0) + 1;
      });
      
      return stats;
    } catch (error) {
      console.error('Error getting recommendation stats:', error);
      return { total: 0, viewed: 0, clicked: 0, booked: 0, ignored: 0 };
    }
  }

  async getSustainabilityMetrics(userId) {
    try {
      const trips = await this.getUserTripHistory(userId);
      const sustainabilityService = require('./sustainabilityService');
      
      let totalCarbon = 0;
      let totalLocalImpact = 0;
      
      for (const trip of trips) {
        const carbonFootprint = await sustainabilityService.calculateCarbonFootprint(trip);
        const localImpact = sustainabilityService.calculateLocalImpact(trip);
        
        totalCarbon += carbonFootprint.totalCarbon;
        totalLocalImpact += localImpact.score;
      }
      
      return {
        totalCarbon,
        averageCarbon: trips.length > 0 ? totalCarbon / trips.length : 0,
        averageLocalImpact: trips.length > 0 ? totalLocalImpact / trips.length : 0,
        totalTrips: trips.length
      };
    } catch (error) {
      console.error('Error getting sustainability metrics:', error);
      return { totalCarbon: 0, averageCarbon: 0, averageLocalImpact: 0, totalTrips: 0 };
    }
  }

  generateSessionId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Fallback functions
   */
  getEmptyAnalysisResult() {
    return {
      message: 'Insufficient data for analysis. Complete more trips to get personalized insights.',
      recommendations: ['Plan your first trip', 'Explore different destinations', 'Try various activities']
    };
  }

  getFallbackTravelAnalysis(trips = []) {
    return {
      totalTrips: trips.length,
      preferredDestinations: ['Mumbai', 'Delhi', 'Bangalore'],
      averageBudget: 15000,
      averageDuration: 3,
      confidence: 0.3,
      recommendations: ['Try new destinations', 'Explore different activities']
    };
  }

  getFallbackBudgetAnalysis() {
    return {
      averageSpending: 15000,
      potentialSavings: 2000,
      recommendations: ['Book in advance', 'Use public transport', 'Choose local accommodations']
    };
  }

  getFallbackDestinationAnalysis() {
    return {
      preferredRegions: ['North India', 'South India'],
      explorationScore: 50,
      recommendations: ['Try East India', 'Explore West India']
    };
  }

  getFallbackSeasonalAnalysis() {
    return {
      peakSeason: 'Winter',
      seasonalConsistency: 60,
      recommendations: ['Try off-season travel', 'Explore monsoon destinations']
    };
  }

  getFallbackGroupAnalysis() {
    return {
      preferredGroupSize: 2,
      socialScore: 'balanced',
      recommendations: ['Try solo travel', 'Plan group trips']
    };
  }

  getFallbackComprehensiveInsights() {
    return {
      userProfile: 'Balanced traveler',
      keyPatterns: ['Prefers cultural destinations', 'Moderate budget', 'Group travel'],
      recommendations: ['Explore new regions', 'Try different activities'],
      confidence: 0.5
    };
  }

  getFallbackDashboard() {
    return {
      userInsights: this.getFallbackComprehensiveInsights(),
      recentTrips: [],
      recommendationStats: { total: 0, viewed: 0, clicked: 0, booked: 0, ignored: 0 },
      sustainabilityMetrics: { totalCarbon: 0, averageCarbon: 0, averageLocalImpact: 0, totalTrips: 0 }
    };
  }
}

module.exports = new AnalyticsService();
