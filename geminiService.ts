import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GeminiAnalysisResponse, ValueTag } from "../types";

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

const SYSTEM_PROMPT = `Sen bir karar analizi asistanısın. Kullanıcının verdiği kararı analiz edip JSON formatında yanıt vereceksin.

Analiz edeceğin değer kategorileri:
- özgürlük, güvenlik, kariyer, aile, sağlık, finans, kişisel_gelişim, ilişkiler, macera, yaratıcılık

Her değer için 0-10 arası skor ver. Sadece kararı güçlü şekilde etkileyen değerleri dahil et (skor >= 5).

Yanıt formatı (sadece JSON, başka metin yok):
{
  "values": [
    {"name": "kariyer", "score": 8, "icon": "briefcase"}
  ],
  "analysis": "Kısa analiz metni (2-3 cümle)",
  "followUpQuestions": ["Soru 1?", "Soru 2?", "Soru 3?"]
}

icon mapping:
- özgürlük: feather
- güvenlik: shield
- kariyer: briefcase
- aile: home
- sağlık: heart
- finans: dollar-sign
- kişisel_gelişim: trending-up
- ilişkiler: users
- macera: compass
- yaratıcılık: palette`;

export async function analyzeDecision(
  decisionText: string
): Promise<GeminiAnalysisResponse> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: `${SYSTEM_PROMPT}\n\nKarar: ${decisionText}` }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      responseMimeType: "application/json",
    },
  });

  const response = await result.response;
  const text = response.text();

  try {
    const parsed = JSON.parse(text) as GeminiAnalysisResponse;
    return parsed;
  } catch {
    const cleaned = text.replace(/```json\s?/g, "").replace(/```\s?/g, "").trim();
    return JSON.parse(cleaned) as GeminiAnalysisResponse;
  }
}

export async function generateFollowUpResponse(
  decisionText: string,
  userAnswers: string[]
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Kullanıcı bir karar hakkında sorulara yanıt verdi. Kararı netleştirmesine yardımcı olacak kısa bir özet yaz (max 3 cümle).

Karar: ${decisionText}
Kullanıcı yanıtları: ${userAnswers.join(", ")}`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 200 },
  });

  return (await result.response).text();
}
