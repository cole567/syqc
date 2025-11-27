import { GoogleGenAI } from "@google/genai";

// 读取 API Key
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// 初始化 AI 客户端
const ai = new GoogleGenAI({ apiKey: API_KEY });

// 辅助函数：处理 Base64 图片格式
const prepareImageForAPI = (base64Image: string) => {
  // 去掉 data:image/png;base64, 这样的头部，只保留纯字符
  const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
  const mimeTypeMatch = base64Image.match(/^data:(image\/[a-zA-Z]+);base64,/);
  const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/png';
  return { base64Data, mimeType };
};

// 辅助函数：从结果中提取文本或图片
// 注意：目前的 Gemini 模型主要返回文本，如果模型不支持直接返回图片，这个函数会尝试提取文本描述以避免报错。
const extractResponse = (response: any) => {
  if (response.candidates && response.candidates[0].content.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
      if (part.text) {
         // 如果模型只返回了文字（例如“我无法编辑图片”），我们在控制台打印出来，防止前端崩掉
         console.log("模型返回了文本:", part.text);
         // 这里我们可以选择抛出错误，或者返回一个占位符。
         // 为了让用户知道发生了什么，我们抛出具体的错误。
         throw new Error("模型无法生成图片，仅返回了文字描述：" + part.text.slice(0, 50) + "...");
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
      // ✅ 修正点：使用最新的 Gemini 2.0 实验版模型
      model: 'gemini-2.0-flash-exp', 
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
    // 如果是 429 错误，提示用户休息一下
    if (error.message && error.message.includes('429')) {
       throw new Error("请求太快了，请休息 1 分钟后再试！(429)");
    }
    // 如果是 404 错误，提示模型不对
    if (error.message && error.message.includes('404')) {
        throw new Error("模型名称错误或地区不支持 (404)");
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
      // ✅ 修正点：使用最新的 Gemini 2.0 实验版模型
      model: 'gemini-2.0-flash-exp',
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
