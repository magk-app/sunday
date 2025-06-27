import type { EmailThread, Email } from '../types';
import type { Project } from '../types';

export interface OpenAIUsage {
  tokens: number;
  cost: number;
  operation: 'summarize' | 'generate_reply' | 'analyze';
}

export interface OpenAIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  usage?: OpenAIUsage;
}

// Model-specific cost (per 1K tokens) based on OpenAI pricing 2025-06-25
// https://openai.com/pricing  
// NOTE: values are subject to change – keep in sync with docs
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'gpt-4o-mini': { input: 0.0005, output: 0.0015 }, // 4o-mini (previously 4.1 mini)
  'gpt-4o-nano': { input: 0.00025, output: 0.00075 }, // 4o-nano (hypothetical pricing)
  'gpt-4o': { input: 0.005, output: 0.015 }, // full 4o (previously 4.1)
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 }, // fallback
};

class OpenAIService {
  private baseURL = 'https://api.openai.com/v1';

  constructor() {
    // API key will be dynamically loaded in each request
  }

  private getApiKey(): string {
    // Try to get API key from multiple sources
    if (typeof window !== 'undefined') {
      // Client-side: check localStorage first, then settings
      const storedKey = localStorage.getItem('openai_api_key');
      if (storedKey) {
        console.log('[OpenAI] Found API key in localStorage (openai_api_key)');
        return storedKey;
      }
      
      // Check API keys from settings
      const apiKeysStr = localStorage.getItem('api_keys');
      if (apiKeysStr) {
        try {
          const apiKeys = JSON.parse(apiKeysStr);
          const openaiKey = apiKeys.find((key: any) => key.provider === 'openai' && key.isActive);
          if (openaiKey?.key) {
            console.log('[OpenAI] Found API key in settings (api_keys)');
            return openaiKey.key;
          }
        } catch (e) {
          console.warn('[OpenAI] Failed to parse API keys from localStorage');
        }
      }
      
      console.warn('[OpenAI] No API key found in localStorage');
    }
    
    // Server-side or fallback to environment variables
    const envKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY || '';
    if (envKey) {
      console.log('[OpenAI] Using environment variable API key');
    } else {
      console.error('[OpenAI] No API key found anywhere!');
    }
    return envKey;
  }

