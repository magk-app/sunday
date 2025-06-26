import React, { useState } from 'react';
import { Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle, ModalFooter } from './ui/modal';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import type { Person } from '../types';
import { generatePersonFromPrompt } from '../lib/ai/extract';

interface PersonFormModalProps {
  existing?: Person | null;
  onSave: (p: Person) => void;
  triggerLabel?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function PersonFormModal({ existing, onSave, triggerLabel, open: controlledOpen, onOpenChange }: PersonFormModalProps) {
  const [open, setOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const modalOpen = isControlled ? controlledOpen : open;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<{ [k: string]: string }>(() => ({
    name: existing?.name || '',
    email: existing?.email || '',
    phone: existing?.phone || '',
    company: existing?.company || '',
    role: existing?.role || '',
    summary: existing?.summary || '',
    notes: existing?.notes || '',
    tags: (existing?.tags || []).join(', '),
    avatarUrl: existing?.avatarUrl || '',
  }));
  const [error, setError] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiPrompt, setShowAiPrompt] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) { setError('Please enter a description for AI assist'); return; }
    setLoading(true);
    let prompt = '';
    if (existing) {
      prompt = `You are editing a person object. Here is the current data as JSON:\n${JSON.stringify(existing, null, 2)}\n\nUser edit instruction: ${aiPrompt.trim()}\n\nReturn a JSON object with ONLY the fields that should be changed, and leave all other fields out. Do NOT invent or change any field not explicitly mentioned by the user. If a field is not mentioned, do not include it in the output. Never generate or guess email, phone, participants, tags, or other fields unless the user provides them.`;
    } else {
      prompt = `You are creating a person object. The user provided this description: ${aiPrompt.trim()}\n\nReturn a JSON object with ONLY the fields that are explicitly mentioned in the description. Do NOT invent or guess any field not provided by the user. If a field is not mentioned, leave it blank or omit it. Never generate or guess email, phone, participants, tags, or other fields unless the user provides them.`;
    }
    const res = await generatePersonFromPrompt(prompt);
    setLoading(false);
    if (res.success && res.data) {
      const merged: Record<string, string> = { ...form };
      Object.entries(res.data).forEach(([k, v]) => {
        if (v === undefined || v === null || v === '' || v === 'N/A') return;
        const val = Array.isArray(v) ? v.join(', ') : (v ?? '').toString();
        if (val && val.trim() !== '') {
          merged[k] = val;
        }
      });
      setForm(merged);
      setAiPrompt('');
      setShowAiPrompt(false);
    } else {
      setError(res.error || 'Failed to generate');
    }
  };

  const handleSave = () => {
    if (!form.name || !form.email) { setError('Name and email required'); return; }
    const person: Person = {
      id: existing?.id || `p_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      name: form.name,
      email: form.email,
      phone: form.phone,
      company: form.company,
      role: form.role,
      notes: form.notes,
      summary: form.summary,
      tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean),
      avatarUrl: form.avatarUrl,
    };
    onSave(person);
    setOpen(false);
  };

  return (
    <Modal open={modalOpen} onOpenChange={isControlled ? onOpenChange : setOpen}>
      {!isControlled && Boolean(triggerLabel) && (
        <ModalTrigger asChild>
          <Button>{triggerLabel}</Button>
        </ModalTrigger>
      )}
      <ModalContent className="max-h-[90vh] overflow-y-auto">
        <ModalHeader>
          <ModalTitle>{existing ? 'Edit Person' : 'Add Person'}</ModalTitle>
        </ModalHeader>

        {/* Section 1: Basic */}
        <h3 className="font-semibold mb-2 mt-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block" htmlFor="name">Name</label>
            <Input id="name" name="name" placeholder="e.g. John Doe" value={form.name} onChange={handleChange} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block" htmlFor="email">Email</label>
            <Input id="email" name="email" placeholder="e.g. john@example.com" value={form.email} onChange={handleChange} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block" htmlFor="phone">Phone</label>
            <Input id="phone" name="phone" placeholder="e.g. +1 555-1234" value={form.phone} onChange={handleChange} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block" htmlFor="avatarUrl">Avatar URL</label>
            <Input id="avatarUrl" name="avatarUrl" placeholder="e.g. https://..." value={form.avatarUrl} onChange={handleChange} />
          </div>
        </div>

        {/* Section 2: Work */}
        <h3 className="font-semibold mb-2 mt-6">Work</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block" htmlFor="company">Company</label>
            <Input id="company" name="company" placeholder="e.g. Acme Corp" value={form.company} onChange={handleChange} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block" htmlFor="role">Role</label>
            <Input id="role" name="role" placeholder="e.g. Product Manager" value={form.role} onChange={handleChange} />
          </div>
        </div>

        {/* Section 3: Meta */}
        <h3 className="font-semibold mb-2 mt-6">Additional Details</h3>
        <div className="mb-2">
          <label className="text-xs font-semibold text-gray-700 mb-1 block" htmlFor="summary">Summary</label>
          <Textarea id="summary" name="summary" placeholder="e.g. Key skills, summary, etc." value={form.summary} onChange={handleChange} />
        </div>
        <div className="mb-2">
          <label className="text-xs font-semibold text-gray-700 mb-1 block" htmlFor="notes">Notes</label>
          <Textarea id="notes" name="notes" placeholder="e.g. Any extra notes or context" value={form.notes} onChange={handleChange} />
        </div>
        <div className="mb-2">
          <label className="text-xs font-semibold text-gray-700 mb-1 block" htmlFor="tags">Tags</label>
          <Input id="tags" name="tags" placeholder="e.g. design, ai, research" value={form.tags} onChange={handleChange} />
        </div>

        {/* AI Assist Section */}
        <div className="mt-6">
          <button type="button" className="text-sm text-blue-600 hover:underline" onClick={()=>setShowAiPrompt(!showAiPrompt)}>
            {showAiPrompt ? 'Hide AI Assist' : (existing ? 'Edit with AI' : 'Generate with AI')}
          </button>
          {showAiPrompt && (
            <div className="mt-3 space-y-2">
              <Textarea placeholder="Describe the person..." value={aiPrompt} onChange={e=>setAiPrompt(e.target.value)} rows={3} />
              <Button variant="secondary" onClick={handleGenerateAI} disabled={loading}>{loading ? 'Generating...' : 'Run AI Assist'}</Button>
            </div>
          )}
        </div>

        {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}

        <ModalFooter>
          <button type="button" className="block w-full text-left px-3 py-1 text-sm hover:bg-gray-100 rounded transition" onClick={handleSave} disabled={loading}>{existing ? 'Save' : 'Add'}</button>
          <button type="button" className="block w-full text-left px-3 py-1 text-sm hover:bg-gray-100 rounded transition" onClick={() => setOpen(false)}>Cancel</button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 