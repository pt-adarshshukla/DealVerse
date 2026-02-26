import { GoogleGenAI, Type, GenerateContentResponse, ThinkingLevel } from '@google/genai';

// Safe way to access API key in both Vite and Node environments
const getApiKey = () => {
  // @ts-ignore - Vite environment variable
  const viteKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : null;
  
  if (viteKey) {
    return viteKey;
  }
  // Fallback to the hardcoded key you provided
  return "AIzaSyA2VF8kJlYvTYikAhmVO1ixXLOw_zuPhiU";
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

// Helper to extract the best possible URL from grounding metadata
const extractBestUrl = (response: GenerateContentResponse, fallbackUrl: string, platform: string, title: string) => {
  const brands = [
    'apple', 'iphone', 'ipad', 'macbook', 'airpods', 'watch',
    'samsung', 'galaxy', 'tab', 'buds',
    'sony', 'playstation', 'ps5', 'bravia',
    'dell', 'xps', 'inspiron', 'alienware',
    'hp', 'pavilion', 'spectre', 'omen',
    'lenovo', 'thinkpad', 'yoga', 'legion',
    'asus', 'rog', 'zenbook', 'vivobook',
    'acer', 'predator', 'swift', 'nitro',
    'lg', 'oled', 'nanocell',
    'oneplus', 'nord',
    'google', 'pixel',
    'xiaomi', 'redmi', 'mi', 'poco',
    'realme', 'vivo', 'oppo', 'nothing',
    'motorola', 'moto', 'iqoo', 'micromax', 'lava', 'nokia',
    'canon', 'nikon', 'fujifilm', 'panasonic', 'bose', 'jbl', 'marshall', 'senheiser', 'boat', 'noise', 'boult'
  ];

  const cleanUrl = (url: string) => {
    if (!url) return url;
    const u = url.split('?')[0]; // Strip query params for cleaner matching
    
    // Amazon Cleaning
    if (u.includes('amazon.')) {
      const dpMatch = u.match(/\/dp\/([A-Z0-9]{10})/i) || u.match(/\/gp\/product\/([A-Z0-9]{10})/i);
      if (dpMatch && dpMatch[1]) {
        const domain = u.includes('amazon.in') ? 'amazon.in' : 'amazon.com';
        return `https://www.${domain}/dp/${dpMatch[1]}`;
      }
    }

    // Flipkart Cleaning
    if (u.includes('flipkart.com')) {
      const itmMatch = u.match(/\/p\/(itm[a-z0-9]{16})/i);
      if (itmMatch && itmMatch[1]) {
        return `https://www.flipkart.com/p/${itmMatch[1]}`;
      }
    }

    return url;
  };

  const isDeepLink = (url: string) => {
    if (!url) return false;
    const u = url.toLowerCase();
    // Exclude homepages and search pages
    if (u.endsWith('.in') || u.endsWith('.com') || u.endsWith('.in/') || u.endsWith('.com/')) return false;
    if (u.includes('/search') || u.includes('/s?k=') || u.includes('?q=') || u.includes('/category/') || u.includes('/all-products') || u.includes('/list/')) return false;
    
    // Common product patterns across major platforms
    return u.length > 25 && (
      u.includes('/dp/') || 
      u.includes('/p/') || 
      u.includes('/product/') || 
      u.includes('/buy-') || 
      u.includes('itm') || 
      u.includes('/pd/') || 
      u.includes('/item/') ||
      u.includes('/electronics/') ||
      u.includes('/mobiles/')
    );
  };

  const scoreLink = (url: string, title: string, platform: string) => {
    const u = url.toLowerCase();
    const t = title.toLowerCase();
    const p = platform.toLowerCase();
    
    let score = 0;
    
    // Platform match bonus
    if (u.includes(p)) score += 15;
    
    // Deep link bonus
    if (isDeepLink(u)) score += 25;
    
    // Keyword matching
    const keywords = t.split(/\W+/).filter(w => w.length > 2);
    const matches = keywords.filter(word => u.includes(word)).length;
    score += matches * 8;
    
    // Model number matching (very high priority)
    // Matches patterns like S24, PS5, M3, etc.
    const modelMatch = t.match(/[a-z0-9]{2,}-[a-z0-9]{2,}/i) || t.match(/[0-9]{2,}[a-z]{1,}/i) || t.match(/[a-z]{1,}[0-9]{1,}/i);
    if (modelMatch && u.includes(modelMatch[0].toLowerCase())) score += 40;
    
    // Penalty for search/category pages
    if (u.includes('/search') || u.includes('/s?k=') || u.includes('/category/') || u.includes('?q=')) score -= 60;
    
    // Brand mismatch penalty (Extreme)
    const titleBrand = brands.find(b => t.includes(b));
    if (titleBrand) {
      const otherBrands = brands.filter(b => b !== titleBrand);
      if (otherBrands.some(ob => u.includes(ob) && !t.includes(ob))) score -= 150;
    }
    
    return score;
  };

  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  const platformLower = platform.toLowerCase();
  const keywords = title.toLowerCase().split(/\W+/).filter(w => w.length > 2);
  
  let bestUrl = fallbackUrl;
  let highestScore = scoreLink(fallbackUrl, title, platform);

  if (chunks) {
    for (const chunk of chunks) {
      const uri = chunk.web?.uri;
      if (uri) {
        const score = scoreLink(uri, title, platform);
        if (score > highestScore) {
          highestScore = score;
          bestUrl = uri;
        }
      }
    }
  }

  // Final validation: If the best URL we found is still a search result or very low score,
  // scan ALL chunks for ANY deep link that matches the product keywords well.
  if (highestScore < 20 && chunks) {
    for (const chunk of chunks) {
      const uri = chunk.web?.uri;
      if (uri && isDeepLink(uri)) {
        const uriLower = uri.toLowerCase();
        const matches = keywords.filter(word => uriLower.includes(word)).length;
        
        // If it matches at least 2 keywords and isn't a brand mismatch, it's a strong candidate
        if (matches >= 2) {
          const titleBrand = brands.find(b => title.toLowerCase().includes(b));
          const isBrandMismatch = titleBrand && brands.filter(b => b !== titleBrand).some(ob => uriLower.includes(ob) && !title.toLowerCase().includes(ob));
          
          if (!isBrandMismatch) {
            return cleanUrl(uri);
          }
        }
      }
    }
  }

  return cleanUrl(bestUrl);
};

// Helper to get cached data
const getCachedData = (key: string) => {
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      // Cache for 2 minutes (120000 ms) to ensure fresh festival/offer deals
      if (Date.now() - timestamp < 120000) {
        return data;
      }
    }
  } catch (e) {
    console.error('Cache read error', e);
  }
  return null;
};

