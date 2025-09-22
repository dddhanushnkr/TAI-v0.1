const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Multilingual service for Indian languages
 */
class MultilingualService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'demo-key');
    
    // Indian languages mapping
    this.languages = {
      'hi': { name: 'Hindi', native: 'हिन्दी', region: 'North India' },
      'bn': { name: 'Bengali', native: 'বাংলা', region: 'West Bengal' },
      'te': { name: 'Telugu', native: 'తెలుగు', region: 'Telangana, Andhra Pradesh' },
      'mr': { name: 'Marathi', native: 'मराठी', region: 'Maharashtra' },
      'ta': { name: 'Tamil', native: 'தமிழ்', region: 'Tamil Nadu' },
      'gu': { name: 'Gujarati', native: 'ગુજરાતી', region: 'Gujarat' },
      'kn': { name: 'Kannada', native: 'ಕನ್ನಡ', region: 'Karnataka' },
      'ml': { name: 'Malayalam', native: 'മലയാളം', region: 'Kerala' },
      'pa': { name: 'Punjabi', native: 'ਪੰਜਾਬੀ', region: 'Punjab' },
      'or': { name: 'Odia', native: 'ଓଡ଼ିଆ', region: 'Odisha' },
      'as': { name: 'Assamese', native: 'অসমীয়া', region: 'Assam' },
      'ne': { name: 'Nepali', native: 'नेपाली', region: 'Sikkim' },
      'en': { name: 'English', native: 'English', region: 'All India' }
    };

    // Regional cultural context
    this.regionalContext = {
      'North India': {
        languages: ['hi', 'pa', 'en'],
        culture: 'Rich Mughal heritage, Bollywood, diverse cuisine',
        greetings: ['Namaste', 'Sat Sri Akal', 'Hello']
      },
      'South India': {
        languages: ['te', 'ta', 'kn', 'ml', 'en'],
        culture: 'Temple architecture, classical music, spicy cuisine',
        greetings: ['Namaskaram', 'Vanakkam', 'Hello']
      },
      'East India': {
        languages: ['bn', 'or', 'as', 'en'],
        culture: 'Literature, festivals, fish curry',
        greetings: ['Namaskar', 'Namaskar', 'Hello']
      },
      'West India': {
        languages: ['mr', 'gu', 'en'],
        culture: 'Maritime heritage, business culture, diverse food',
        greetings: ['Namaskar', 'Jai Shri Krishna', 'Hello']
      }
    };
  }

  /**
   * Translate content to target language
   */
  async translateContent(content, targetLanguage, sourceLanguage = 'en') {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
      Translate the following travel content from ${sourceLanguage} to ${targetLanguage}:
      
      Content: ${JSON.stringify(content)}
      
      Requirements:
      1. Maintain cultural context and local terminology
      2. Use appropriate regional expressions
      3. Keep travel-specific terms clear and understandable
      4. Preserve formatting and structure
      5. Include cultural nuances where relevant
      
      Return the translated content in the same JSON structure.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const translatedText = response.text();

      try {
        const jsonMatch = translatedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Error parsing translated content:', parseError);
      }

      return content; // Return original if translation fails

    } catch (error) {
      console.error('Error translating content:', error);
      return content;
    }
  }

  /**
   * Get cultural greetings for a region
   */
  getCulturalGreetings(region) {
    const context = this.regionalContext[region];
    return context ? context.greetings : ['Hello', 'Namaste'];
  }

  /**
   * Get local language phrases for travelers
   */
  async getTravelPhrases(destination, language) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
      Generate essential travel phrases in ${language} for visiting ${destination}:
      
      Include:
      1. Basic greetings and politeness
      2. Directions and transportation
      3. Food and dining
      4. Shopping and bargaining
      5. Emergency situations
      6. Cultural etiquette
      
      Format as JSON with categories and phrases.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const phrasesText = response.text();

      try {
        const jsonMatch = phrasesText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Error parsing travel phrases:', parseError);
      }

      return this.getFallbackPhrases(language);

    } catch (error) {
      console.error('Error generating travel phrases:', error);
      return this.getFallbackPhrases(language);
    }
  }

  /**
   * Get cultural context for a destination
   */
  getCulturalContext(destination) {
    // Map destinations to regions
    const destinationRegion = this.mapDestinationToRegion(destination);
    const context = this.regionalContext[destinationRegion];
    
    return {
      region: destinationRegion,
      languages: context ? context.languages : ['en'],
      culture: context ? context.culture : 'Rich cultural heritage',
      greetings: context ? context.greetings : ['Hello', 'Namaste']
    };
  }

  /**
   * Map destination to region
   */
  mapDestinationToRegion(destination) {
    const cityRegionMap = {
      'Mumbai': 'West India',
      'Delhi': 'North India',
      'Bangalore': 'South India',
      'Chennai': 'South India',
      'Kolkata': 'East India',
      'Hyderabad': 'South India',
      'Pune': 'West India',
      'Ahmedabad': 'West India',
      'Jaipur': 'North India',
      'Goa': 'West India',
      'Kochi': 'South India',
      'Mysore': 'South India',
      'Udaipur': 'North India',
      'Jodhpur': 'North India',
      'Varanasi': 'North India',
      'Agra': 'North India',
      'Amritsar': 'North India',
      'Chandigarh': 'North India',
      'Bhubaneswar': 'East India',
      'Guwahati': 'East India'
    };

    return cityRegionMap[destination] || 'North India';
  }

  /**
   * Generate localized content for itinerary
   */
  async generateLocalizedItinerary(itinerary, language) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
      Localize this travel itinerary for ${language} speakers:
      
      Itinerary: ${JSON.stringify(itinerary)}
      
      Requirements:
      1. Translate all text content to ${language}
      2. Adapt cultural references for local context
      3. Include local customs and etiquette
      4. Suggest region-specific alternatives
      5. Add local language phrases for each activity
      6. Maintain the JSON structure
      
      Return the localized itinerary.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const localizedText = response.text();

      try {
        const jsonMatch = localizedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Error parsing localized itinerary:', parseError);
      }

      return itinerary; // Return original if localization fails

    } catch (error) {
      console.error('Error generating localized itinerary:', error);
      return itinerary;
    }
  }

  /**
   * Get language-specific date and time formatting
   */
  getLocalizedDateTime(date, language) {
    const languageConfig = this.languages[language];
    if (!languageConfig) return date.toLocaleDateString();

    // This would integrate with a proper i18n library
    // For now, return basic formatting
    return {
      date: date.toLocaleDateString('en-IN'),
      time: date.toLocaleTimeString('en-IN'),
      day: date.toLocaleDateString('en-IN', { weekday: 'long' }),
      month: date.toLocaleDateString('en-IN', { month: 'long' })
    };
  }

  /**
   * Get currency formatting for region
   */
  getLocalizedCurrency(amount, region) {
    const currencyMap = {
      'North India': '₹',
      'South India': '₹',
      'East India': '₹',
      'West India': '₹'
    };

    const symbol = currencyMap[region] || '₹';
    return `${symbol}${amount.toLocaleString('en-IN')}`;
  }

  /**
   * Get fallback phrases for a language
   */
  getFallbackPhrases(language) {
    const fallbackPhrases = {
      'hi': {
        greetings: ['नमस्ते (Namaste)', 'आप कैसे हैं? (How are you?)'],
        directions: ['कृपया मार्ग बताएं (Please show the way)', 'यहाँ कैसे पहुँचें? (How to reach here?)'],
        food: ['मुझे भूख लगी है (I am hungry)', 'यह क्या है? (What is this?)'],
        emergency: ['मदद! (Help!)', 'पुलिस! (Police!)']
      },
      'te': {
        greetings: ['నమస్కారం (Namaskaram)', 'మీరు ఎలా ఉన్నారు? (How are you?)'],
        directions: ['దయచేసి మార్గం చూపించండి (Please show the way)', 'ఇక్కడ ఎలా చేరుకోవాలి? (How to reach here?)'],
        food: ['నాకు ఆకలి వేస్తోంది (I am hungry)', 'ఇది ఏమిటి? (What is this?)'],
        emergency: ['సహాయం! (Help!)', 'పోలీస్! (Police!)']
      },
      'ta': {
        greetings: ['வணக்கம் (Vanakkam)', 'நீங்கள் எப்படி இருக்கிறீர்கள்? (How are you?)'],
        directions: ['தயவுசெய்து வழி காட்டுங்கள் (Please show the way)', 'இங்கே எப்படி வருவது? (How to reach here?)'],
        food: ['எனக்கு பசிக்கிறது (I am hungry)', 'இது என்ன? (What is this?)'],
        emergency: ['உதவி! (Help!)', 'காவல்துறை! (Police!)']
      },
      'bn': {
        greetings: ['নমস্কার (Namaskar)', 'আপনি কেমন আছেন? (How are you?)'],
        directions: ['দয়া করে পথ দেখান (Please show the way)', 'এখানে কীভাবে আসব? (How to reach here?)'],
        food: ['আমার ক্ষুধা পেয়েছে (I am hungry)', 'এটা কী? (What is this?)'],
        emergency: ['সাহায্য! (Help!)', 'পুলিশ! (Police!)']
      }
    };

    return fallbackPhrases[language] || fallbackPhrases['hi'];
  }

  /**
   * Get supported languages for a destination
   */
  getSupportedLanguages(destination) {
    const region = this.mapDestinationToRegion(destination);
    const context = this.regionalContext[region];
    
    if (!context) return ['en'];

    return context.languages.map(lang => ({
      code: lang,
      name: this.languages[lang]?.name || lang,
      native: this.languages[lang]?.native || lang
    }));
  }

  /**
   * Detect language from text
   */
  async detectLanguage(text) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
      Detect the language of this text and return the language code:
      
      Text: "${text}"
      
      Return only the language code (e.g., 'hi', 'en', 'te', 'ta', 'bn').
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const detectedLanguage = response.text().trim().toLowerCase();

      return this.languages[detectedLanguage] ? detectedLanguage : 'en';

    } catch (error) {
      console.error('Error detecting language:', error);
      return 'en';
    }
  }

  /**
   * Get cultural tips for a destination
   */
  async getCulturalTips(destination, language) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
      Provide cultural tips for ${language} speakers visiting ${destination}:
      
      Include:
      1. Cultural etiquette and customs
      2. Dress code recommendations
      3. Religious and social norms
      4. Communication styles
      5. Food and dining customs
      6. Photography and social media etiquette
      7. Gift-giving traditions
      8. Business etiquette (if applicable)
      
      Format as JSON with categories and tips.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const tipsText = response.text();

      try {
        const jsonMatch = tipsText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Error parsing cultural tips:', parseError);
      }

      return this.getFallbackCulturalTips(destination);

    } catch (error) {
      console.error('Error generating cultural tips:', error);
      return this.getFallbackCulturalTips(destination);
    }
  }

  /**
   * Get fallback cultural tips
   */
  getFallbackCulturalTips(destination) {
    return {
      etiquette: [
        'Remove shoes before entering homes and temples',
        'Use right hand for eating and greeting',
        'Dress modestly, especially at religious sites'
      ],
      communication: [
        'Learn basic greetings in local language',
        'Be patient and respectful in conversations',
        'Avoid pointing with index finger'
      ],
      dining: [
        'Try local cuisine and street food',
        'Ask about ingredients if you have allergies',
        'Don\'t waste food - it\'s considered disrespectful'
      ],
      photography: [
        'Ask permission before photographing people',
        'Respect "no photography" signs at religious sites',
        'Be mindful of cultural sensitivities'
      ]
    };
  }
}

module.exports = new MultilingualService();
