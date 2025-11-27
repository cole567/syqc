import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

// ⚡️ 换成了 gemini-1.5-pro，这是最稳的大哥模型
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

const prepareImagePart = (base64Image: string) => {
  const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
  const mimeTypeMatch = base64Image.match(/^data:(image\/[a-zA-Z]+);base64,/);
  const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/png';
  return { inlineData: { data: base64Data, mimeType: mimeType } };
};

export const removeWatermarkFromImage = async (base64Image: string): Promise<string> => {
  if (!API_KEY) throw new Error("缺少 API 密钥");
  try {
    const imagePart = prepareImagePart(base64Image);
    const prompt = "Remove all watermarks and text from this image. Return the cleaned image.";
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    console.log("API 响应:", text);
    throw new Error("连接成功！模型回复：" + text.slice(0, 50));
  } catch (error: any) {
    if (error.message.includes("连接成功")) throw error;
    throw new Error(error.message || "请求失败");
  }
};

export const enhanceImageQuality = async (base64Image: string): Promise<string> => {
  if (!API_KEY) throw new Error("缺少 API 密钥");
  try {
    const imagePart = prepareImagePart(base64Image);
    const result = await model.generateContent(["Enhance quality", imagePart]);
    const response = await result.response;
    throw new Error("连接成功！模型回复：" + response.text().slice(0, 50));
  } catch (error: any) {
    throw new Error(error.message || "请求失败");
  }
};
