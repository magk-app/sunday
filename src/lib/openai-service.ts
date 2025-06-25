import type { EmailThread, Email } from '../types';

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

// Cost per 1k tokens (approximate GPT-3.5-turbo pricing)
const COST_PER_1K_TOKENS = {
  input: 0.0015,
  output: 0.002,
};

class OpenAIService {
  private apiKey: string;
  private baseURL = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
  }

  private async makeRequest(endpoint: string, body: any): Promise<any> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API error');
    }

    return response.json();
  }

  private calculateCost(usage: any): number {
    const inputCost = (usage.prompt_tokens / 1000) * COST_PER_1K_TOKENS.input;
    const outputCost = (usage.completion_tokens / 1000) * COST_PER_1K_TOKENS.output;
    return inputCost + outputCost;
  }

  async summarizeThread(thread: EmailThread, messages: Email[]): Promise<OpenAIResponse<string>> {
    try {
      const conversationText = messages.map(msg => 
        `From: ${msg.sender}\nDate: ${msg.date}\n${msg.body}`
      ).join('\n\n---\n\n');

      const prompt = `Summarize this email thread in 1-2 concise sentences focusing on the main topic and current status:

Subject: ${thread.subject}
Participants: ${thread.participants.join(', ')}

Conversation:
${conversationText}

Summary:`;

      const data = await this.makeRequest('/chat/completions', {
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are SundayL, an AI chief-of-staff that reasons deeply over email history, knowledge base (people & projects), and metadata to create insightful, factual, terse summaries (1-2 sentences).' 
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 100,
        temperature: 0.3,
      });

      const summary = data.choices?.[0]?.message?.content?.trim() || 'Unable to generate summary';
      const cost = this.calculateCost(data.usage);

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

      const data = await this.makeRequest('/chat/completions', {
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are Jack (SundayL). Craft polished, context-aware replies grounded strictly in the conversation history and knowledge base. End with "Best regards, Jack".' 
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      const reply = data.choices?.[0]?.message?.content?.trim() || 'Unable to generate reply';
      const cost = this.calculateCost(data.usage);

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

      const data = await this.makeRequest('/chat/completions', {
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert email assistant that analyzes emails and extracts actionable information.' 
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 200,
        temperature: 0.3,
      });

      const content = data.choices?.[0]?.message?.content || '';
      const [summaryPart, ...taskParts] = content.split(/Tasks?:/i);
      const summary = summaryPart.replace('Summary:', '').trim();
      const tasks = (taskParts.join('').match(/- (.+)/g) || [])
        .map((t: string) => t.replace(/^- /, '').trim());

      const cost = this.calculateCost(data.usage);

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
}

export const openaiService = new OpenAIService(); 