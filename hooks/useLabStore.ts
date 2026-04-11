import { create } from 'zustand';
import { BlogCategory } from '@/types';

interface LabState {
    activeCategory: BlogCategory | 'all';
    activeTags: string[];
    searchQuery: string;
    setCategory: (cat: BlogCategory | 'all') => void;
    toggleTag: (tag: string) => void;
    setSearch: (query: string) => void;
    clearFilters: () => void;
}

export const useLabStore = create<LabState>((set) => ({
    activeCategory: 'all',
    activeTags: [],
    searchQuery: '',
    setCategory: (cat) => set({ activeCategory: cat }),
    toggleTag: (tag) => set((s) => ({
        activeTags: s.activeTags.includes(tag)
            ? s.activeTags.filter(t => t !== tag)
            : [...s.activeTags, tag]
    })),
    setSearch: (query) => set({ searchQuery: query }),
    clearFilters: () => set({ activeCategory: 'all', activeTags: [], searchQuery: '' }),
}));
