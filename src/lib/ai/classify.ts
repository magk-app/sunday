import type { EmailThread, Email } from '../../types';
import type { OpenAIResponse } from '../openai-service';
import { calculateCost } from './usage';

export async function classifyImportance(thread: EmailThread, messages: Email[]): Promise<OpenAIResponse<'urgent' | 'high' | 'medium' | 'low'>> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) return { success: false, error: 'Missing OpenAI API key' };
    const conversationText = messages.map(m => `${m.sender}: ${m.body}`).slice(0, 10).join('\n');
    const prompt = `You are a senior executive assistant. Based on the following conversation, classify the OVERALL urgency level as one of exactly these values: urgent, high, medium, low. Reply with ONLY the single word.\n\n${conversationText}`;
    const model = 'gpt-4o-nano';
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'user', content: prompt },
        ],
        max_tokens: 1,
        temperature: 0.0,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.error?.message || 'OpenAI API error' };
    }
    const classification = (data.choices?.[0]?.message?.content || '').trim().toLowerCase() as 'urgent' | 'high' | 'medium' | 'low';
    const cost = calculateCost(data.usage, model);
    return { success: true, data: classification, usage: { tokens: data.usage.total_tokens, cost, operation: 'analyze' } };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function analyzeEmail(email: Email): Promise<OpenAIResponse<{ summary: string; tasks: string[] }>> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) return { success: false, error: 'Missing OpenAI API key' };
    const prompt = `Analyze this email and provide:\n1. A brief summary\n2. Extract any tasks or action items\n\nEmail:\nSubject: ${email.subject}\nFrom: ${email.sender}\nBody: ${email.body}\n\nProvide response in this format:\nSummary: [brief summary]\nTasks:\n- [task 1 if any]\n- [task 2 if any]`;
    const analyzeModel = 'gpt-4o-mini';
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
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
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.error?.message || 'OpenAI API error' };
    }
    const content = data.choices?.[0]?.message?.content || '';
    const [summaryPart, ...taskParts] = content.split(/Tasks?:/i);
    const summary = summaryPart.replace('Summary:', '').trim();
    const tasks = (taskParts.join('').match(/- (.+)/g) || [])
      .map((t: string) => t.replace(/^- /, '').trim());
    const cost = calculateCost(data.usage, analyzeModel);
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