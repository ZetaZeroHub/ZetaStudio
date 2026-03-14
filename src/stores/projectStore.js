import { create } from 'zustand';
import { loadProjects, saveProjects } from '../services/storageService';

const useProjectStore = create((set, get) => ({
  projects: [],

  loadAllProjects: () => {
    const projects = loadProjects();
    set({ projects });
  },

  createProject: (name, templateType, dimension = '2D') => {
    const project = {
      id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name,
      templateType,
      dimension,
      elements: [],
      code: '',
      thumbnail: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const projects = [...get().projects, project];
    set({ projects });
    saveProjects(projects);
    return project;
  },

  updateProject: (id, updates) => {
    const projects = get().projects.map((p) =>
      p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
    );
    set({ projects });
    saveProjects(projects);
  },

  deleteProject: (id) => {
    const projects = get().projects.filter((p) => p.id !== id);
    set({ projects });
    saveProjects(projects);
  },

  getProject: (id) => {
    return get().projects.find((p) => p.id === id);
  },
}));

export default useProjectStore;
