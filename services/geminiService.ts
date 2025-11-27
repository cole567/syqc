import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. 读取 API Key
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// 2. 初始化标准库
const genAI = new GoogleGenerativeAI(API_KEY);

// 3. 获取最稳的长期支持版本 (gemini-1.5-flash-001)
// 不要用 latest，不要用 pro，不要用 002，就用 001！
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });

// 辅助函数：处理 Base64
const prepareImagePart = (base64Image: string) => {
  const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
  const mimeTypeMatch = base64Image.match(/^data:(image\/[a-zA-Z]+);base64,/);
  const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/png';
  
  return {
    inlineData: {
      data: base64Data,
      mimeType: mimeType
    }
  };
};

// 功能 1：去水印
export const removeWatermarkFromImage = async (base64Image: string): Promise<string> => {
  if (!API_KEY) throw new Error("缺少 API 密钥");

  try {
    const imagePart = prepareImagePart(base64Image);
    const prompt = "Remove all watermarks, text, and logos from this image. Fill in the background naturally. Return only the cleaned image.";

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    console.log("API 响应:", text);
    
    // 如果没有抛出错误，说明连接成功了！
    // 再次提醒：免费版 API 大概率只能返回文字描述，无法返回修好的图
    throw new Error("连接成功！模型回复：" + text.slice(0, 100));

  } catch (error: any) {
    console.error("API Error:", error);
    if (error.message.includes("连接成功")) {
        throw error;
    }
    // 如果报 404，说明 001 也不行，那就是谷歌区域限制
    if (error.message.includes("404")) {
        throw new Error("谷歌服务在该区域不可用 (404 Not Found)，请尝试更换 API Key");
    }
    throw new Error(error.message || "请求失败");
  }
};

// 功能 2：画质增强
export const enhanceImageQuality = async (base64Image: string): Promise<string> => {
  if (!API_KEY) throw new Error("缺少 API 密钥");
  try {
    const imagePart = prepareImagePart(base64Image);
    const result = await model.generateContent(["Enhance image quality.", imagePart]);
    const response = await result.response;
    throw new Error("连接成功！模型回复：" + response.text().slice(0, 50));
  } catch (error: any) {
    throw new Error(error.message || "请求失败");
  }
};
