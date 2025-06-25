'use client';
import React, { useState } from 'react';
import { mockPeople, mockProjects } from '../../mock/threads';
import { Card } from '../../components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

export default function KnowledgePage() {
  const [activePerson, setActivePerson] = useState<any>(null);
  const [activeProject, setActiveProject] = useState<any>(null);

  const storedPeople = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('kb_people') || '[]') : [];
  const storedProjects = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('kb_projects') || '[]') : [];
  const people = [...mockPeople, ...storedPeople.map((name:string, idx:number)=>({id:`p_${idx}`,name,email:name,}) )];
  const projects = [...mockProjects, ...storedProjects.map((name:string, idx:number)=>({id:`proj_${idx}`,name,description:'',status:'active',participants:[]}))];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Knowledge Base</h1>
      <h2 className="text-xl font-semibold mb-4">People</h2>
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {people.map((person) => (
          <Card key={person.id} className="p-4 cursor-pointer" onClick={() => setActivePerson(person)}>
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
        {projects.map((proj) => (
          <Card key={proj.id} className="p-4 cursor-pointer" onClick={() => setActiveProject(proj)}>
            <h3 className="font-medium">{proj.name}</h3>
            <p className="text-xs text-gray-600">{proj.description}</p>
          </Card>
        ))}
      </div>

      {/* Person Modal */}
      <AnimatePresence>
      {activePerson && (
        <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setActivePerson(null)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', stiffness: 300 }} className="bg-white rounded-xl shadow p-6 w-80" onClick={(e)=>e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-2">{activePerson.name}</h3>
            <p className="text-sm text-gray-500 mb-1">{activePerson.email}</p>
            {activePerson.company && <p className="text-sm mb-1">Company: {activePerson.company}</p>}
            {activePerson.role && <p className="text-sm mb-1">Role: {activePerson.role}</p>}
            {activePerson.notes && <p className="text-sm">Notes: {activePerson.notes}</p>}
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Project Modal */}
      <AnimatePresence>
      {activeProject && (
        <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setActiveProject(null)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', stiffness: 300 }} className="bg-white rounded-xl shadow p-6 w-96" onClick={(e)=>e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-2">{activeProject.name}</h3>
            <p className="text-sm mb-2">{activeProject.description}</p>
            <p className="text-xs text-gray-600">Status: {activeProject.status}</p>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
} 