
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// System instruction tailored for Uzbekistan agriculture
const SYSTEM_INSTRUCTION = `
You are an expert agronomist specialized in agriculture for Uzbekistan. 
Your goal is to assist farmers with precise calculations for seeding, fertilization, and pest control.
Consider the local climate (continental, hot summers), common soil types (sierozem, loam), and popular local crop varieties (cotton, wheat).
When analyzing fertilizers or pesticides from text or images, provide safety schemes, mixing restrictions, and specific dosages.
Always output specific numbers.
If the user uploads an image of a bottle/bag, identify the product and its active ingredient, then advise on usage for the mentioned crop.
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
  targetYield: string,
  soilType: string,
  language: string = 'ru'
): Promise<any> => {
  const model = "gemini-2.5-flash";

  const prompt = `
    Field Area: ${areaHa} hectares.
    Target Crop: ${crop}.
    Target Yield: ${targetYield} tons/ha.
    Soil Type: ${soilType}.
    
    1. Calculate optimal seeding rate (kg/ha and total).
    2. Suggest a seed variety popular in Central Asia/Uzbekistan.
    3. Create a basic operation plan (steps like "Base Fertilizer", "Seeding", "First Watering", etc).
    
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
            fertilizerRecommendation: { type: Type.STRING },
            operationPlan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepName: { type: Type.STRING },
                  timing: { type: Type.STRING },
                  description: { type: Type.STRING }
                }
              }
            }
          },
          required: ["cropType", "seedVarietyRecommendation", "seedsPerHa", "totalSeedsNeeded", "optimalPlantingDepth", "operationPlan"],
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Seeding Analysis Error:", error);
    throw error;
  }
};

export const sendChatMessage = async (
  message: string,
  base64Image: string | null = null,
  language: string = 'ru'
): Promise<string> => {
  const model = "gemini-2.5-flash"; // Multimodal support

  const parts: any[] = [];
  
  if (base64Image) {
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg', // Assuming jpeg for simplicity, or detect from header
        data: base64Image
      }
    });
  }

  parts.push({
    text: `User Question: "${message}". 
    Language: ${language}.
    If an image is provided, identify the agricultural product (pesticide/fertilizer) or plant disease.
    Provide actionable advice for a farmer in Uzbekistan.
    Keep the answer concise but informative.`
  });

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });

    return response.text || "I could not generate a response. Please try again.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Error connecting to AI Agent. Please check your internet connection.";
  }
};
