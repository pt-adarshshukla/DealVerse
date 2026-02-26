import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: 'AIzaSyA2VF8kJlYvTYikAhmVO1ixXLOw_zuPhiU' });

async function test() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: 'Search for iPhone 15 prices on Amazon and Flipkart.',
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              platform: { type: Type.STRING },
              price: { type: Type.NUMBER }
            }
          }
        }
      }
    });
    console.log(response.text);
  } catch (e) {
    console.error(e);
  }
}
test();
