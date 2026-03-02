import { Category, MiniApp } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
    { id: 'all', name: 'Tout', color: '#7C3AED', icon: '🌐' },
    { id: 'games', name: 'Jeux', color: '#EF4444', icon: '🎮' },
    { id: 'tools', name: 'Outils', color: '#3B82F6', icon: '🔧' },
    { id: 'learning', name: 'Apprentissage', color: '#10B981', icon: '📚' },
    { id: 'entertainment', name: 'Divertissement', color: '#F59E0B', icon: '🎬' },
    { id: 'utilities', name: 'Utilitaires', color: '#6366F1', icon: '⚡' },
];

export const SAMPLE_APPS: MiniApp[] = [
    {
        id: 'sample_2048',
        name: '2048',
        description: 'Le célèbre jeu de puzzle numérique',
        categoryId: 'games',
        sourceType: 'url',
        source: 'https://play2048.co',
        icon: '🔢',
        addedAt: Date.now() - 86400000 * 3,
    },
    {
        id: 'sample_sudoku',
        name: 'Sudoku',
        description: 'Jeu de sudoku classique',
        categoryId: 'games',
        sourceType: 'url',
        source: 'https://sudoku.com',
        icon: '🧩',
        addedAt: Date.now() - 86400000 * 2,
    },
    {
        id: 'sample_excalidraw',
        name: 'Excalidraw',
        description: 'Tableau blanc collaboratif',
        categoryId: 'tools',
        sourceType: 'url',
        source: 'https://excalidraw.com',
        icon: '✏️',
        addedAt: Date.now() - 86400000,
    },
    {
        id: 'sample_pomodoro',
        name: 'Pomodoro Timer',
        description: 'Minuteur Pomodoro pour la productivité',
        categoryId: 'utilities',
        sourceType: 'url',
        source: 'https://pomofocus.io',
        icon: '🍅',
        addedAt: Date.now(),
    },
];

export const CATEGORY_COLORS = [
    '#7C3AED', '#EF4444', '#3B82F6', '#10B981',
    '#F59E0B', '#6366F1', '#EC4899', '#14B8A6',
    '#F97316', '#84CC16', '#06B6D4', '#8B5CF6',
];

export const CATEGORY_ICONS = [
    '🌐', '🎮', '🔧', '📚', '🎬', '⚡', '💡', '🎨',
    '📊', '🔬', '🎵', '🍅', '✏️', '🧩', '🚀', '💻',
    '📱', '🗺️', '🎯', '🧠', '🔐', '📰', '🌍', '🎲',
];
