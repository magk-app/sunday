'use client';

import React, { useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState<string>('');
  const [tokenUsage, setTokenUsage] = useState<number>(0);
  const [cost, setCost] = useState<number>(0);

  const discounted = cost * 0.5;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Settings & Usage</h1>

      <Card className="p-4 space-y-4">
        <h2 className="font-semibold">OpenAI API Key</h2>
        <input
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-..."
          className="w-full border p-2 rounded"
        />
        <Button size="sm">Save</Button>
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