import type { EmailThread, Person, Project } from '../types';

const THREADS_KEY = 'threads';
const PEOPLE_KEY = 'kb_people';
const PROJECTS_KEY = 'kb_projects';

/**
 * Get all threads from localStorage. If none, returns an empty array.
 */
export async function getThreads(): Promise<EmailThread[]> {
  const raw = localStorage.getItem(THREADS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Get a single thread by ID.
 */
export async function getThread(id: string): Promise<EmailThread | null> {
  const threads = await getThreads();
  return threads.find(t => t.id === id) || null;
}

/**
 * Create a new thread.
 */
export async function createThread(thread: EmailThread): Promise<void> {
  const threads = await getThreads();
  threads.push(thread);
  localStorage.setItem(THREADS_KEY, JSON.stringify(threads));
}

/**
 * Update a thread by ID with partial updates.
 */
export async function updateThread(id: string, updates: Partial<EmailThread>): Promise<void> {
  const threads = await getThreads();
  const idx = threads.findIndex(t => t.id === id);
  if (idx === -1) return;
  threads[idx] = { ...threads[idx], ...updates, updated_at: new Date().toISOString() };
  localStorage.setItem(THREADS_KEY, JSON.stringify(threads));
}

/**
 * Delete a thread by ID.
 */
export async function deleteThread(id: string): Promise<void> {
  const threads = await getThreads();
  const filtered = threads.filter(t => t.id !== id);
  localStorage.setItem(THREADS_KEY, JSON.stringify(filtered));
}

/**
 * Initialize mock data if localStorage is empty.
 * Call this on app load before any getThreads().
 */
export async function initMockDataIfNeeded(mockThreads: EmailThread[]): Promise<void> {
  const raw = localStorage.getItem(THREADS_KEY);
  if (!raw) {
    localStorage.setItem(THREADS_KEY, JSON.stringify(mockThreads));
  }
}

/**
 * Get all people from localStorage. If none, returns an empty array.
 */
export async function getPeople(): Promise<Person[]> {
  const raw = localStorage.getItem(PEOPLE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Add a new person to localStorage.
 */
export async function addPerson(person: Person): Promise<void> {
  const people = await getPeople();
  people.push(person);
  localStorage.setItem(PEOPLE_KEY, JSON.stringify(people));
}

/**
 * Update a person by id.
 */
export async function updatePerson(id: string, updates: Partial<Person>): Promise<void> {
  const people = await getPeople();
  const updated = people.map(p => p.id === id ? { ...p, ...updates } : p);
  localStorage.setItem(PEOPLE_KEY, JSON.stringify(updated));
}

/**
 * Delete a person by id.
 */
export async function deletePerson(id: string): Promise<void> {
  const people = await getPeople();
  const updated = people.filter(p => p.id !== id);
  localStorage.setItem(PEOPLE_KEY, JSON.stringify(updated));
}

/**
 * Get all projects from localStorage. If none, returns an empty array.
 */
export async function getProjects(): Promise<Project[]> {
  const raw = localStorage.getItem(PROJECTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Add a new project to localStorage.
 */
export async function addProject(project: Project): Promise<void> {
  const projects = await getProjects();
  projects.push(project);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

/**
 * Update a project by id.
 */
export async function updateProject(id: string, updates: Partial<Project>): Promise<void> {
  const projects = await getProjects();
  const updated = projects.map(p => p.id === id ? { ...p, ...updates } : p);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(updated));
}

/**
 * Delete a project by id.
 */
export async function deleteProject(id: string): Promise<void> {
  const projects = await getProjects();
  const updated = projects.filter(p => p.id !== id);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(updated));
}

export async function upsertPerson(person: Person): Promise<void> {
  const people = await getPeople();
  const idx = people.findIndex(p => p.email === person.email);
  if (idx === -1) {
    people.push(person);
  } else {
    people[idx] = { ...people[idx], ...person };
  }
  localStorage.setItem(PEOPLE_KEY, JSON.stringify(people));
}

export async function upsertProject(project: Project): Promise<void> {
  const projects = await getProjects();
  const idx = projects.findIndex(p => p.name.toLowerCase() === project.name.toLowerCase());
  if (idx === -1) {
    projects.push(project);
  } else {
    projects[idx] = { ...projects[idx], ...project };
  }
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export async function saveExtractedEntities(peopleArr: string[], projectArr: string[]): Promise<void> {
  const promises: Promise<void>[] = [];
  peopleArr.forEach(nameOrEmail => {
    const p: Person = {
      id: `p_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      name: nameOrEmail.split('@')[0] || nameOrEmail,
      email: nameOrEmail.includes('@') ? nameOrEmail : `${nameOrEmail.replace(/\s+/g,'').toLowerCase()}@example.com`,
      summary: '',
    } as Person;
    promises.push(upsertPerson(p));
  });
  projectArr.forEach(projName => {
    const proj: Project = {
      id: `proj_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      user_id: 'user_jack',
      name: projName,
      participants: [],
    } as Project;
    promises.push(upsertProject(proj));
  });
  await Promise.all(promises);
} 