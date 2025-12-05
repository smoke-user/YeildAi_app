
import { GoogleGenAI, Type } from "@google/genai";
import { KnowledgeBase } from "./knowledgeBase";
import { ChatMessage } from "../types";

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
  
  // 1. QUERY RAG SYSTEM for Fertilizer Specifications
  const ragContext = KnowledgeBase.search(fertilizerInput);

  const prompt = `
    Field Area: ${areaHa} hectares.
    Crop: ${crop}.
    Fertilizer/Chemical selected: ${fertilizerInput}.
    
    === RAG KNOWLEDGE BASE (FERTILIZER SPECS) ===
    ${ragContext}
    =============================================

    Task:
    1. Calculate the required amount of this fertilizer for the field.
    2. ANALYZE SUITABILITY: Check if the RAG 'SUITABLE CROPS' list includes '${crop}'. 
       - If yes, confirm it is effective.
       - If no, warn the user and suggest checking compatibility.
       - Explain *when* to apply it based on 'TIMING'.
    3. SOIL TESTS: List the 'REQUIRED SOIL TESTS' from the RAG data (e.g. N-NO3, P2O5).
    
    OUTPUT REQUIREMENTS:
    - 'suitabilityAnalysis': A short paragraph explaining if this fertilizer fits the crop and why (based on RAG).
    - 'recommendedSoilTests': An array of strings listing the necessary lab tests.
    
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
            suitabilityAnalysis: { type: Type.STRING, description: "Is this fertilizer good for this crop? When to apply?" },
            recommendedSoilTests: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["productName", "amountPerHa", "totalAmount", "applicationMethod", "safetyAdvice", "suitabilityAnalysis", "recommendedSoilTests"],
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
  soilType: string,
  language: string = 'ru'
): Promise<any> => {
  const model = "gemini-2.5-flash";

  // 1. QUERY RAG SYSTEM (Agent Agronomist) with REAL DATA
  const ragContext = KnowledgeBase.search(crop);

  // 2. CONSTRUCT PROMPT with RAG Context
  const prompt = `
    Field Area: ${areaHa} hectares.
    Target Crop: ${crop}.
    Soil Type: ${soilType}.
    Region: Uzbekistan (Continental Climate).

    === RAG KNOWLEDGE BASE (OFFICIAL STANDARDS & DATASETS) ===
    ${ragContext}
    ==========================================================
    
    Task: Calculate professional seeding rates based on the RAG DATA provided.
    
    INSTRUCTIONS:
    1. If RAG data is available (status: SUCCESS), YOU MUST USE the provided norms (Seeding Rate, TSW, Density) for your calculation. Do not hallucinate different numbers.
    2. If RAG data is missing, use general expert knowledge for Central Asia.
    3. Calculate 'Total Seeds Needed' in KG: (Seeding Rate kg/ha) * (Field Area ha).
    4. Suggest a specific local variety (e.g., 'Sultan' for Cotton, 'Grom' for Wheat) if not specified in RAG.
    5. Determine the 'Estimated Yield Projection' based on the 'Yield Potential' in the RAG data.
    
    OUTPUT REQUIREMENTS:
    - 'seedsPerHa': Must be a string with units (e.g. "25 kg/ha").
    - 'totalSeedsNeeded': Must be a string with units (e.g. "125 kg").
    - 'thousandSeedWeight': Must match the RAG data if available.
    - 'sourceCitation': Cite the 'SOURCE' from the RAG context (e.g., "GOST 5947-68" or "CROPGRIDS").
    
    Provide all text fields in the JSON response in the ${language.toUpperCase()} language.
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
            thousandSeedWeight: { type: Type.STRING, description: "Weight of 1000 seeds (TSW) in grams from RAG" },
            seedsPerHa: { type: Type.STRING, description: "Seeding rate in kg/ha" },
            totalSeedsNeeded: { type: Type.STRING, description: "Total seeds in kg" },
            optimalPlantingDepth: { type: Type.STRING },
            estimatedYieldProjection: { type: Type.STRING, description: "Projected yield t/ha based on RAG potential" },
            sourceCitation: { type: Type.STRING, description: "The GOST or dataset used" },
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
          required: ["cropType", "seedVarietyRecommendation", "thousandSeedWeight", "seedsPerHa", "totalSeedsNeeded", "optimalPlantingDepth", "operationPlan", "estimatedYieldProjection", "sourceCitation"],
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
  history: ChatMessage[],
  base64Image: string | null = null,
  contextData: any = null,
  language: string = 'ru'
): Promise<string> => {
  const model = "gemini-2.5-flash"; // Multimodal support

  const parts: any[] = [];
  
  if (base64Image) {
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image
      }
    });
  }

  // Build History String (Last 10 messages to save context tokens)
  const recentHistory = history.slice(-10); 
  const historyText = recentHistory.map(m => 
    `${m.role === 'user' ? 'User' : 'Agronomist AI'}: ${m.text}`
  ).join('\n');

  // Construct Prompt with Context
  let fullPrompt = `
  CURRENT LANGUAGE: ${language}.
  
  === CONVERSATION HISTORY ===
  ${historyText}
  ============================
  
  User New Question: "${message}".
  `;
  
  if (contextData) {
    fullPrompt += `
    \n=== FARM DATA CONTEXT (Use this to answer questions about the user's fields) ===
    ${JSON.stringify(contextData, null, 2)}
    ================================================================================
    `;
  }

  // Also allow Agent 2 to use RAG for general questions
  const ragContext = KnowledgeBase.search(message);
  fullPrompt += `
  \n=== RAG KNOWLEDGE BASE (REAL AGRONOMIC DATA) ===
  ${ragContext}
  ================================================
  `;

  fullPrompt += `
    If an image is provided, identify the agricultural product (pesticide/fertilizer) or plant disease.
    If the user asks about their fields (e.g., "What is the plan for Field A?"), use the FARM DATA CONTEXT provided above.
    If the user asks general questions about norms/crops, use the RAG KNOWLEDGE BASE.
    Provide actionable advice for a farmer in Uzbekistan.
    Keep the answer concise but informative.
    Maintain the conversation flow based on the HISTORY provided.
  `;

  parts.push({ text: fullPrompt });

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