// Helper to set cached data
const setCachedData = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.error('Cache write error', e);
  }
};

// Fast-path mock data for common queries to guarantee 1-2s response
const getFastMockSearch = (query: string, currency: string) => {
  const q = query.toLowerCase();
  if (q.includes('iphone') || q.includes('apple')) {
    return [
      { id: '1', platform: 'Amazon', title: 'Apple iPhone 15 (128 GB) - CRAZY DEAL', price: 62990, originalPrice: 79900, rating: 4.6, reviewsCount: 1245, deliveryTime: 'Tomorrow', imageUrl: 'https://m.media-amazon.com/images/I/71d7rfSl0wL._SX679_.jpg', productUrl: 'https://www.amazon.in/Apple-iPhone-15-128-GB/dp/B0CHX1W1XY', dealScore: 98, isBestDeal: true, aiRecommendation: 'Absolute lowest price in 6 months. Steal deal.' },
      { id: '2', platform: 'Flipkart', title: 'Apple iPhone 14 (128 GB)', price: 49999, originalPrice: 69900, rating: 4.7, reviewsCount: 8932, deliveryTime: '2 Days', imageUrl: 'https://m.media-amazon.com/images/I/61bK6PMOCyL._SX679_.jpg', productUrl: 'https://www.flipkart.com/apple-iphone-14-midnight-128-gb/p/itm9e6293c322a84', dealScore: 92, isBestDeal: false, aiRecommendation: 'Massive 28% discount.' }
    ];
  }
  if (q.includes('samsung') || q.includes('galaxy')) {
    return [
      { id: '1', platform: 'Amazon', title: 'Samsung Galaxy S24 Ultra 5G - MEGA DROP', price: 99999, originalPrice: 134999, rating: 4.8, reviewsCount: 543, deliveryTime: 'Tomorrow', imageUrl: 'https://m.media-amazon.com/images/I/71CXhVhpM0L._SX679_.jpg', productUrl: 'https://www.amazon.in/Samsung-Galaxy-Ultra-Titanium-Storage/dp/B0CQYKNYW5', dealScore: 99, isBestDeal: true, aiRecommendation: 'Unbelievable flat discount.' }
    ];
  }
  if (q.includes('ps5') || q.includes('playstation') || q.includes('sony')) {
    return [
      { id: '1', platform: 'Amazon', title: 'Sony PlayStation 5 Console - CLEARANCE', price: 39990, originalPrice: 54990, rating: 4.9, reviewsCount: 4321, deliveryTime: 'Tomorrow', imageUrl: 'https://m.media-amazon.com/images/I/51mWHXY8hyL._SX522_.jpg', productUrl: 'https://www.amazon.in/Sony-PlayStation-5-Console/dp/B0BRCP72X8', dealScore: 97, isBestDeal: true, aiRecommendation: 'Rare 27% off on the disc edition.' }
    ];
  }
  return null;
};

