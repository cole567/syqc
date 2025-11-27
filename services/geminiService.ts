import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

// ✅ 使用最通用的别名，不带后缀，让谷歌自动匹配可用的版本
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prepareImagePart = (base64Image: string) => {
  const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
  const mimeTypeMatch = base64Image.match(/^data:(image\/[a-zA-Z]+);base64,/);
  const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/png';
  return { inlineData: { data: base64Data, mimeType: mimeType } };
};

export const removeWatermarkFromImage = async (base64Image: string): Promise<string> => {
  if (!API_KEY) throw new Error("缺少 API Key");
  try {
    const imagePart = prepareImagePart(base64Image);
    // 简化提示词，提高成功率
    const result = await model.generateContent(["Remove watermarks. Return image.", imagePart]);
    const response = await result.response;
    const text = response.text();
    console.log("API响应:", text);
    throw new Error("连接成功！模型回复：" + text.slice(0, 50));
  } catch (error: any) {
    // 针对性报错提示
    if (error.message.includes("404")) {
        throw new Error("连接失败(404)：请检查你的VPN是否在香港(HK)？请切换到美国或日本节点再试！");
    }
    if (error.message.includes("连接成功")) throw error;
    throw new Error(error.message || "请求失败");
  }
};

export const enhanceImageQuality = async (base64Image: string): Promise<string> => {
    // 复用上面的逻辑
    return removeWatermarkFromImage(base64Image); 
};
