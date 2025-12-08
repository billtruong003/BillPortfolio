// hooks/useStore.ts
import { create } from 'zustand';
import { Project } from '@/types';

interface AppState {
    selectedProject: Project | null;
    isModalOpen: boolean;
    activeFilter: string;
    openModal: (project: Project) => void;
    closeModal: () => void;
    setFilter: (filter: string) => void;
}

export const useStore = create<AppState>((set) => ({
    selectedProject: null,
    isModalOpen: false,
    activeFilter: 'all',
    openModal: (project) => set({ selectedProject: project, isModalOpen: true }),
    closeModal: () => set({ isModalOpen: false, selectedProject: null }),
    setFilter: (filter) => set({ activeFilter: filter }),
}));