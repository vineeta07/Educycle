
import { GoogleGenAI } from "@google/genai";

export const generateImageDescription = async (base64Image: string): Promise<string> => {
  // Initialize client inside the function to ensure process.env is ready
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.error("API Key is missing!");
    return "Error: API Key missing. Please configure your Gemini API Key.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Remove header if present in base64 string (e.g., "data:image/jpeg;base64,")
    const base64Data = base64Image.split(',')[1] || base64Image;

    const model = 'gemini-2.5-flash';
    
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming jpeg for simplicity
              data: base64Data
            }
          },
          {
            text: "Describe this item for a student marketplace listing. Keep it professional, concise (max 2 sentences), and highlight the condition and key features suitable for a buyer."
          }
        ]
      }
    });

    return response.text || "No description generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate description. Please try again.";
  }
};