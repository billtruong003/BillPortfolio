import { create } from 'zustand';
import { BlogCategory } from '@/types';

interface LabState {
    activeCategory: BlogCategory | 'all';
    activeTags: string[];
    activeSeries: string | null;
    searchQuery: string;
    setCategory: (cat: BlogCategory | 'all') => void;
    toggleTag: (tag: string) => void;
    setSeries: (id: string | null) => void;
    setSearch: (query: string) => void;
    clearFilters: () => void;
}

export const useLabStore = create<LabState>((set) => ({
    activeCategory: 'all',
    activeTags: [],
    activeSeries: null,
    searchQuery: '',
    setCategory: (cat) => set({ activeCategory: cat, activeSeries: null }),
    toggleTag: (tag) => set((s) => ({
        activeTags: s.activeTags.includes(tag)
            ? s.activeTags.filter(t => t !== tag)
            : [...s.activeTags, tag],
        activeSeries: null,
    })),
    setSeries: (id) => set((s) => ({
        activeSeries: s.activeSeries === id ? null : id,
        activeCategory: 'all',
        activeTags: [],
        searchQuery: '',
    })),
    setSearch: (query) => set({ searchQuery: query, activeSeries: null }),
    clearFilters: () => set({ activeCategory: 'all', activeTags: [], activeSeries: null, searchQuery: '' }),
}));
