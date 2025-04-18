
import { ExplanationResponse } from "../types/article";
import { toast } from "sonner";

const API_KEY = "AIzaSyDvJ23IolKwjdxAnTv7l8DwLuwGRZ_tIR8"; // This is the same API key used for Google Sheets
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

export async function getArticleExplanation(articleNumber: string, articleContent: string): Promise<ExplanationResponse | null> {
  try {
    const formalPrompt = `Explique o seguinte artigo jurídico de forma detalhada: ${articleContent}`;
    const technicalPrompt = `Forneça uma análise técnica e jurídica do seguinte artigo: ${articleContent}`;
    const examplePrompt = `Forneça um exemplo prático do seguinte artigo jurídico: ${articleContent}`;

    const [formalResponse, technicalResponse, exampleResponse] = await Promise.all([
      fetchGeminiResponse(formalPrompt),
      fetchGeminiResponse(technicalPrompt),
      fetchGeminiResponse(examplePrompt)
    ]);

    return {
      formal: formalResponse || "Não foi possível gerar uma explicação formal.",
      technical: technicalResponse || "Não foi possível gerar uma análise técnica.",
      example: exampleResponse || "Não foi possível gerar um exemplo prático."
    };
  } catch (error) {
    console.error("Error generating article explanation:", error);
    toast.error("Erro ao gerar explicação do artigo");
    return null;
  }
}

export async function summarizeArticle(articleNumber: string, articleContent: string): Promise<string | null> {
  try {
    const prompt = `Resuma o seguinte artigo jurídico em no máximo 5 linhas, destacando apenas os pontos essenciais:\n${articleContent}`;
    
    const summary = await fetchGeminiResponse(prompt);
    return summary;
  } catch (error) {
    console.error("Error summarizing article:", error);
    toast.error("Erro ao resumir o artigo");
    return null;
  }
}

export async function askQuestion(articleNumber: string, articleContent: string, question: string): Promise<string | null> {
  try {
    const prompt = `Com base no seguinte artigo jurídico:\n"${articleContent}"\n\nResponda à seguinte pergunta de forma clara e concisa:\n${question}`;
    
    const answer = await fetchGeminiResponse(prompt);
    return answer;
  } catch (error) {
    console.error("Error asking question:", error);
    return null;
  }
}

async function fetchGeminiResponse(prompt: string): Promise<string | null> {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error) {
    console.error("Error fetching from Gemini API:", error);
    return null;
  }
}
