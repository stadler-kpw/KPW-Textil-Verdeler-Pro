import { GoogleGenAI, Type } from "@google/genai";
import { RefinementType } from "@/types";

// Blueprint view generation types
export type BlueprintView = 'front' | 'left' | 'right' | 'back';

const VIEW_PROMPTS: Record<BlueprintView, string> = {
  front: 'FRONT VIEW: Show the garment facing directly toward the viewer. The viewer sees the chest, front zipper/buttons, and front pockets.',
  left: 'LEFT SIDE VIEW: Show the garment from the LEFT side. The viewer is standing to the LEFT of the garment looking at it. The left sleeve faces the viewer, the right sleeve is hidden behind the garment.',
  right: 'RIGHT SIDE VIEW: Show the garment from the RIGHT side. The viewer is standing to the RIGHT of the garment looking at it. The right sleeve faces the viewer, the left sleeve is hidden behind the garment. This is the MIRROR OPPOSITE of the left side view.',
  back: 'BACK VIEW: Show the garment from behind. The viewer sees the back of the garment, the back of the collar/hood, and the back of the sleeves.',
};

const BLUEPRINT_VIEWS: BlueprintView[] = ['front', 'left', 'right', 'back'];

export const urlToBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      resolve(base64String.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const analyzeLogoForRefinement = async (base64Logo: string): Promise<{ suggestion: RefinementType, reasoning: string }> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("No API Key found for Gemini");
    return { suggestion: RefinementType.DRUCK, reasoning: "API Key fehlt. Standard: Druck." };
  }

  const ai = new GoogleGenAI({ apiKey });

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

// Generate a single blueprint outline for a specific view
async function generateSingleBlueprint(
  ai: GoogleGenAI,
  imageBase64: string,
  view: BlueprintView
): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: [
      {
        inlineData: {
          mimeType: "image/png",
          data: imageBase64,
        },
      },
      {
        text: `STRICT RULES - YOU MUST FOLLOW EVERY SINGLE RULE EXACTLY:

Identify the TYPE of garment in this image (e.g. jacket, hoodie, t-shirt, polo, vest, etc.).
Do NOT try to copy the exact garment from the photo. Instead, draw a GENERIC, CLEAN version of that garment type.
For example: if you see a jacket, draw a simple generic jacket. Do NOT hallucinate details like zippers, seams, pockets, or stitching that you cannot clearly confirm from the image.

PERSPECTIVE - THIS IS CRITICAL, GET IT RIGHT:
${VIEW_PROMPTS[view]}

COLOR RULES - ABSOLUTELY NO EXCEPTIONS:
- The ENTIRE image must contain ONLY black (#000000) and white (#FFFFFF)
- Every pixel must be either pure black or pure white
- FORBIDDEN: red, blue, green, yellow, orange, gray, or ANY color whatsoever
- The garment body must be WHITE (empty/unfilled)
- Lines/outlines must be BLACK
- Background must be WHITE
- If you generate ANY pixel that is not pure black or pure white, you have FAILED

DRAWING RULES:
- Draw only the basic outer silhouette/shape of the garment type
- Garment must be CLOSED (zipped up, buttoned)
- 1:1 square aspect ratio
- Garment fills ~80% of the image
- NO logos, labels, text, branding, or decorative elements
- NO zippers, seams, stitching, or pocket details - ONLY the outer contour
- NO person, mannequin, or hanger
- NO shading, shadows, gradients, or hatching
- Simple black pen outline on white paper - technical flat sketch style

VERIFY BEFORE OUTPUTTING: Is every single pixel either #000000 or #FFFFFF? If not, remove all color.`,
      },
    ],
    config: {
      responseModalities: ["TEXT", "IMAGE"],
      imageConfig: { aspectRatio: "1:1" },
    },
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error(`Keine Antwort für ${view}`);

  for (const part of parts) {
    if (part.inlineData?.data && part.inlineData?.mimeType) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error(`Kein Bild generiert für ${view}`);
}

// Generate all 4 blueprint views from a product image
export async function generateBlueprintViews(firstImageUrl: string): Promise<string[]> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY nicht konfiguriert");
  }

  const ai = new GoogleGenAI({ apiKey });
  const imageBase64 = await urlToBase64(firstImageUrl);

  const results = await Promise.all(
    BLUEPRINT_VIEWS.map((view) => generateSingleBlueprint(ai, imageBase64, view))
  );

  return results;
}
