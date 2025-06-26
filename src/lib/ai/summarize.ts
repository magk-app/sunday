import type { EmailThread, Email } from '../../types';
import type { OpenAIResponse } from '../openai-service';
import { calculateCost } from './usage';

// This will be moved from openai-service.ts
export async function summarizeThread(thread: EmailThread, messages: Email[], detailed: boolean = false): Promise<OpenAIResponse<string>> {
  try {
    // Only allow server-side usage for security
    if (typeof window !== 'undefined') {
      throw new Error('OpenAI API key must not be exposed to the client. This function is server-only.');
    }
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return { success: false, error: 'Missing OpenAI API key' };
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
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
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
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.error?.message || 'OpenAI API error' };
    }
    const rawSummary = data.choices?.[0]?.message?.content?.trim() || '';
    // No moderation endpoint for now
    const summary = rawSummary;
    const cost = calculateCost(data.usage, summarizeModel);
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