import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3.0-flash',
    contents: 'hello'
  }).catch(e => console.log('3.0-flash error:', e.message));
  if (response) console.log('3.0-flash success!');

  const response2 = await ai.models.generateContent({
    model: 'gemini-3-flash',
    contents: 'hello'
  }).catch(e => console.log('3-flash error:', e.message));
  if (response2) console.log('3-flash success!');
  
  const response3 = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: 'hello'
  }).catch(e => console.log('2.0-flash error:', e.message));
  if (response3) console.log('2.0-flash success!');
}
run();
