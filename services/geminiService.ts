import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAIResponse = async (
  prompt: string,
  contextHistory: { role: string; content: string }[] = []
): Promise<string> => {
  try {
    // Construct the conversation history in the format expected by Gemini
    const contents = contextHistory.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    // Add the current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        systemInstruction: "Você é um usuário útil e amigável em um servidor do Discord. Suas respostas devem ser concisas, usar formatação Markdown (negrito, itálico, blocos de código) quando apropriado, e ter um tom casual. Se alguém pedir código, forneça-o formatado. Não seja excessivamente formal.",
      }
    });

    return response.text || "Desculpe, não consegui processar isso agora.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Ocorreu um erro ao contatar o Gemini. Verifique sua chave de API.";
  }
};