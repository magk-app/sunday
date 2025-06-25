import React from 'react';
import { mockPeople, mockProjects } from '../../mock/threads';
import { Card } from '../../components/ui/card';

export default function KnowledgePage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Knowledge Base</h1>
      <h2 className="text-xl font-semibold mb-4">People</h2>
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {mockPeople.map((person) => (
          <Card key={person.id} className="p-4">
            <h3 className="font-medium">{person.name}</h3>
            <p className="text-xs text-gray-500 mb-1">{person.email}</p>
            {person.company && (
              <p className="text-xs text-gray-600">{person.company} • {person.role}</p>
            )}
          </Card>
        ))}
      </div>
      <h2 className="text-xl font-semibold mb-4">Projects</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {mockProjects.map((proj) => (
          <Card key={proj.id} className="p-4">
            <h3 className="font-medium">{proj.name}</h3>
            <p className="text-xs text-gray-600">{proj.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
} 