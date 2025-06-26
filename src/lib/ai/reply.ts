import type { EmailThread, Email } from '../../types';
import type { OpenAIResponse } from '../openai-service';
import { calculateCost } from './usage';

export async function generateReply(thread: EmailThread, messages: Email[]): Promise<OpenAIResponse<string>> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) return { success: false, error: 'Missing OpenAI API key' };
    const conversationText = messages.map(msg => 
      `From: ${msg.sender}\nDate: ${msg.date}\n${msg.body}`
    ).join('\n\n---\n\n');
    const prompt = `Based on this email conversation, generate a professional and contextually appropriate reply from Jack's perspective:\n\nSubject: ${thread.subject}\nParticipants: ${thread.participants.join(', ')}\n\nConversation history:\n${conversationText}\n\nGenerate a reply that:\n- Addresses the most recent message appropriately\n- Maintains a professional yet friendly tone\n- Is concise and actionable when possible\n- Uses "Best regards, Jack" as the signature\n\nReply:`;
    const replyModel = 'gpt-4o';
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
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
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.error?.message || 'OpenAI API error' };
    }
    const rawReply = data.choices?.[0]?.message?.content?.trim() || '';
    const reply = rawReply;
    const cost = calculateCost(data.usage, replyModel);
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

export async function improveReply(originalReply: string, userSuggestion: string, threadContext?: string): Promise<OpenAIResponse<string>> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) return { success: false, error: 'Missing OpenAI API key' };
    const prompt = `You are an AI assistant helping to improve email replies. The user has suggested an improvement to the current draft.\n\nOriginal Reply:\n${originalReply}\n\nUser Suggestion:\n${userSuggestion}\n\n${threadContext ? `Thread Context:\n${threadContext}\n` : ''}\n\nPlease provide an improved version of the reply that incorporates the user's suggestion while maintaining a professional tone and appropriate context. Keep the core message but enhance it based on the feedback.\n\nImproved Reply:`;
    const model = 'gpt-4o';
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
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
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.error?.message || 'OpenAI API error' };
    }
    const improvedReply = data.choices?.[0]?.message?.content?.trim() || '';
    const reply = improvedReply;
    const cost = calculateCost(data.usage, model);
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

export async function* improveReplyStream(originalReply: string, userSuggestion: string, threadContext?: string): AsyncGenerator<string, void, unknown> {
  // First get the full improved reply
  const result = await improveReply(originalReply, userSuggestion, threadContext);
  if (!result.success || !result.data) {
    yield result.error || 'Failed to improve reply';
    return;
  }
  const fullReply = result.data;
  const words = fullReply.split(' ');
  let currentText = '';
  for (let i = 0; i < words.length; i++) {
    currentText += (i > 0 ? ' ' : '') + words[i];
    yield currentText;
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
  }
} 