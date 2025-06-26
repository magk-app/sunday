import type { EmailThread, Email, Project, Person } from '../../types';
import type { OpenAIResponse } from '../openai-service';
import { calculateCost } from './usage';

export async function analyzeThreadFull(thread: EmailThread, messages: Email[]): Promise<OpenAIResponse<{ summary: string; people: string[]; projects: string[] }>> {
  try {
    // Only allow server-side usage for security
    if (typeof window !== 'undefined') {
      throw new Error('OpenAI API key must not be exposed to the client. This function is server-only.');
    }
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return { success: false, error: 'Missing OpenAI API key' };
    const conversation = messages.map(m => `${m.sender}: ${m.body}`).join("\n---\n");
    const prompt = `You are an assistant that extracts structured knowledge from email threads.\nReturn STRICTLY valid JSON with keys summary, people (array of names or emails) and projects (array of project names).\n\nThread subject: ${thread.subject}\n\nConversation:\n${conversation}\n\nJSON:`;
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
          { role: 'system', content: 'Return concise JSON only.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 300,
        temperature: 0,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.error?.message || 'OpenAI API error' };
    }
    let json;
    try {
      json = JSON.parse(data.choices?.[0]?.message?.content || '{}');
    } catch {
      return { success: false, error: 'Failed to parse JSON' };
    }
    const cost = calculateCost(data.usage, model);
    return { success: true, data: json, usage: { tokens: data.usage.total_tokens, cost, operation: 'analyze' } };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function extractProjectsFromText(text: string): Promise<OpenAIResponse<Project[]>> {
  try {
    if (typeof window !== 'undefined') {
      throw new Error('OpenAI API key must not be exposed to the client. This function is server-only.');
    }
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return { success: false, error: 'Missing OpenAI API key' };
    const prompt = `Extract all project information from the following text. For each project, return a JSON object with keys: name, description, status, participants (array), tags (array). Return a JSON array of projects.\n\nText:\n${text}\n\nJSON:`;
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
          { role: 'system', content: 'Extract project information and return only valid JSON.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 400,
        temperature: 0,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.error?.message || 'OpenAI API error' };
    }
    let projects: Project[] = [];
    try {
      projects = JSON.parse(data.choices?.[0]?.message?.content || '[]');
    } catch {
      return { success: false, error: 'Failed to parse JSON' };
    }
    const cost = calculateCost(data.usage, model);
    return { success: true, data: projects, usage: { tokens: data.usage.total_tokens, cost, operation: 'analyze' } };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function generatePersonFromPrompt(prompt: string): Promise<OpenAIResponse<Person>> {
  try {
    if (typeof window !== 'undefined') {
      throw new Error('OpenAI API key must not be exposed to the client. This function is server-only.');
    }
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return { success: false, error: 'Missing OpenAI API key' };
    const fullPrompt = `Given the following description, generate a JSON object for a person with fields: name, email, phone, company, role, notes, tags (array), avatarUrl, summary. Return only valid JSON.\n\nDescription: ${prompt}\n\nJSON:
    
    Here is an example of a person:
    export interface Person {
        id: string;
        name: string;
        email: string;
        phone?: string;
        company?: string;
        role?: string;
        notes?: string;
        summary?: string; // Short summary for display/AI
        tags?: string[];
        avatarUrl?: string;
        // [admin] Add more fields as needed for extensibility
        [key: string]: any;
        }
    
        Ensure that the person object is valid JSON and that all the fields are present and that the fields are correct.
        
    `;
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
          { role: 'system', content: 'Generate a person object as valid JSON.' },
          { role: 'user', content: fullPrompt },
        ],
        max_tokens: 300,
        temperature: 0.2,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.error?.message || 'OpenAI API error' };
    }
    let raw = (data.choices?.[0]?.message?.content || '').trim();
    // Strip triple backtick fences if present
    if (raw.startsWith('```')) {
      raw = raw.replace(/```[a-zA-Z]*\n?/g, '').replace(/```/g, '').trim();
    }
    // Grab substring between first { and last }
    const first = raw.indexOf('{');
    const last = raw.lastIndexOf('}');
    if (first !== -1 && last !== -1) {
      raw = raw.substring(first, last + 1);
    }
    let person: Person;
    try {
      person = JSON.parse(raw);
    } catch {
      return { success: false, error: 'Failed to parse JSON' };
    }
    const cost = calculateCost(data.usage, model);
    return { success: true, data: person, usage: { tokens: data.usage.total_tokens, cost, operation: 'analyze' } };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function generateProjectFromPrompt(prompt: string): Promise<OpenAIResponse<Project>> {
  try {
    if (typeof window !== 'undefined') {
      throw new Error('OpenAI API key must not be exposed to the client. This function is server-only.');
    }
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return { success: false, error: 'Missing OpenAI API key' };
    const fullPrompt = `Given the following description, generate a JSON object for a project with fields: name, description, summary, status, participants (array), tags (array). Return only valid JSON.\n\nDescription: ${prompt}\n\nJSON:
    
    Here is an example of a project:
    export interface Project {
        id: string;
        user_id: string;
        name: string;
        description?: string;
        summary?: string; // Short summary for display/AI
        status?: 'active' | 'completed' | 'archived' | string;
        participants: string[]; // Person IDs
        tags?: string[];
        // [admin] Add more fields as needed for extensibility
        [key: string]: any;
    }

    Ensure that the project object is valid JSON and that all the fields are present and that the fields are correct.
    `;
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
          { role: 'system', content: 'Generate a project object as valid JSON.' },
          { role: 'user', content: fullPrompt },
        ],
        max_tokens: 300,
        temperature: 0.2,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.error?.message || 'OpenAI API error' };
    }
    let rawProj = (data.choices?.[0]?.message?.content || '').trim();
    if(rawProj.startsWith('```')){
      rawProj = rawProj.replace(/```[a-zA-Z]*\n?/g,'').replace(/```/g,'').trim();
    }
    const fp = rawProj.indexOf('{');
    const lp = rawProj.lastIndexOf('}');
    if(fp!==-1 && lp!==-1){ rawProj = rawProj.substring(fp, lp+1); }
    let project: Project;
    try {
      project = JSON.parse(rawProj);
    } catch {
      return { success: false, error: 'Failed to parse JSON' };
    }
    const cost = calculateCost(data.usage, model);
    return { success: true, data: project, usage: { tokens: data.usage.total_tokens, cost, operation: 'analyze' } };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
} 