import { GoogleGenAI, Type } from "@google/genai";
import { RefinementType } from "../types";

// Helper to convert blob/url to base64
export const urlToBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      resolve(base64String.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const analyzeLogoForRefinement = async (base64Logo: string): Promise<{ suggestion: RefinementType, reasoning: string }> => {
  if (!process.env.API_KEY) {
    console.warn("No API Key found for Gemini");
    return { suggestion: RefinementType.DRUCK, reasoning: "API Key fehlt. Standard: Druck." };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-latest",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/png",
              data: base64Logo
            }
          },
          {
            text: `Analysiere dieses Logo für Textilveredelung. 
            Wenn das Logo viele Farben, Verläufe oder feine Details hat, empfehle 'Druck'. 
            Wenn es wenige Farben (1-3) und klare Linien hat, empfehle 'Stick'.
            Gib mir eine JSON Antwort.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestion: {
              type: Type.STRING,
              enum: [RefinementType.STICK, RefinementType.DRUCK]
            },
            reasoning: {
              type: Type.STRING,
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("Empty response");

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return { suggestion: RefinementType.DRUCK, reasoning: "Konnte Bild nicht analysieren." };
  }
};