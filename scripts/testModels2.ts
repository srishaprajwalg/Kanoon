import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const modelsToTest = ['gemini-3.5-flash', 'gemini-flash-latest', 'gemini-3.7-flash'];
  
  for (const model of modelsToTest) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: 'hello'
      });
      console.log(`${model} success!`);
    } catch (e: any) {
      console.log(`${model} error:`, e.message);
    }
  }
}
run();
