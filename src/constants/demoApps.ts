import { RemoteApp } from '../types';

export const DEMO_APPS: RemoteApp[] = [
    {
        id: 'cloud_chess',
        name: 'Chess Online',
        description: 'Défiez des joueurs du monde entier au échecs.',
        categoryId: 'games',
        sourceType: 'url',
        source: 'https://lichess.org',
        icon: '♟️',
        version: '1.0.0'
    },
    {
        id: 'cloud_weather',
        name: 'Météo Locale',
        description: 'Prévisions précises et animations satellites.',
        categoryId: 'utilities',
        sourceType: 'url',
        source: 'https://www.accuweather.com',
        icon: '☁️',
        version: '1.2.0'
    }
];
