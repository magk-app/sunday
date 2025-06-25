import { NextRequest, NextResponse } from 'next/server';

// If using openai npm package, import and initialize here
// import OpenAI from 'openai';
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * POST /api/analyze-email
 * Request body: { body: string, subject?: string }
 * Response: { summary: string, tasks: string[], error?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { body, subject } = await req.json();
    if (!body) {
      return NextResponse.json({ error: 'Missing email body' }, { status: 400 });
    }

    // --- OpenAI API call ---
    // For now, use fetch to call OpenAI API directly (no openai npm dependency)
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing OpenAI API key' }, { status: 500 });
    }

    const prompt = `You are a helpful assistant. Summarize the following email in 1-2 sentences and extract any explicit tasks/action items as a bullet list. Keep language neutral and professional.\n\nSubject: ${subject || ''}\n\n${body}\n\nReturn in this exact format:\nSummary: <summary here>\nTasks:\n- <task 1>\n- <task 2>`;
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert email assistant.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 256,
        temperature: 0.3,
      }),
    });
    const data = await openaiRes.json();
    if (!openaiRes.ok) {
      return NextResponse.json({ error: data.error?.message || 'OpenAI API error' }, { status: 500 });
    }
    const content = data.choices?.[0]?.message?.content || '';
    // Simple parsing: look for 'Tasks:' section
    const [summary, ...taskLines] = content.split(/Tasks?:/i);
    const tasks = (taskLines.join('').match(/- (.+)/g) || []).map((t: string) => t.replace(/^- /, '').trim());
    return NextResponse.json({ summary: summary.trim(), tasks });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
} 