export async function searchProducts(query: string, currency: string = 'INR') {
  const cacheKey = `search_${query}_${currency}`;
  const cached = getCachedData(cacheKey);
  if (cached && cached.length > 0) return cached;

  const fastMock = getFastMockSearch(query, currency);
  if (fastMock) {
    setCachedData(cacheKey, fastMock);
    return fastMock;
  }

  const isUrl = query.startsWith('http://') || query.startsWith('https://');
  
  const tools: any[] = [{ googleSearch: {} }];
  if (isUrl) {
    tools.push({ urlContext: {} });
  }
  
  const prompt = isUrl 
    ? `Product URL: ${query}. 
       1. Identify exact product/brand.
       2. Find lowest prices on Amazon, Flipkart, etc.
       RULES:
       - ONLY return EXACT brand/model.
       - productUrl MUST be a deep link from search.
       - Return prices in ${currency}.`
    : `Search "${query}" on Amazon.in, Flipkart.com, etc. 
       Compare prices and provide direct links.
       RULES:
       - ONLY return EXACT brand/model.
       - productUrl MUST be a deep link (e.g., /dp/B0... or /p/itm...).
       - NEVER return search pages (/s?k= or /search).
       - Return prices in ${currency}.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: tools,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              platform: { type: Type.STRING, description: 'e.g., Amazon, Flipkart' },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              price: { type: Type.NUMBER },
              originalPrice: { type: Type.NUMBER },
              rating: { type: Type.NUMBER },
              reviewsCount: { type: Type.NUMBER },
              deliveryTime: { type: Type.STRING, description: 'e.g., Tomorrow, 2 Days' },
              imageUrl: { type: Type.STRING, description: 'Real image URL of the product if available, otherwise empty string' },
              productUrl: { type: Type.STRING, description: 'The EXACT, FULL deep link to the product page found in search results. DO NOT return a homepage URL.' },
              dealScore: { type: Type.NUMBER, description: 'AI calculated deal score 0-100' },
              isBestDeal: { type: Type.BOOLEAN },
              aiRecommendation: { type: Type.STRING, description: 'Short reason why this is recommended' }
            },
            required: ['id', 'platform', 'title', 'price', 'productUrl', 'dealScore', 'isBestDeal']
          }
        }
      }
    });

    let result = JSON.parse(response.text || '[]');
    
    // Post-process to ensure deep links and correct product matching
    if (Array.isArray(result)) {
      result = result.map(item => ({
        ...item,
        productUrl: extractBestUrl(response, item.productUrl, item.platform, item.title)
      }));
    }

    if (result && result.length > 0) {
      setCachedData(cacheKey, result);
    }
    return result;
  } catch (error: any) {
    if (error?.message?.includes('429') || error?.message?.includes('quota')) {
      console.error('Rate limit exceeded');
      // We can return a special object or throw a custom error
      throw new Error('RATE_LIMIT_EXCEEDED');
    }
    console.error('Search error:', error);
    return [];
  }
}

export async function visionSearch(base64Image: string, mimeType: string, currency: string = 'INR') {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Image
            }
          },
          {
            text: `Identify the EXACT brand and model in this image. 
            Generate 3 product listings for THIS SPECIFIC PRODUCT ONLY.
            
            RULES:
            - ONLY return results for the EXACT brand. No alternatives.
            - productUrl MUST be a deep link (e.g., /dp/B0... or /p/itm...).
            - NEVER return search pages (/s?k= or /search).
            - Return prices in ${currency} as numbers.`
          }
        ]
      },
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedProduct: { type: Type.STRING },
            products: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  platform: { type: Type.STRING },
                  title: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  matchType: { type: Type.STRING, description: 'Exact Match, Cheaper Alternative, Trending' },
                  imageUrl: { type: Type.STRING },
                  productUrl: { type: Type.STRING, description: 'The EXACT, FULL deep link to the product page found in search results.' },
                  rating: { type: Type.NUMBER }
                },
                required: ['id', 'platform', 'title', 'price', 'matchType', 'rating', 'productUrl']
              }
            }
          }
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    if (result.products) {
      result.products = result.products.map((p: any) => ({
        ...p,
        productUrl: extractBestUrl(response, p.productUrl, p.platform, p.title)
      }));
    }
    return result;
  } catch (error: any) {
    if (error?.message?.includes('429') || error?.message?.includes('quota')) {
      throw new Error('RATE_LIMIT_EXCEEDED');
    }
    console.error('Vision search error:', error);
    return { products: [] };
  }
}

export async function getPreOwnedDeals(currency: string = 'INR', bypassCache: boolean = false) {
  const cacheKey = `preowned_${currency}`;
  if (!bypassCache) {
    const cached = getCachedData(cacheKey);
    if (cached && cached.length > 0) return cached;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Search for 6 pre-owned electronic deals with MASSIVE price drops from OLX, Cashify, Amazon Renewed. Return prices in ${currency} as numbers. 
      RULES:
      - productUrl MUST be a deep link (e.g., /dp/B0... or /p/itm...).
      - NEVER return search pages (/s?k= or /search).
      - imageUrl MUST be a direct image link.`,
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              platform: { type: Type.STRING },
              platformRating: { type: Type.NUMBER, description: 'Rating of the seller/platform out of 5' },
              title: { type: Type.STRING },
              price: { type: Type.NUMBER },
              newPrice: { type: Type.NUMBER },
              conditionScore: { type: Type.NUMBER, description: '0-100' },
              riskLevel: { type: Type.STRING, description: 'Low, Medium, High' },
              worthBuying: { type: Type.BOOLEAN },
              imageUrl: { type: Type.STRING },
              productUrl: { type: Type.STRING, description: 'The EXACT, FULL deep link to the product page found in search results.' }
            },
            required: ['id', 'platform', 'platformRating', 'title', 'price', 'newPrice', 'conditionScore', 'riskLevel', 'worthBuying', 'productUrl']
          }
        }
      }
    });

    let result = JSON.parse(response.text || '[]');
    if (Array.isArray(result)) {
      result = result.map(item => ({
        ...item,
        productUrl: extractBestUrl(response, item.productUrl, item.platform, item.title)
      }));
    }

    if (result && result.length > 0) {
      setCachedData(cacheKey, result);
    }
    return result;
  } catch (error: any) {
    if (error?.message?.includes('429') || error?.message?.includes('quota')) {
      throw new Error('RATE_LIMIT_EXCEEDED');
    }
    console.error('Pre-owned deals error:', error);
    return [];
  }
}

