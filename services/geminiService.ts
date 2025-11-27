import { GoogleGenAI } from "@google/genai";

// 读取 API Key
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

// 通用函数：处理 Base64 图片格式
const prepareImageForAPI = (base64Image: string) => {
  const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
  const mimeTypeMatch = base64Image.match(/^data:(image\/[a-zA-Z]+);base64,/);
  const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/png';
  return { base64Data, mimeType };
};

// 功能 1：去水印 (你之前有的)
export const removeWatermarkFromImage = async (base64Image: string): Promise<string> => {
  if (!API_KEY) throw new Error("缺少 API 密钥 (VITE_GEMINI_API_KEY)");
  
  const { base64Data, mimeType } = prepareImageForAPI(base64Image);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: mimeType } },
          { text: "Remove all watermarks, text overlays, logos, and timestamps from this image. Reconstruct the background where the watermarks were removed to look completely natural and seamless. Return only the cleaned image." },
        ],
      },
    });
    return extractImageFromResponse(response);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "去水印失败");
  }
};

// 功能 2：画质增强 (这就是你报错缺失的那个！我现在把它补回来了)
export const enhanceImageQuality = async (base64Image: string): Promise<string> => {
  if (!API_KEY) throw new Error("缺少 API 密钥 (VITE_GEMINI_API_KEY)");

  const { base64Data, mimeType } = prepareImageForAPI(base64Image);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: mimeType } },
          { text: "Enhance the quality of this image. Remove noise, sharpen details, improve lighting and color balance. Make it look high resolution and professional. Return only the enhanced image." },
        ],
      },
    });
    return extractImageFromResponse(response);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "画质增强失败");
  }
};

// 辅助函数：从结果中提取图片
const extractImageFromResponse = (response: any) => {
  if (response.candidates && response.candidates[0].content.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  throw new Error("模型未返回图像");
};
