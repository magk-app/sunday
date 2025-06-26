import React, { useState } from 'react';
import { Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle, ModalFooter } from './ui/modal';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import type { Project } from '../types';
import { generateProjectFromPrompt } from '../lib/ai/extract';

interface ProjectFormModalProps {
  existing?: Project | null;
  onSave: (p: Project) => void;
  triggerLabel: string;
}

export default function ProjectFormModal({ existing, onSave, triggerLabel }: ProjectFormModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<{ [k: string]: string }>(() => ({
    name: existing?.name || '',
    description: existing?.description || '',
    summary: existing?.summary || '',
    status: existing?.status || 'active',
    participants: (existing?.participants || []).join(', '),
    tags: (existing?.tags || []).join(', '),
  }));
  const [error, setError] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiPrompt, setShowAiPrompt] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) { setError('Please enter a description'); return; }
    setLoading(true);
    let prompt = '';
    if (existing) {
      prompt = `You are editing a project object. Here is the current data as JSON:\n${JSON.stringify(existing, null, 2)}\n\nUser edit instruction: ${aiPrompt.trim()}\n\nReturn a JSON object with ONLY the fields that should be changed, and leave all other fields out. Do NOT invent or change any field not explicitly mentioned by the user. If a field is not mentioned, do not include it in the output. Never generate or guess email, phone, participants, tags, or other fields unless the user provides them.`;
    } else {
      prompt = `You are creating a project object. The user provided this description: ${aiPrompt.trim()}\n\nReturn a JSON object with ONLY the fields that are explicitly mentioned in the description. Do NOT invent or guess any field not provided by the user. If a field is not mentioned, leave it blank or omit it. Never generate or guess email, phone, participants, tags, or other fields unless the user provides them.`;
    }
    const res = await generateProjectFromPrompt(prompt);
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
    if (!form.name) { setError('Name required'); return; }
    const project: Project = {
      id: existing?.id || `proj_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      user_id: existing?.user_id || 'user_jack',
      name: form.name,
      description: form.description,
      summary: form.summary,
      status: form.status as Project['status'],
      participants: form.participants.split(',').map(t=>t.trim()).filter(Boolean),
      tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean),
    };
    onSave(project);
    setOpen(false);
  };

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ModalTrigger asChild>
        <Button>{triggerLabel}</Button>
      </ModalTrigger>
      <ModalContent className="max-h-[90vh] overflow-y-auto">
        <ModalHeader>
          <ModalTitle>{existing ? 'Edit Project' : 'Add Project'}</ModalTitle>
        </ModalHeader>

        {/* Sections */}
        <h3 className="font-semibold mb-2 mt-4">Basics</h3>
        <div className="mb-2">
          <label className="text-xs font-semibold text-gray-700 mb-1 block" htmlFor="name">Project Name</label>
          <Input id="name" name="name" placeholder="e.g. Project Alpha" value={form.name} onChange={handleChange} />
        </div>
        <div className="mb-2">
          <label className="text-xs font-semibold text-gray-700 mb-1 block" htmlFor="description">Description</label>
          <Textarea id="description" name="description" placeholder="e.g. A short summary of the project..." value={form.description} onChange={handleChange} />
        </div>

        <h3 className="font-semibold mb-2 mt-6">Additional Details</h3>
        <div className="mb-2">
          <label className="text-xs font-semibold text-gray-700 mb-1 block" htmlFor="summary">Notes</label>
          <Input id="summary" name="summary" placeholder="e.g. Use this field for any extra notes or context" value={form.summary} onChange={handleChange} />
        </div>
        <div className="mb-2">
          <label className="text-xs font-semibold text-gray-700 mb-1 block" htmlFor="status">Status</label>
          <select id="status" name="status" value={form.status} onChange={handleChange} className="border p-2 rounded w-full">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="mb-2">
          <label className="text-xs font-semibold text-gray-700 mb-1 block" htmlFor="participants">Participants</label>
          <Input id="participants" name="participants" value={form.participants} onChange={handleChange} />
          <p className="text-xs text-gray-500 mt-1">Enter participants as comma-separated values</p>
        </div>
        <div className="mb-2">
          <label className="text-xs font-semibold text-gray-700 mb-1 block" htmlFor="tags">Tags</label>
          <Input id="tags" name="tags" placeholder="e.g. design, ai, research" value={form.tags} onChange={handleChange} />
        </div>

        {/* AI Assist */}
        <div className="mt-6">
          <button type="button" className="text-sm text-blue-600 hover:underline" onClick={()=>setShowAiPrompt(!showAiPrompt)}>
            {showAiPrompt ? 'Hide AI Assist' : (existing ? 'Edit with AI' : 'Generate with AI')}
          </button>
          {showAiPrompt && (
            <div className="mt-3 space-y-2">
              <Textarea placeholder="Describe the project..." value={aiPrompt} onChange={e=>setAiPrompt(e.target.value)} rows={3} />
              <Button variant="secondary" onClick={handleGenerateAI} disabled={loading}>{loading ? 'Generating...' : 'Run AI Assist'}</Button>
            </div>
          )}
        </div>

        {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}

        <ModalFooter>
          <Button onClick={handleSave} disabled={loading}>{existing ? 'Save' : 'Add'}</Button>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 