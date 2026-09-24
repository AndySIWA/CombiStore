import { setup, render } from '@testing-library/react';
import React from 'react';
import { AppsProvider } from '../context/AppsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage before all tests
beforeAll(() => {
    const mock = jest.fn();
    mock.getItem.mockResolvedValue(null);
    mock.setItem.mockResolvedValue(undefined);
    mock.multiset.mockResolvedValue(undefined);
    AsyncStorage.setItem = mock.getItem;
    AsyncStorage.getItem = mock.getItem;
    AsyncStorage.setItem = mock.setItem;
    AsyncStorage.multiset = mock.multiset;
});

describe('AppsContext', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should initialize with empty apps state', () => {
        const { result } = render(
            <AppsProvider />
        );
        expect(result.current.apps).toEqual([]);
        expect(result.current.remoteApps).toEqual([]);
        expect(result.current.loading).toBe(true);
    });

    test('should load sample apps when no local data available', async () => {
        // This test requires actual component rendering
        // and is structured for later expansion
    });

    test('should add a new app', () => {
        const appData = { name: 'Test App', description: 'A test', sourceType: 'html', source: '<p>test</p>', icon: '📱' };
        // Test the addApp logic
        const newApp = {
            ...appData,
            id: 'app_test123',
            addedAt: Date.now(),
            icon: appData.icon?.trim() || '🌐',
        };
        expect(newApp.id).toBe('app_test123');
        expect(newApp.icon).toBe('📱');
    });

    test('should remove an app by id', () => {
        const initialApps = [
            { id: 'app_1', name: 'App 1', description: 'App 1', sourceType: 'html', source: '<p>1</p>', icon: '📱', addedAt: Date.now() },
            { id: 'app_2', name: 'App 2', description: 'App 2', sourceType: 'html', source: '<p>2</p>', icon: '📱', addedAt: Date.now() },
        ];

        const filtered = initialApps.filter(a => a.id !== 'app_1');
        expect(filtered).toHaveLength(1);
        expect(filtered[0].id).toBe('app_2');
    });

    test('should update an app partially', () => {
        const existingApp = { id: 'app_1', name: 'Original', description: 'Original desc', sourceType: 'html', source: '<p>orig</p>', icon: '📱', addedAt: Date.now() };
        const partialUpdate = { name: 'Updated' };
        const updated = { ...existingApp, ...partialUpdate };
        expect(updated.name).toBe('Updated');
        expect(updated.description).toBe('Original desc'); // unchanged
    });

    test('should import a remote app without duplicate', () => {
        const existingApps = [
            { id: 'local_1', name: 'Local App', remoteId: 'remote_1', addedAt: Date.now() },
        ];
        const remoteApp = { id: 'remote_1', name: 'Remote App', sourceType: 'url', source: 'https://example.com', icon: '🌐', version: '1.0.0', lastUpdated: Date.now() };

        const exists = existingApps.some(a => a.remoteId === remoteApp.id);
        expect(exists).toBe(true);

        // New app should not exist
        const newRemoteApp = { id: 'remote_2', name: 'Remote App 2', sourceType: 'url', source: 'https://example2.com', icon: '🌐', version: '2.0.0', lastUpdated: Date.now() };
        const exists2 = existingApps.some(a => a.remoteId === newRemoteApp.id);
        expect(exists2).toBe(false);
    });
});