  private async makeRequest(endpoint: string, body: any): Promise<any> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      const error = 'Missing OpenAI API key. Please add it in Settings → AI → API Keys';
      console.error('[OpenAI]', error);
      throw new Error(error);
    }
    
    console.log(`[OpenAI] → POST ${endpoint}`);
    if (process.env.NODE_ENV === 'development') {
      console.log('[OpenAI] Request body:', body);
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      const json = await response.json();
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[OpenAI] ← Response from ${endpoint}:`, json);
      }

      if (!response.ok) {
        const errorMsg = json.error?.message || `HTTP ${response.status}: ${response.statusText}`;
        console.error('[OpenAI] API Error:', errorMsg);
        throw new Error(errorMsg);
      }

      return json;
    } catch (error) {
      console.error('[OpenAI] Network/Request Error:', error);
      throw error;
    }
  }

  private calculateCost(usage: any, model: string): number {
    const pricing = MODEL_PRICING[model] || MODEL_PRICING['gpt-3.5-turbo'];
    const inputCost = (usage.prompt_tokens / 1000) * pricing.input;
    const outputCost = (usage.completion_tokens / 1000) * pricing.output;
    return inputCost + outputCost;
  }

  /**
   * OpenAI Moderation endpoint – rejects content that is flagged.
   * Returns true if content is considered safe.
   */
  private async isContentSafe(text: string): Promise<boolean> {
    try {
      const apiKey = this.getApiKey();
      const res = await fetch(`${this.baseURL}/moderations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ input: text }),
      });
      const json = await res.json();
      if (!res.ok) return false;
      return !json.results?.[0]?.flagged;
    } catch {
      return true; // fail-open to avoid blocking – log elsewhere
    }
  }

  async summarizeThread(thread: EmailThread, messages: Email[], detailed: boolean = false): Promise<OpenAIResponse<string>> {
    try {
      const conversationText = messages.map(msg => 
        `From: ${msg.sender}\nDate: ${msg.date}\n${msg.body}`
      ).join('\n\n---\n\n');

      const prompt = `${detailed ? 'Provide a comprehensive multi-paragraph executive summary that covers every key message, decisions made, open questions, and next steps. Keep it factual, avoid speculation, and limit to ~4–6 short paragraphs.' : 'Summarize this email thread in 1-2 concise sentences focusing on the main topic and current status:'}

Subject: ${thread.subject}
Participants: ${thread.participants.join(', ')}

Conversation:
${conversationText}

Summary:`;

      const summarizeModel = 'gpt-4o-mini';
      const data = await this.makeRequest('/chat/completions', {
        model: summarizeModel,
        messages: [
          { 
            role: 'system', 
            content: 'You are SundayL, an AI chief-of-staff that reasons deeply over email history, knowledge base (people & projects), and metadata to create insightful, factual, terse summaries (1-2 sentences). Ensure the summary is safe and free of sensitive personal data.' 
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: detailed ? 300 : 120,
        temperature: 0.3,
      });

      const rawSummary = data.choices?.[0]?.message?.content?.trim() || '';
      const isSafe = await this.isContentSafe(rawSummary);
      const summary = isSafe ? rawSummary : '⚠️ Content removed due to safety flags.';
      const cost = this.calculateCost(data.usage, summarizeModel);

      if (process.env.NODE_ENV === 'development') {
        console.log('[OpenAIService] Generated summary:', summary);
      }

      return {
        success: true,
        data: summary,
        usage: {
          tokens: data.usage.total_tokens,
          cost,
          operation: 'summarize',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async generateReply(thread: EmailThread, messages: Email[]): Promise<OpenAIResponse<string>> {
    try {
      const conversationText = messages.map(msg => 
        `From: ${msg.sender}\nDate: ${msg.date}\n${msg.body}`
      ).join('\n\n---\n\n');

      const lastMessage = messages[messages.length - 1];
      
      const prompt = `Based on this email conversation, generate a professional and contextually appropriate reply from Jack's perspective:

Subject: ${thread.subject}
Participants: ${thread.participants.join(', ')}

Conversation history:
${conversationText}

Generate a reply that:
- Addresses the most recent message appropriately
- Maintains a professional yet friendly tone
- Is concise and actionable when possible
- Uses "Best regards, Jack" as the signature

Reply:`;

      const replyModel = 'gpt-4o';
      const data = await this.makeRequest('/chat/completions', {
        model: replyModel,
        messages: [
          { 
            role: 'system', 
            content: 'You are an AI executive assistant drafting professional, context-aware email replies grounded strictly in the conversation history and knowledge base. Maintain a helpful, respectful tone, avoid disallowed content, and do NOT fabricate information. Do not add a human signature – that will be appended later.' 
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 480,
        temperature: 0.7,
      });

      const rawReply = data.choices?.[0]?.message?.content?.trim() || '';
      const isSafe = await this.isContentSafe(rawReply);
      const reply = isSafe ? rawReply : '⚠️ AI reply removed due to safety flags.';
      const cost = this.calculateCost(data.usage, replyModel);

      if (process.env.NODE_ENV === 'development') {
        console.log('[OpenAIService] Generated reply:', reply);
      }

      return {
        success: true,
        data: reply,
        usage: {
          tokens: data.usage.total_tokens,
          cost,
          operation: 'generate_reply',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async analyzeEmail(email: Email): Promise<OpenAIResponse<{ summary: string; tasks: string[] }>> {
    try {
      const prompt = `Analyze this email and provide:
1. A brief summary
2. Extract any tasks or action items

Email:
Subject: ${email.subject}
From: ${email.sender}
Body: ${email.body}

Provide response in this format:
Summary: [brief summary]
Tasks:
- [task 1 if any]
- [task 2 if any]`;

      const analyzeModel = 'gpt-4o-mini';
      const data = await this.makeRequest('/chat/completions', {
        model: analyzeModel,
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert email assistant that analyzes emails and extracts actionable information.' 
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 256,
        temperature: 0.3,
      });

      const content = data.choices?.[0]?.message?.content || '';
      console.log('[OpenAIService] Analyze email raw content:', content);
      const [summaryPart, ...taskParts] = content.split(/Tasks?:/i);
      const summary = summaryPart.replace('Summary:', '').trim();
      const tasks = (taskParts.join('').match(/- (.+)/g) || [])
        .map((t: string) => t.replace(/^- /, '').trim());

      const cost = this.calculateCost(data.usage, analyzeModel);

      return {
        success: true,
        data: { summary, tasks },
        usage: {
          tokens: data.usage.total_tokens,
          cost,
          operation: 'analyze',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Classify the importance (urgent | high | medium | low) of an email thread.
   */
  async classifyImportance(thread: EmailThread, messages: Email[]): Promise<OpenAIResponse<'urgent' | 'high' | 'medium' | 'low'>> {
    try {
      const conversationText = messages.map(m => `${m.sender}: ${m.body}`).slice(0, 10).join('\n');
      const prompt = `You are a senior executive assistant. Based on the following conversation, classify the OVERALL urgency level as one of exactly these values: urgent, high, medium, low. Reply with ONLY the single word.\n\n${conversationText}`;

      const model = 'gpt-4o-nano';
      const data = await this.makeRequest('/chat/completions', {
        model,
        messages: [
          { role: 'user', content: prompt },
        ],
        max_tokens: 1,
        temperature: 0.0,
      });

      const classification = (data.choices?.[0]?.message?.content || '').trim().toLowerCase() as 'urgent' | 'high' | 'medium' | 'low';
      const cost = this.calculateCost(data.usage, model);

      return { success: true, data: classification, usage: { tokens: data.usage.total_tokens, cost, operation: 'analyze' } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async analyzeThreadFull(thread: EmailThread, messages: Email[]): Promise<OpenAIResponse<{ summary: string; people: string[]; projects: string[] }>> {
    try {
      const conversation = messages.map(m => `${m.sender}: ${m.body}`).join("\n---\n");
      const prompt = `You are an assistant that extracts structured knowledge from email threads.\nReturn STRICTLY valid JSON with keys summary, people (array of names or emails) and projects (array of project names).\n\nThread subject: ${thread.subject}\n\nConversation:\n${conversation}\n\nJSON:`;

      const model = 'gpt-4o';
      const data = await this.makeRequest('/chat/completions', {
        model,
        messages: [
          { role: 'system', content: 'Return concise JSON only.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 300,
        temperature: 0,
      });

      let json;
      try {
        json = JSON.parse(data.choices?.[0]?.message?.content || '{}');
      } catch {
        return { success: false, error: 'Failed to parse JSON' };
      }

      const cost = this.calculateCost(data.usage, model);
      return { success: true, data: json, usage: { tokens: data.usage.total_tokens, cost, operation: 'analyze' } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Improve an AI reply based on user suggestions
   */
  async improveReply(originalReply: string, userSuggestion: string, threadContext?: string): Promise<OpenAIResponse<string>> {
    try {
      const prompt = `You are an AI assistant helping to improve email replies. The user has suggested an improvement to the current draft.

Original Reply:
${originalReply}

User Suggestion:
${userSuggestion}

${threadContext ? `Thread Context:\n${threadContext}\n` : ''}

Please provide an improved version of the reply that incorporates the user's suggestion while maintaining a professional tone and appropriate context. Keep the core message but enhance it based on the feedback.

Improved Reply:`;

      const model = 'gpt-4o';
      const data = await this.makeRequest('/chat/completions', {
        model,
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert email assistant that improves drafts based on user feedback. Maintain professionalism while incorporating suggestions.' 
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 480,
        temperature: 0.7,
      });

      const improvedReply = data.choices?.[0]?.message?.content?.trim() || '';
      const isSafe = await this.isContentSafe(improvedReply);
      const reply = isSafe ? improvedReply : '⚠️ Improved reply removed due to safety flags.';
      const cost = this.calculateCost(data.usage, model);

      if (process.env.NODE_ENV === 'development') {
        console.log('[OpenAIService] Generated improved reply:', reply);
      }

      return {
        success: true,
        data: reply,
        usage: {
          tokens: data.usage.total_tokens,
          cost,
          operation: 'generate_reply',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Simulate streaming for improved reply (for now, until we implement real streaming)
   */
  async *improveReplyStream(originalReply: string, userSuggestion: string, threadContext?: string): AsyncGenerator<string, void, unknown> {
    // First get the full improved reply
    const result = await this.improveReply(originalReply, userSuggestion, threadContext);
    
    if (!result.success || !result.data) {
      yield result.error || 'Failed to improve reply';
      return;
    }

    const fullReply = result.data;
    const words = fullReply.split(' ');
    
    // Simulate streaming by yielding words with realistic delays
    let currentText = '';
    for (let i = 0; i < words.length; i++) {
      currentText += (i > 0 ? ' ' : '') + words[i];
      yield currentText;
      
      // Add realistic delays between words (50-150ms)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
    }
  }

  /**
   * Extract projects from freeform text using OpenAI.
   * Returns an array of project objects (name, description, status, participants, tags).
   */
  async extractProjectsFromText(text: string): Promise<OpenAIResponse<Project[]>> {
    try {
      const prompt = `Extract all project information from the following text. For each project, return a JSON object with keys: name, description, status, participants (array), tags (array). Return a JSON array of projects.\n\nText:\n${text}\n\nJSON:`;
      const model = 'gpt-4o';
      const data = await this.makeRequest('/chat/completions', {
        model,
        messages: [
          { role: 'system', content: 'Extract project information and return only valid JSON.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 400,
        temperature: 0,
      });
      let projects: Project[] = [];
      try {
        projects = JSON.parse(data.choices?.[0]?.message?.content || '[]');
      } catch {
        return { success: false, error: 'Failed to parse JSON' };
      }
      const cost = this.calculateCost(data.usage, model);
      return { success: true, data: projects, usage: { tokens: data.usage.total_tokens, cost, operation: 'analyze' } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const openaiService = new OpenAIService();
export * from './ai'; 