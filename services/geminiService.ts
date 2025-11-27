import { GoogleGenAI } from "@google/genai";

// 确保这里用的是 import.meta.env.VITE_GEMINI_API_KEY
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const removeWatermarkFromImage = async (base64Image: string): Promise<string> => {
  if (!API_KEY) {
    throw new Error("API Key 未配置，请在 Vercel 环境变量中设置 VITE_GEMINI_API_KEY");
  }

  // 去掉 base64 头部，API 需要纯数据
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
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image returned");
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Processing failed");
  }
};
