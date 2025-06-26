'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { faComputerMouse, faPeopleArrows } from '@fortawesome/free-solid-svg-icons';
import { getPeople, getProjects, addPerson, addProject, deletePerson, deleteProject, upsertPerson, upsertProject, getThreads } from '../../lib/entity-storage';
import type { Person, Project, EmailThread } from '../../types';
import { Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '../../components/ui/modal';
import PersonFormModal from '../../components/PersonFormModal';
import ProjectFormModal from '../../components/ProjectFormModal';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';

export default function KnowledgePage() {
  const [activePerson, setActivePerson] = useState<any>(null);
  const [activeProject, setActiveProject] = useState<any>(null);
  const [menuPersonId, setMenuPersonId] = useState<string | null>(null);
  const [menuProjectId, setMenuProjectId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'person' | 'project'; id: string } | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [personForm, setPersonForm] = useState<{ [key: string]: string }>({ name: '', email: '', phone: '', company: '', role: '', notes: '', tags: '', avatarUrl: '', summary: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectForm, setProjectForm] = useState<{ [key: string]: string }>({ name: '', description: '', status: 'active', participants: '', tags: '', summary: '' });
  const [projectFormError, setProjectFormError] = useState<string | null>(null);
  const [editPerson, setEditPerson] = useState<Person | null>(null);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [threads, setThreads] = useState<EmailThread[]>([]);
  const [showPersonThreads, setShowPersonThreads] = useState<Record<string, boolean>>({});
  const [showProjectThreads, setShowProjectThreads] = useState<Record<string, boolean>>({});

  // Load people from storage on mount
  useEffect(() => {
    (async () => {
      const stored = await getPeople();
      setPeople(stored);
    })();
  }, []);

  // Load projects from storage on mount
  useEffect(() => {
    (async () => {
      const stored = await getProjects();
      setProjects(stored);
    })();
  }, []);

  // On mount, load threads from storage
  useEffect(() => {
    (async () => {
      const storedThreads = await getThreads();
      setThreads(storedThreads);
      // ... existing people/projects loading ...
    })();
  }, []);

  const handlePersonFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPersonForm({ ...personForm, [e.target.name]: e.target.value });
  };

  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personForm.name || !personForm.email) {
      setFormError('Name and email are required.');
      return;
    }
    const newPerson: Person = {
      id: `p_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      name: personForm.name,
      email: personForm.email,
      phone: personForm.phone,
      company: personForm.company,
      role: personForm.role,
      notes: personForm.notes,
      tags: personForm.tags.split(',').map(t => t.trim()).filter(Boolean),
    };
    await addPerson(newPerson);
    setPeople(prev => [...prev, newPerson]);
    setPersonForm({ name: '', email: '', phone: '', company: '', role: '', notes: '', tags: '' });
    setFormError(null);
  };

  const handleProjectFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProjectForm({ ...projectForm, [e.target.name]: e.target.value });
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.name) {
      setProjectFormError('Project name is required.');
      return;
    }
    const newProject: Project = {
      id: `proj_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      user_id: 'user_jack',
      name: projectForm.name,
      description: projectForm.description,
      status: projectForm.status,
      participants: projectForm.participants.split(',').map(t => t.trim()).filter(Boolean),
      tags: projectForm.tags.split(',').map(t => t.trim()).filter(Boolean),
    };
    await addProject(newProject);
    setProjects(prev => [...prev, newProject]);
    setProjectForm({ name: '', description: '', status: 'active', participants: '', tags: '' });
    setProjectFormError(null);
  };

  // Simple delete helpers now that editing is handled by modal components
  const handleDeletePerson = async (id: string) => {
    await deletePerson(id);
    setPeople(prev => prev.filter(p => p.id !== id));
  };

  const handleDeleteProject = async (id: string) => {
    await deleteProject(id);
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  // For each person, compute connected threads
  type GetPersonThreads = (person: Person) => EmailThread[];
  const getPersonThreads: GetPersonThreads = (person) => threads.filter(t => t.participants.includes(person.email));

  // For each project, compute connected threads (any participant in thread)
  type GetProjectThreads = (project: Project) => EmailThread[];
  const getProjectThreads: GetProjectThreads = (project) => threads.filter(t => project.participants.some((pid: string) => {
    const p = people.find((pp: Person) => pp.id === pid);
    return p && t.participants.includes(p.email);
  }));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Knowledge Base</h1>
      {/* People header row */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">People</h2>
        <PersonFormModal
          triggerLabel="Add Person"
          onSave={(p) => {
            upsertPerson(p).then(() => setPeople((prev) => [...prev, p]));
          }}
        />
      </div>
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {people.map((person) => (
          <Card key={person.id} className="p-4 cursor-pointer relative group" onClick={()=>setActivePerson(person)}>
            <>
              <h3 className="font-medium">{person.name}</h3>
              {person.company && (
                <p className="text-xs text-gray-600">{person.company} • {person.role}</p>
              )}
              {/* Tags */}
              {person.tags && person.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {person.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-gray-100 border px-2 py-0.5 text-[10px] font-semibold text-gray-700">{tag}</span>
                  ))}
                </div>
              )}
              {person.notes && <p className="text-xs text-gray-400 mt-1">{person.notes}</p>}
              {/* Action menu */}
              <div className="absolute top-2 right-2">
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuPersonId(menuPersonId === person.id ? null : person.id);
                    }}
                    className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-800"
                    title="Actions"
                  >
                    ⋮
                  </button>
                  {menuPersonId === person.id && (
                    <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg border min-w-[140px] py-1 z-50">
                      <button
                        className="block w-full text-left px-3 py-1 text-sm hover:bg-gray-100 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuPersonId(null);
                          setEditPerson(person);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="block w-full text-left px-3 py-1 text-red-600 text-sm hover:bg-gray-100 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuPersonId(null);
                          setConfirmDelete({ type: 'person', id: person.id });
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          </Card>
        ))}
      </div>
      {/* Projects header row */}
      <div className="flex items-center justify-between mb-4 mt-10">
        <h2 className="text-xl font-semibold">Projects</h2>
        <ProjectFormModal
          triggerLabel="Add Project"
          onSave={(proj) => {
            upsertProject(proj).then(() => setProjects((prev) => [...prev, proj]));
          }}
        />
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {projects.map((proj) => (
          <Card key={proj.id} className="p-4 cursor-pointer relative group" onClick={()=>setActiveProject(proj)}>
            <>
              <h3 className="font-medium">{proj.name}</h3>
              <p className="text-xs text-gray-600 mb-1">{proj.description}</p>
              <span className="rounded-full border bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-700 mt-1 inline-block">{proj.status || 'active'}</span>
              {proj.participants && proj.participants.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {proj.participants.map((p) => (
                    <span key={p} className="rounded-full border bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-700">{p}</span>
                  ))}
                </div>
              )}
              {proj.tags && proj.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {proj.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-gray-100 border px-2 py-0.5 text-[10px] font-semibold text-gray-700">{tag}</span>
                  ))}
                </div>
              )}
              {/* Action menu for project */}
              <div className="absolute top-2 right-2">
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuProjectId(menuProjectId === proj.id ? null : proj.id);
                    }}
                    className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-800"
                    title="Actions"
                  >
                    ⋮
                  </button>
                  {menuProjectId === proj.id && (
                    <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg border min-w-[140px] py-1 z-50">
                      <button
                        className="block w-full text-left px-3 py-1 text-sm hover:bg-gray-100 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuProjectId(null);
                          setEditProject(proj);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="block w-full text-left px-3 py-1 text-red-600 text-sm hover:bg-gray-100 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuProjectId(null);
                          setConfirmDelete({ type: 'project', id: proj.id });
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          </Card>
        ))}
      </div>

      {/* Person Modal */}
      <AnimatePresence>
      {activePerson && (
        <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setActivePerson(null)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="bg-white rounded-xl shadow p-6 w-[380px] max-h-[90vh] overflow-y-auto" onClick={(e)=>e.stopPropagation()}>
            {/* Header - match reference */}
            <div className="flex items-center gap-3 mb-4">
              <span className="relative flex shrink-0 overflow-hidden rounded-full w-10 h-10">
                {activePerson.avatarUrl ? (
                  <img src={activePerson.avatarUrl} alt={activePerson.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-sm text-white font-medium">
                    {activePerson.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </span>
              <div>
                <h3 className="font-bold text-lg">{activePerson.name}</h3>
                {activePerson.email && (
                  <a href={`mailto:${activePerson.email}`} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 transition">
                    <FontAwesomeIcon icon={faEnvelope} className="w-3 h-3" />
                    <span className="break-all">{activePerson.email}</span>
                  </a>
                )}
                {activePerson.phone && (
                  <a href={`tel:${activePerson.phone}`} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 transition mt-1">
                    <FontAwesomeIcon icon={faPhone} className="w-3 h-3" />
                    <span>{activePerson.phone}</span>
                  </a>
                )}
              </div>
            </div>
            {/* Work */}
            {(activePerson.company || activePerson.role) && (
              <div className="mb-4">
                {activePerson.company && (
                  <p className="text-xs"><span className="font-bold">Company:</span> <span className="font-normal">{activePerson.company}</span></p>) }
                {activePerson.role && (
                  <p className="text-xs"><span className="font-bold">Role:</span> <span className="font-normal">{activePerson.role}</span></p>) }
              </div>
            )}

            {/* Tags */}
            {activePerson.tags && activePerson.tags.length > 0 && (
              <div className="mb-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {activePerson.tags.map((t:string) => (
                    <Badge key={t} variant="secondary" className="text-[10px] px-2 py-0.5">{t}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {activePerson.notes && (
              <div className="mb-3">
                <p className="font-bold text-xs mb-1">Notes</p>
                <p className="text-xs text-gray-700 whitespace-pre-wrap">{activePerson.notes}</p>
              </div>
            )}
            {/* Toggleable thread list */}
            {(() => {
              const threadsForPerson = getPersonThreads(activePerson);
              const isOpen = showPersonThreads[activePerson.id] || false;
              return (
                threadsForPerson.length > 0 && (
                  <div className="mt-4">
                    <button
                      className="text-xs text-blue-600 hover:underline mb-2"
                      onClick={() => setShowPersonThreads((prev) => ({ ...prev, [activePerson.id]: !isOpen }))}
                    >
                      {isOpen ? 'Hide Threads' : `Show Threads (${threadsForPerson.length})`}
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2">
                          {threadsForPerson.map((t) => (
                            <Card key={t.id} className="p-3 border border-blue-100 bg-blue-50">
                              <div className="font-semibold text-sm mb-1">{t.subject}</div>
                              <div className="text-xs text-gray-500">{t.participants.length} participants • {t.message_count} messages</div>
                              <div className="text-xs text-gray-400 mt-1">Status: {t.status}</div>
                            </Card>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              );
            })()}
            <div className="text-right mt-4">
              <Button variant="outline" onClick={()=>setActivePerson(null)}>Close</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Project Modal */}
      <AnimatePresence>
      {activeProject && (
        <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setActiveProject(null)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="bg-white rounded-xl shadow p-6 w-96 max-h-[90vh] overflow-y-auto" onClick={(e)=>e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-2">{activeProject.name}</h3>
            <p className="text-sm mb-2">{activeProject.description}</p>
            <p className="text-xs text-gray-600 mb-2">Status: {activeProject.status}</p>
            {/* Participants as names */}
            {activeProject.participants && activeProject.participants.length > 0 && (
              <div className="mb-2">
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Participants</h4>
                <div className="flex flex-wrap gap-1">
                  {activeProject.participants.map((pid: string) => {
                    const person = people.find((p) => p.id === pid);
                    return (
                      <span key={pid} className="rounded-full border bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-700">
                        {person ? person.name : pid}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Tags */}
            {activeProject.tags && activeProject.tags.length > 0 && (
              <div className="mb-2">
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {activeProject.tags.map((t:string) => (
                    <Badge key={t} variant="secondary" className="text-[10px] px-2 py-0.5">{t}</Badge>
                  ))}
                </div>
              </div>
            )}
            {/* Toggleable thread list for project */}
            {(() => {
              const threadsForProject = getProjectThreads(activeProject);
              const isOpen = showProjectThreads[activeProject.id] || false;
              return (
                threadsForProject.length > 0 && (
                  <div className="mt-4">
                    <button
                      className="text-xs text-blue-600 hover:underline mb-2"
                      onClick={() => setShowProjectThreads((prev) => ({ ...prev, [activeProject.id]: !isOpen }))}
                    >
                      {isOpen ? 'Hide Threads' : `Show Threads (${threadsForProject.length})`}
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2">
                          {threadsForProject.map((t) => (
                            <Card key={t.id} className="p-3 border border-blue-100 bg-blue-50">
                              <div className="font-semibold text-sm mb-1">{t.subject}</div>
                              <div className="text-xs text-gray-500">{t.participants.length} participants • {t.message_count} messages</div>
                              <div className="text-xs text-gray-400 mt-1">Status: {t.status}</div>
                            </Card>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              );
            })()}
            <div className="text-right mt-4">
              <Button variant="outline" onClick={()=>setActiveProject(null)}>Close</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <Modal open={!!confirmDelete} onOpenChange={(open)=>{ if(!open) setConfirmDelete(null); }}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Confirm Deletion</ModalTitle>
            </ModalHeader>
            <p className="text-sm text-gray-700 mb-4">Are you sure you want to permanently delete this {confirmDelete.type === 'person' ? 'person' : 'project'}?</p>
            <ModalFooter>
              <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirmDelete.type === 'person') {
                    handleDeletePerson(confirmDelete.id);
                  } else {
                    handleDeleteProject(confirmDelete.id);
                  }
                  setConfirmDelete(null);
                }}
              >
                Delete
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* Edit Person Form */}
      {editPerson && (
        <PersonFormModal
          existing={editPerson}
          open={true}
          onOpenChange={(open) => { if (!open) setEditPerson(null); }}
          onSave={(p) => {
            upsertPerson(p).then(() => setPeople((prev) => prev.map((q) => (q.id === p.id ? p : q))));
            setEditPerson(null);
          }}
        />
      )}

      {/* Edit Project Form */}
      {editProject && (
        <ProjectFormModal
          existing={editProject}
          open={true}
          onOpenChange={(open) => { if (!open) setEditProject(null); }}
          onSave={(proj) => {
            upsertProject(proj).then(() => setProjects((prev) => prev.map((q) => (q.id === proj.id ? proj : q))));
            setEditProject(null);
          }}
          triggerLabel=""
        />
      )}
    </div>
  );
} 