import { GoogleGenAI } from "@google/genai";

// ✅ 修改点：使用 import.meta.env 读取 Vite 的环境变量
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// Initialize the client
const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Sends an image to Gemini to remove watermarks.
 * Uses the gemini-2.5-flash-image model for image-to-image editing tasks.
 */
export const removeWatermarkFromImage = async (base64Image: string): Promise<string> => {
  if (!API_KEY) {
    throw new Error("缺少 API 密钥。请检查 Vercel 的环境变量设置 (VITE_GEMINI_API_KEY)。");
  }

  // Ensure the base64 string doesn't contain the data URL prefix for the API payload
  const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
  const mimeTypeMatch = base64Image.match(/^data:(image\/[a-zA-Z]+);base64,/);
  const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/png';

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
            text: "Remove all watermarks, text overlays, logos, and timestamps from this image. Reconstruct the background where the watermarks were removed to look completely natural and seamless. Return only the cleaned image.",
          },
        ],
      },
    });

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
