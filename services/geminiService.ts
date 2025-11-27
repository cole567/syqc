import { GoogleGenAI } from "@google/genai";

// 读取 API Key
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// 初始化 AI 客户端
const ai = new GoogleGenAI({ apiKey: API_KEY });

// 辅助函数：处理 Base64 图片格式
const prepareImageForAPI = (base64Image: string) => {
  const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
  const mimeTypeMatch = base64Image.match(/^data:(image\/[a-zA-Z]+);base64,/);
  const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/png';
  return { base64Data, mimeType };
};

// 辅助函数：提取结果
const extractResponse = (response: any) => {
  if (response.candidates && response.candidates[0].content.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
      if (part.text) {
         console.log("模型返回了文本:", part.text);
         // 如果模型还是不给图，我们就把它的借口展示出来
         throw new Error("AI 无法生成图片，它说：" + part.text.slice(0, 100));
      }
    }
  }
  throw new Error("模型未返回任何内容");
};

// 功能 1：去水印
export const removeWatermarkFromImage = async (base64Image: string): Promise<string> => {
  if (!API_KEY) throw new Error("缺少 API 密钥 (VITE_GEMINI_API_KEY)");
  
  const { base64Data, mimeType } = prepareImageForAPI(base64Image);

  try {
    const response = await ai.models.generateContent({
      // ✅ 改回了最稳定的 1.5 Flash
      model: 'gemini-1.5-flash', 
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: mimeType } },
          { text: "Remove all watermarks from this image. Return the cleaned image." },
        ],
      },
    });
    return extractResponse(response);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message && error.message.includes('429')) {
       throw new Error("免费额度请求太快，请喝口水，休息 1 分钟后再试！");
    }
    throw new Error(error.message || "去水印失败");
  }
};

// 功能 2：画质增强
export const enhanceImageQuality = async (base64Image: string): Promise<string> => {
  if (!API_KEY) throw new Error("缺少 API 密钥 (VITE_GEMINI_API_KEY)");

  const { base64Data, mimeType } = prepareImageForAPI(base64Image);

  try {
    const response = await ai.models.generateContent({
      // ✅ 改回了最稳定的 1.5 Flash
      model: 'gemini-1.5-flash',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: mimeType } },
          { text: "Enhance image quality. Return the enhanced image." },
        ],
      },
    });
    return extractResponse(response);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "画质增强失败");
  }
};
