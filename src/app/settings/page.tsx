'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun, faUpload, faTrash, faPlay, faKey, faCog, faUser, faChartBar, faFlask } from '@fortawesome/free-solid-svg-icons';

interface AIFunction {
  name: string;
  description: string;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

interface APIKey {
  id: string;
  provider: 'openai' | 'anthropic' | 'local';
  name: string;
  key: string;
  isActive: boolean;
}

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'ai' | 'usage' | 'playground'>('profile');

  // Profile state
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    avatar: '',
  });
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  // AI Settings state
  const [defaultModel, setDefaultModel] = useState('gpt-4o-mini');
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [newApiKey, setNewApiKey] = useState({ provider: 'openai' as const, name: '', key: '' });

  // Usage state
  const [tokenUsage, setTokenUsage] = useState<number>(0);
  const [cost, setCost] = useState<number>(0);
  const [usageLimit, setUsageLimit] = useState(1000);
  const [costLimit, setCostLimit] = useState(50);

  // Playground state
  const [aiFunctions, setAiFunctions] = useState<AIFunction[]>([
    {
      name: 'summarizeThread',
      description: 'Summarize email threads',
      model: 'gpt-4o-mini',
      temperature: 0.3,
      maxTokens: 500,
      systemPrompt: 'You are an expert at summarizing email conversations. Provide concise, actionable summaries.'
    },
    {
      name: 'generateReply',
      description: 'Generate email replies',
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 1000,
      systemPrompt: 'You are a professional email assistant. Write clear, contextual replies.'
    },
    {
      name: 'classifyImportance',
      description: 'Classify email importance',
      model: 'o1-mini',
      temperature: 0.1,
      maxTokens: 50,
      systemPrompt: 'Classify email importance as urgent, high, medium, or low based on content.'
    },
    {
      name: 'extractEntities',
      description: 'Extract people and projects',
      model: 'gpt-4o',
      temperature: 0.2,
      maxTokens: 800,
      systemPrompt: 'Extract people and project information from email content.'
    }
  ]);
  const [selectedFunction, setSelectedFunction] = useState<AIFunction | null>(null);

  useEffect(() => {
    setMounted(true);
    loadAllSettings();
    
    const handleUsageUpdate = () => {
      setTokenUsage(Number(localStorage.getItem('usage_tokens') || '0'));
      setCost(Number(localStorage.getItem('usage_cost') || '0'));
    };
    
    window.addEventListener('usage-updated', handleUsageUpdate);
    return () => window.removeEventListener('usage-updated', handleUsageUpdate);
  }, []);

  const loadAllSettings = () => {
    // Load dark mode
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    applyDarkMode(savedDarkMode);

    // Load profile
    setProfile({
      name: localStorage.getItem('profile_name') || '',
      email: localStorage.getItem('profile_email') || '',
      avatar: localStorage.getItem('profile_avatar') || '',
    });
    setAvatarPreview(localStorage.getItem('profile_avatar') || '');

    // Load AI settings
    setDefaultModel(localStorage.getItem('default_model') || 'gpt-4o-mini');
    
    const savedKeys = localStorage.getItem('api_keys');
    if (savedKeys) {
      setApiKeys(JSON.parse(savedKeys));
    } else {
      // Initialize with existing OpenAI key if present
      const openaiKey = localStorage.getItem('openai_api_key');
      if (openaiKey) {
        setApiKeys([{
          id: 'openai-1',
          provider: 'openai',
          name: 'OpenAI Main',
          key: openaiKey,
          isActive: true
        }]);
      }
    }

    // Load usage data
      setTokenUsage(Number(localStorage.getItem('usage_tokens') || '0'));
      setCost(Number(localStorage.getItem('usage_cost') || '0'));
    setUsageLimit(Number(localStorage.getItem('usage_limit') || '1000'));
    setCostLimit(Number(localStorage.getItem('cost_limit') || '50'));

    // Load AI functions config
    const savedFunctions = localStorage.getItem('ai_functions');
    if (savedFunctions) {
      setAiFunctions(JSON.parse(savedFunctions));
    }
  };

  const applyDarkMode = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    applyDarkMode(newDarkMode);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
        setProfile({ ...profile, avatar: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = () => {
    localStorage.setItem('profile_name', profile.name);
    localStorage.setItem('profile_email', profile.email);
    localStorage.setItem('profile_avatar', profile.avatar);
    alert('Profile saved successfully!');
  };

  const addApiKey = () => {
    if (!newApiKey.name || !newApiKey.key) return;
    
    const apiKey: APIKey = {
      id: `${newApiKey.provider}-${Date.now()}`,
      provider: newApiKey.provider,
      name: newApiKey.name,
      key: newApiKey.key,
      isActive: true
    };
    
    const updatedKeys = [...apiKeys, apiKey];
    setApiKeys(updatedKeys);
    localStorage.setItem('api_keys', JSON.stringify(updatedKeys));
    
    // Also save to individual key storage for backward compatibility
    if (newApiKey.provider === 'openai') {
      localStorage.setItem('openai_api_key', newApiKey.key);
    }
    
    setNewApiKey({ provider: 'openai', name: '', key: '' });
  };

  const removeApiKey = (id: string) => {
    const updatedKeys = apiKeys.filter(key => key.id !== id);
    setApiKeys(updatedKeys);
    localStorage.setItem('api_keys', JSON.stringify(updatedKeys));
  };

  const saveAIFunction = (func: AIFunction) => {
    const updatedFunctions = aiFunctions.map(f => f.name === func.name ? func : f);
    setAiFunctions(updatedFunctions);
    localStorage.setItem('ai_functions', JSON.stringify(updatedFunctions));
    setSelectedFunction(null);
    alert('AI function configuration saved!');
  };

  const saveLimits = () => {
    localStorage.setItem('usage_limit', usageLimit.toString());
    localStorage.setItem('cost_limit', costLimit.toString());
    alert('Usage limits saved!');
  };

  if (!mounted) {
    return <div className="p-6 max-w-4xl mx-auto dark:bg-gray-900 dark:text-white">Loading...</div>;
  }

  const discounted = cost * 0.5;
  const usagePercentage = (tokenUsage / usageLimit) * 100;
  const costPercentage = (cost / costLimit) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header with Dark Mode Toggle */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <Button
            onClick={toggleDarkMode}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </Button>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-4 dark:bg-gray-800 dark:border-gray-700">
              <nav className="space-y-2">
                {[
                  { key: 'profile', label: 'Profile', icon: faUser },
                  { key: 'ai', label: 'AI Settings', icon: faCog },
                  { key: 'usage', label: 'Usage & Analytics', icon: faChartBar },
                  { key: 'playground', label: 'Playground', icon: faFlask },
                ].map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveSection(key as any)}
                    className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${
                      activeSection === key
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <FontAwesomeIcon icon={icon} className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Section */}
            {activeSection === 'profile' && (
              <Card className="p-6 dark:bg-gray-800 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Profile Settings</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Name</label>
                      <Input
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        placeholder="Your full name"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Email</label>
                      <Input
          value={profile.email}
          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        placeholder="your.email@example.com"
                        type="email"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    
                    <Button onClick={saveProfile} className="w-full">
                      Save Profile
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profile Picture</label>
                    
                    <div className="flex flex-col items-center space-y-4">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Profile"
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                          <FontAwesomeIcon icon={faUser} className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <label className="cursor-pointer">
        <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                          />
                          <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faUpload} />
                            Upload
                          </Button>
                        </label>
                        
                        {avatarPreview && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setAvatarPreview('');
                              setProfile({ ...profile, avatar: '' });
                            }}
                            className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* AI Settings Section */}
            {activeSection === 'ai' && (
              <div className="space-y-6">
                <Card className="p-6 dark:bg-gray-800 dark:border-gray-700">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">AI Model Settings</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Default Model</label>
                      <select
                        value={defaultModel}
                        onChange={(e) => {
                          setDefaultModel(e.target.value);
                          localStorage.setItem('default_model', e.target.value);
                        }}
                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="gpt-4o-mini">GPT-4o Mini (Fast & Cheap - $0.15/$0.60 per 1M tokens)</option>
                        <option value="gpt-4o">GPT-4o (Most Capable - $2.50/$10 per 1M tokens)</option>
                        <option value="o1-mini">o1 Mini (Reasoning - $3/$12 per 1M tokens)</option>
                        <option value="o1-preview">o1 Preview (Advanced Reasoning - $15/$60 per 1M tokens)</option>
                        <option value="gpt-4-turbo">GPT-4 Turbo (Latest GPT-4 - $10/$30 per 1M tokens)</option>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Legacy - $0.50/$1.50 per 1M tokens)</option>
                      </select>
                    </div>
                  </div>
      </Card>

                <Card className="p-6 dark:bg-gray-800 dark:border-gray-700">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">API Keys</h2>
                  
                  {/* Add New API Key */}
                  <div className="space-y-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h3 className="font-medium text-gray-900 dark:text-white">Add New API Key</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <select
                        value={newApiKey.provider}
                        onChange={(e) => setNewApiKey({ ...newApiKey, provider: e.target.value as any })}
                        className="p-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                      >
                        <option value="openai">OpenAI</option>
                        <option value="anthropic">Anthropic</option>
                        <option value="local">Local Model</option>
                      </select>
                      
                      <Input
                        value={newApiKey.name}
                        onChange={(e) => setNewApiKey({ ...newApiKey, name: e.target.value })}
                        placeholder="Key name"
                        className="dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                      />
                      
                      <Input
                        value={newApiKey.key}
                        onChange={(e) => setNewApiKey({ ...newApiKey, key: e.target.value })}
                        placeholder="API key"
                        type="password"
                        className="dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                      />
                    </div>
                    <Button onClick={addApiKey} size="sm">
                      <FontAwesomeIcon icon={faKey} className="mr-2" />
                      Add API Key
                    </Button>
                  </div>

                  {/* Existing API Keys */}
                  <div className="space-y-3">
                    {apiKeys.map((key) => (
                      <div key={key.id} className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-600 dark:bg-gray-700/50">
                        <div className="flex items-center gap-3">
                          <Badge variant={key.provider === 'openai' ? 'default' : 'secondary'} className="dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500">
                            {key.provider.toUpperCase()}
                          </Badge>
                          <span className="font-medium text-gray-900 dark:text-white">{key.name}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {key.key.slice(0, 8)}...{key.key.slice(-4)}
                          </span>
                          {key.isActive && (
                            <Badge variant="outline" className="text-green-600 border-green-600 dark:text-green-400 dark:border-green-400">Active</Badge>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeApiKey(key.id)}
                          className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-500 dark:hover:bg-red-900/20"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Usage & Analytics Section */}
            {activeSection === 'usage' && (
              <div className="space-y-6">
                <Card className="p-6 dark:bg-gray-800 dark:border-gray-700">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Usage Statistics</h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h3 className="font-medium text-blue-900 dark:text-blue-300">Token Usage</h3>
                        <div className="mt-2">
                          <div className="flex justify-between text-sm">
                            <span>{tokenUsage} / {usageLimit} tokens</span>
                            <span>{usagePercentage.toFixed(1)}%</span>
                          </div>
                          <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <h3 className="font-medium text-green-900 dark:text-green-300">Cost Tracking</h3>
                        <div className="mt-2">
                          <div className="flex justify-between text-sm">
                            <span>${cost.toFixed(4)} / ${costLimit}</span>
                            <span>{costPercentage.toFixed(1)}%</span>
                          </div>
                          <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(costPercentage, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-green-700 dark:text-green-400 mt-2">
                            Sunday Surfaces discount: ${discounted.toFixed(4)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900 dark:text-white">Usage Limits</h3>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                          Token Limit
                        </label>
                        <Input
                          type="number"
                          value={usageLimit}
                          onChange={(e) => setUsageLimit(Number(e.target.value))}
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                          Cost Limit ($)
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          value={costLimit}
                          onChange={(e) => setCostLimit(Number(e.target.value))}
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      
                      <Button onClick={saveLimits} className="w-full">
                        Save Limits
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Playground Section */}
            {activeSection === 'playground' && (
              <div className="space-y-6">
                <Card className="p-6 dark:bg-gray-800 dark:border-gray-700">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">AI Functions Playground</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Configure and test your AI functions</p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Function List */}
                    <div className="space-y-3">
                      <h3 className="font-medium text-gray-900 dark:text-white">Available Functions</h3>
                      {aiFunctions.map((func) => (
                        <div
                          key={func.name}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors dark:border-gray-600 ${
                            selectedFunction?.name === func.name
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 dark:bg-gray-700/30'
                          }`}
                          onClick={() => setSelectedFunction(func)}
                        >
                          <h4 className="font-medium text-gray-900 dark:text-white">{func.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{func.description}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className="dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500">{func.model}</Badge>
                            <Badge variant="outline" className="dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500">temp: {func.temperature}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Function Editor */}
                    {selectedFunction && (
                      <div className="space-y-4">
                        <h3 className="font-medium text-gray-900 dark:text-white">Edit Function: {selectedFunction.name}</h3>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Model</label>
                          <select
                            value={selectedFunction.model}
                            onChange={(e) => setSelectedFunction({ ...selectedFunction, model: e.target.value })}
                            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          >
                            <option value="gpt-4o-mini">GPT-4o Mini</option>
                            <option value="gpt-4o">GPT-4o</option>
                            <option value="o1-mini">o1 Mini (Reasoning)</option>
                            <option value="o1-preview">o1 Preview (Advanced)</option>
                            <option value="gpt-4-turbo">GPT-4 Turbo</option>
                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            Temperature: {selectedFunction.temperature}
                          </label>
        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={selectedFunction.temperature}
                            onChange={(e) => setSelectedFunction({ ...selectedFunction, temperature: parseFloat(e.target.value) })}
                            className="w-full"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Max Tokens</label>
                          <Input
                            type="number"
                            value={selectedFunction.maxTokens}
                            onChange={(e) => setSelectedFunction({ ...selectedFunction, maxTokens: parseInt(e.target.value) })}
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">System Prompt</label>
                          <Textarea
                            value={selectedFunction.systemPrompt}
                            onChange={(e) => setSelectedFunction({ ...selectedFunction, systemPrompt: e.target.value })}
                            rows={4}
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <Button onClick={() => saveAIFunction(selectedFunction)} className="flex-1">
                            Save Changes
                          </Button>
                          <Button variant="outline" className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faPlay} />
                            Test
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
      </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 