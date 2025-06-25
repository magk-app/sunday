'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState<string>(
    localStorage.getItem('openai_api_key') || ''
  );
  const [tokenUsage, setTokenUsage] = useState<number>(0);
  const [cost, setCost] = useState<number>(0);

  const [profile, setProfile] = useState({
    name: localStorage.getItem('profile_name') || '',
    email: localStorage.getItem('profile_email') || '',
    avatar: localStorage.getItem('profile_avatar') || '',
  });

  useEffect(() => {
    const load = () => {
      setTokenUsage(Number(localStorage.getItem('usage_tokens') || '0'));
      setCost(Number(localStorage.getItem('usage_cost') || '0'));
    };
    load();
    const handler = () => load();
    window.addEventListener('usage-updated', handler);
    return () => window.removeEventListener('usage-updated', handler);
  }, []);

  const discounted = cost * 0.5;

  const saveApiKey = () => {
    localStorage.setItem('openai_api_key', apiKey);
    alert('API key saved');
  };

  const saveProfile = () => {
    localStorage.setItem('profile_name', profile.name);
    localStorage.setItem('profile_email', profile.email);
    localStorage.setItem('profile_avatar', profile.avatar);
    alert('Profile saved');
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">Settings & Usage</h1>

      <Card className="p-4 space-y-4">
        <h2 className="font-semibold">Profile</h2>
        <input
          placeholder="Name"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          className="w-full border p-2 rounded"
        />
        <input
          placeholder="Email"
          value={profile.email}
          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          className="w-full border p-2 rounded"
        />
        <input
          placeholder="Avatar URL"
          value={profile.avatar}
          onChange={(e) => setProfile({ ...profile, avatar: e.target.value })}
          className="w-full border p-2 rounded"
        />
        <Button size="sm" onClick={saveProfile}>Save Profile</Button>
      </Card>

      <Card className="p-4 space-y-4">
        <h2 className="font-semibold">OpenAI API Key</h2>
        <input
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-..."
          className="w-full border p-2 rounded"
        />
        <Button size="sm" onClick={saveApiKey}>Save Key</Button>
      </Card>

      <Card className="p-4 space-y-4">
        <h2 className="font-semibold">Usage & Costs</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>Total tokens</div>
          <div>{tokenUsage}</div>
          <div>Estimated cost</div>
          <div>${cost.toFixed(4)}</div>
          <div>Sunday Surfaces discount (50%)</div>
          <div>${discounted.toFixed(4)}</div>
        </div>
      </Card>
    </div>
  );
} 