import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. 读取 API Key
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// 2. 初始化标准库 (GoogleGenerativeAI)
const genAI = new GoogleGenerativeAI(API_KEY);

// 3. 获取最通用的模型 (gemini-1.5-flash)
// 这个库会自动处理版本路径，不会报 404
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

    // 尝试解析由于这个库特性可能返回的复杂结构，通常它不直接返回图片数据流
    // 但鉴于我们是在做去水印，Gemini 大概率会拒绝直接返回 Base64 图片（因为它主要是个文本模型）
    // 如果它没返回图片，我们只能抛出错误提示用户。
    
    // 注意：Gemini 1.5 Flash 主要是多模态理解，不是绘图模型。
    // 如果它没返回图片数据，通常是 API 限制。但我们先确保连接成功。
    console.log("API 响应:", text);
    
    throw new Error("连接成功！但 Gemini 1.5 Flash 回复了文字：" + text.slice(0, 50) + "... (目前免费版 API 很难直接返回修好的图，但这证明 404 解决了)");

  } catch (error: any) {
    console.error("API Error:", error);
    // 过滤掉我们自己抛出的成功连接信息
    if (error.message.includes("连接成功")) {
        throw error;
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
