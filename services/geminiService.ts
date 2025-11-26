
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// System instruction tailored for Uzbekistan agriculture
const SYSTEM_INSTRUCTION = `
You are an expert agronomist specializing in agriculture in Uzbekistan. 
Your goal is to assist farmers with precise calculations for seeding and fertilization.
Consider the local climate, common soil types in Uzbekistan, and popular local crop varieties.
When analyzing fertilizers, consider specific brands available in Central Asia if mentioned, or generic equivalents.
Always output specific numbers and safety warnings.
`;

export const analyzeFertilizerNeeds = async (
  areaHa: number, 
  crop: string, 
  fertilizerInput: string,
  language: string = 'ru'
): Promise<any> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    Field Area: ${areaHa} hectares.
    Crop: ${crop}.
    Fertilizer/Chemical on hand: ${fertilizerInput}.
    
    Calculate the required amount of this fertilizer/chemical for the entire field.
    Provide application instructions and safety advice.
    IMPORTANT: Provide all text fields in the JSON response in the ${language.toUpperCase()} language.
    Return JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            productName: { type: Type.STRING },
            amountPerHa: { type: Type.STRING },
            totalAmount: { type: Type.STRING },
            applicationMethod: { type: Type.STRING },
            safetyAdvice: { type: Type.STRING },
          },
          required: ["productName", "amountPerHa", "totalAmount", "applicationMethod", "safetyAdvice"],
        }
      }
    });
    
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Fertilizer Analysis Error:", error);
    throw error;
  }
};

export const analyzeSeedingNeeds = async (
  areaHa: number,
  crop: string,
  language: string = 'ru'
): Promise<any> => {
  const model = "gemini-2.5-flash";

  const prompt = `
    Field Area: ${areaHa} hectares.
    Target Crop: ${crop}.
    
    Calculate the optimal seeding rate. Suggest a seed variety popular in Uzbekistan if applicable.
    IMPORTANT: Provide all text fields in the JSON response in the ${language.toUpperCase()} language.
    Return JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cropType: { type: Type.STRING },
            seedVarietyRecommendation: { type: Type.STRING },
            seedsPerHa: { type: Type.STRING },
            totalSeedsNeeded: { type: Type.STRING },
            optimalPlantingDepth: { type: Type.STRING },
          },
          required: ["cropType", "seedVarietyRecommendation", "seedsPerHa", "totalSeedsNeeded", "optimalPlantingDepth"],
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Seeding Analysis Error:", error);
    throw error;
  }
};