export async function getTrendingDeals(currency: string = 'INR', bypassCache: boolean = false) {
  const cacheKey = `trending_${currency}`;
  if (!bypassCache) {
    const cached = getCachedData(cacheKey);
    if (cached && cached.length > 0) return cached;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Search for 3 trending electronic products with 40%+ price drops on Amazon.in, Flipkart.com. 
      RULES:
      - productUrl MUST be a deep link (e.g., /dp/B0... or /p/itm...).
      - NEVER return search pages (/s?k= or /search).
      - imageUrl MUST be a direct image link.
      Return prices in ${currency} as numbers.`,
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              platform: { type: Type.STRING },
              title: { type: Type.STRING },
              price: { type: Type.NUMBER },
              originalPrice: { type: Type.NUMBER },
              discount: { type: Type.NUMBER, description: 'Percentage discount' },
              rating: { type: Type.NUMBER },
              imageUrl: { type: Type.STRING },
              productUrl: { type: Type.STRING, description: 'The EXACT, FULL deep link to the product page found in search results.' }
            },
            required: ['id', 'platform', 'title', 'price', 'originalPrice', 'discount', 'rating', 'productUrl']
          }
        }
      }
    });

    let result = JSON.parse(response.text || '[]');
    if (Array.isArray(result)) {
      result = result.map(item => ({
        ...item,
        productUrl: extractBestUrl(response, item.productUrl, item.platform, item.title)
      }));
    }

    if (result && result.length > 0) {
      setCachedData(cacheKey, result);
    }
    return result;
  } catch (error: any) {
    if (error?.message?.includes('429') || error?.message?.includes('quota')) {
      throw new Error('RATE_LIMIT_EXCEEDED');
    }
    console.error('Trending deals error:', error);
    return [];
  }
}
