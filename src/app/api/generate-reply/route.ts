import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/generate-reply
 * Request body: { threadSubject: string, participants: string[], messages: Array<{sender: string, body: string, date: string}> }
 * Response: { reply: string, usage?: { tokens: number, cost: number }, error?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { threadSubject, participants, messages } = await req.json();
    
    if (!threadSubject || !messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const conversationText = messages.map((msg: any) => 
      `From: ${msg.sender}\nDate: ${msg.date}\n${msg.body}`
    ).join('\n\n---\n\n');

    const prompt = `Based on this email conversation, generate a professional and contextually appropriate reply from Jack's perspective:

Subject: ${threadSubject}
Participants: ${participants.join(', ')}

Conversation history:
${conversationText}

Generate a reply that:
- Addresses the most recent message appropriately
- Maintains a professional yet friendly tone
- Is concise and actionable when possible
- Uses "Best regards, Jack" as the signature

Reply:`;

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: 'You are Jack, a professional and thoughtful email correspondent. Generate appropriate email replies that are contextual, helpful, and maintain good communication etiquette.' 
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    const data = await openaiRes.json();
    
    if (!openaiRes.ok) {
      return NextResponse.json({ error: data.error?.message || 'OpenAI API error' }, { status: 500 });
    }

    const reply = data.choices?.[0]?.message?.content?.trim() || 'Unable to generate reply';
    
    // Calculate approximate cost
    const inputCost = (data.usage.prompt_tokens / 1000) * 0.0015;
    const outputCost = (data.usage.completion_tokens / 1000) * 0.002;
    const totalCost = inputCost + outputCost;

    return NextResponse.json({ 
      reply, 
      usage: {
        tokens: data.usage.total_tokens,
        cost: totalCost,
      }
    });
  } catch (err: any) {
    console.error('Generate reply error:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
} 