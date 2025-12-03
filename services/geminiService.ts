import { GoogleGenAI } from "@google/genai";
import { Project, Transaction, Category } from '../types';

// Initialize Gemini
// NOTE: process.env.API_KEY is expected to be available in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialAdvice = async (project: Project, transactions: Transaction[]): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
      return "AI services are currently unavailable. Please check your API configuration.";
    }

    if (transactions.length === 0) {
      return "Not enough data to analyze yet. Add some transactions to get AI insights!";
    }

    // Prepare context for the AI
    const summary = transactions.map(t => 
      `- ${t.date}: ${t.title} (${t.category}) - ${t.type === 'income' ? '+' : '-'}${t.amount}`
    ).join('\n');

    const prompt = `
      Analyze the financial health of the project "${project.name}".
      Here are the recent transactions:
      ${summary}

      Please provide:
      1. A brief summary of spending vs income.
      2. Identify any concerning trends or high expense categories.
      3. One actionable tip to improve the project's budget.
      
      Keep the response concise, encouraging, and formatted in Markdown. 
      Do not use complex jargon.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster simple analysis
      }
    });

    return response.text || "Could not generate insights at this time.";

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "An error occurred while generating AI insights. Please try again later.";
  }
};

export const categorizeTransaction = async (title: string, description: string, categories: Category[]): Promise<string> => {
    try {
        if (!process.env.API_KEY) return 'other';

        const categoryList = categories.map(c => `${c.id} (${c.name})`).join(', ');

        const prompt = `
            Given a transaction with title "${title}" and description "${description}", 
            categorize it into one of the following exact IDs: 
            [${categoryList}].
            
            Return ONLY the ID string (e.g., 'food' or 'custom_123').
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const text = response.text?.trim().toLowerCase();
        // Validation check
        const isValid = categories.some(c => c.id === text);
        return isValid ? text! : 'other';

    } catch (e) {
        return 'other';
    }
}