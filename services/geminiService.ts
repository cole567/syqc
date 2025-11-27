import { GoogleGenAI } from "@google/genai";

// 读取 API Key
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// 初始化 AI 客户端
const ai = new GoogleGenAI({ apiKey: API_KEY });

// 辅助函数：处理 Base64 图片
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
         console.log("模型返回文本:", part.text);
         throw new Error("AI 返回了文字而非图片，可能是因为该模型目前不支持图像编辑功能，或者图片过于复杂。AI回复：" + part.text.slice(0, 50));
      }
    }
  }
  throw new Error("模型未返回任何内容");
};

// 功能 1：去水印
export const removeWatermarkFromImage = async (base64Image: string): Promise<string> => {
  if (!API_KEY) throw new Error("缺少 API 密钥");
  
  const { base64Data, mimeType } = prepareImageForAPI(base64Image);

  try {
    const response = await ai.models.generateContent({
      // ✅✅✅ 这里改成了带版本号的全名，绝对存在！
      model: 'gemini-1.5-flash-002', 
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
    // 处理 429 请求过快
    if (error.message && error.message.includes('429')) {
       throw new Error("请求太快了，请休息 1 分钟后再试！");
    }
    // 处理 404 (虽然加了版本号应该不会了，但以防万一)
    if (error.message && error.message.includes('404')) {
        throw new Error("找不到模型，请检查 Google AI Studio 是否支持该区域。");
    }
    throw new Error(error.message || "去水印失败");
  }
};

// 功能 2：画质增强
export const enhanceImageQuality = async (base64Image: string): Promise<string> => {
  if (!API_KEY) throw new Error("缺少 API 密钥");

  const { base64Data, mimeType } = prepareImageForAPI(base64Image);

  try {
    const response = await ai.models.generateContent({
      // ✅✅✅ 这里也改成了带版本号的全名
      model: 'gemini-1.5-flash-002',
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
