import { GoogleGenAI } from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// Initialize the client
const ai = new GoogleGenAI({ apiKey: API_KEY });

const getMimeTypeAndData = (base64Image: string) => {
  // Ensure the base64 string doesn't contain the data URL prefix for the API payload
  const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
  const mimeTypeMatch = base64Image.match(/^data:(image\/[a-zA-Z]+);base64,/);
  const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/png';
  return { base64Data, mimeType };
};

const processImageWithPrompt = async (base64Image: string, prompt: string): Promise<string> => {
  if (!API_KEY) {
    throw new Error("缺少 API 密钥。请检查您的配置。");
  }

  const { base64Data, mimeType } = getMimeTypeAndData(base64Image);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    // Iterate through parts to find the image output
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const resultBase64 = part.inlineData.data;
          return `data:image/png;base64,${resultBase64}`;
        }
      }
    }

    throw new Error("模型未返回图像。请求可能已被拒绝。");

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "处理图像失败。");
  }
};

/**
 * Sends an image to Gemini to remove watermarks.
 */
export const removeWatermarkFromImage = async (base64Image: string): Promise<string> => {
  return processImageWithPrompt(
    base64Image, 
    "Remove all watermarks, text overlays, logos, and timestamps from this image. Reconstruct the background where the watermarks were removed to look completely natural and seamless. Return only the cleaned image."
  );
};

/**
 * Sends an image to Gemini to enhance quality.
 */
export const enhanceImageQuality = async (base64Image: string): Promise<string> => {
  return processImageWithPrompt(
    base64Image,
    "Enhance this image to look like a high-definition photograph. Sharpen details, reduce noise, correct lighting and color balance, and improve overall clarity while maintaining the original subject matter faithfully. Return only the enhanced image."
  );
};
