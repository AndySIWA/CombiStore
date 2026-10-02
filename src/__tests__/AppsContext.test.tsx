import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppsProvider, useApps } from '../context/AppsContext';
import { client } from '../lib/sanity';
import { SAMPLE_APPS } from '../constants/defaults';
import { MiniApp, RemoteApp } from '../types';

// ─── Mocks ────────────────────────────────────────────────────────────────────

// Stockage clé/valeur en mémoire : déterministe, persistant entre les appels
// d'un même test, remis à zéro dans beforeEach.
jest.mock('@react-native-async-storage/async-storage', () => {
    const store = new Map<string, string>();
    return {
        __esModule: true,
        default: {
            getItem: jest.fn((key: string) =>
                Promise.resolve(store.has(key) ? (store.get(key) as string) : null),
            ),
            setItem: jest.fn((key: string, value: string) => {
                store.set(key, value);
                return Promise.resolve();
            }),
            removeItem: jest.fn((key: string) => {
                store.delete(key);
                return Promise.resolve();
            }),
            getAllKeys: jest.fn(() => Promise.resolve(Array.from(store.keys()))),
            clear: jest.fn(() => {
                store.clear();
                return Promise.resolve();
            }),
        },
    };
});

// Aucun appel réseau réel : AppsContext déclenche client.fetch au montage.
jest.mock('../lib/sanity', () => ({
    client: { fetch: jest.fn() },
    getRemoteAppsQuery: 'MOCK_GET_REMOTE_APPS_QUERY',
}));

// ─── Fixtures ────────────────────────────────────────────────────────────────

const STORAGE_KEY = '@combistore_apps';
const CUSTOM_APPS_KEY = '@combistore_custom_apps';
const REMOTE_CACHE_KEY = '@combistore_remote_apps_cache';

const localOldApp: MiniApp = {
    id: 'app_local_1',
    remoteId: 'remote_1',
    name: 'Ancienne App',
    description: 'Description ancienne',
    categoryId: 'tools',
    sourceType: 'url',
    source: 'https://ancien.example.com',
    icon: '📦',
    addedAt: 1_700_000_000_000,
    version: '1.0.0',
    lastUpdated: '2026-01-01',
};

const remoteNewApp: RemoteApp = {
    id: 'remote_1',
    name: 'Nouvelle App',
    description: 'Description nouvelle',
    categoryId: 'games',
    sourceType: 'html',
    source: '<h1>v2</h1>',
    icon: '🚀',
    version: '2.0.0',
    lastUpdated: '2026-09-24',
};

// App locale SANS remoteId (app manuelle) : la synchronisation Sanity ne la
// touche pas, mais elle reste trouvable par nom dans le catalogue distant.
const localManualApp: MiniApp = {
    id: 'app_manual_1',
    name: 'Old App',
    description: 'Ancienne description',
    categoryId: 'tools',
    sourceType: 'url',
    source: 'https://old.example.com',
    icon: '📦',
    addedAt: 1_700_000_000_000,
    version: '1.0.0',
    lastUpdated: '2026-01-01',
};

// Même nom que localManualApp mais version plus récente.
const remoteSameNameNewer: RemoteApp = {
    id: 'remote_2',
    name: 'Old App',
    description: 'Ancienne description',
    categoryId: 'tools',
    sourceType: 'url',
    source: 'https://old.example.com',
    icon: '📦',
    version: '2.0.0',
    lastUpdated: '2026-09-24',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fetchMock = client.fetch as unknown as jest.Mock;

let current: ReturnType<typeof useApps> | undefined;

function Probe() {
    current = useApps();
    return null;
}

function getCtx(): ReturnType<typeof useApps> {
    if (!current) {
        throw new Error('AppsContext non monté : le Probe n\'a pas rendu.');
    }
    return current;
}

function renderProvider() {
    return render(
        <AppsProvider>
            <Probe />
        </AppsProvider>,
    );
}

async function seedStorage(entries: Record<string, unknown>) {
    for (const [key, value] of Object.entries(entries)) {
        await AsyncStorage.setItem(key, JSON.stringify(value));
    }
}

function readStored<T>(key: string): Promise<T | null> {
    return AsyncStorage.getItem(key).then(raw => (raw ? (JSON.parse(raw) as T) : null));
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('AppsContext', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        await AsyncStorage.clear();
        current = undefined;

        // Sanity injoignable par défaut : chaque test surcharge fetchMock s'il
        // a besoin de données distantes. Évite tout réseau réel.
        fetchMock.mockReset();
        fetchMock.mockRejectedValue(new Error('hors-ligne (mock)'));

        // Le contexte loggue volontairement ses erreurs en mode hors-ligne :
        // on garde la sortie Jest propre.
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('chargement initial : storage vide + Sanity indisponible → apps de démonstration et mode hors-ligne', async () => {
        renderProvider();

        await waitFor(() => expect(getCtx().isOffline).toBe(true));

        expect(getCtx().loading).toBe(false);
        expect(getCtx().apps).toEqual(SAMPLE_APPS);
        expect(getCtx().remoteApps).toEqual([]);
    });

    test('persistance locale : les apps enregistrées sont restaurées depuis AsyncStorage', async () => {
        await seedStorage({ [STORAGE_KEY]: [localOldApp] });

        renderProvider();

        await waitFor(() => expect(getCtx().isOffline).toBe(true));

        expect(getCtx().apps).toHaveLength(1);
        expect(getCtx().apps[0]).toEqual(localOldApp);
        expect(getCtx().apps.find(a => a.id === SAMPLE_APPS[0].id)).toBeUndefined();
    });

    test('removeApp : supprime l\'app de l\'état et du stockage local', async () => {
        await seedStorage({
            [STORAGE_KEY]: [localOldApp],
            [CUSTOM_APPS_KEY]: [localOldApp],
        });

        renderProvider();
        await waitFor(() => expect(getCtx().isOffline).toBe(true));

        await act(async () => {
            await getCtx().removeApp('app_local_1');
        });

        expect(getCtx().apps.find(a => a.id === 'app_local_1')).toBeUndefined();

        const storedApps = await readStored<MiniApp[]>(STORAGE_KEY);
        expect(storedApps?.find(a => a.id === 'app_local_1')).toBeUndefined();

        const storedCustom = await readStored<MiniApp[]>(CUSTOM_APPS_KEY);
        expect(storedCustom).toEqual([]);
    });

    test('updateApp : modifie partiellement une app et persiste le résultat', async () => {
        await seedStorage({
            [STORAGE_KEY]: [localOldApp],
            [CUSTOM_APPS_KEY]: [localOldApp],
        });

        renderProvider();
        await waitFor(() => expect(getCtx().isOffline).toBe(true));

        await act(async () => {
            await getCtx().updateApp('app_local_1', { name: 'Renommée', version: '1.1.0' });
        });

        const updated = getCtx().apps.find(a => a.id === 'app_local_1');
        expect(updated?.name).toBe('Renommée');
        expect(updated?.version).toBe('1.1.0');
        // Les champs non touchés par le partial update sont préservés.
        expect(updated?.description).toBe(localOldApp.description);
        expect(updated?.source).toBe(localOldApp.source);
        expect(updated?.addedAt).toBe(localOldApp.addedAt);

        const storedApps = await readStored<MiniApp[]>(STORAGE_KEY);
        expect(storedApps?.find(a => a.id === 'app_local_1')?.name).toBe('Renommée');
    });

    test('importRemoteApp : importe une app distante, sans doublon à la seconde tentative', async () => {
        renderProvider();
        await waitFor(() => expect(getCtx().isOffline).toBe(true));

        let imported: MiniApp | null = null;
        await act(async () => {
            imported = await getCtx().importRemoteApp(remoteNewApp);
        });

        expect(imported).not.toBeNull();
        expect(getCtx().apps.filter(a => a.remoteId === 'remote_1')).toHaveLength(1);
        expect(getCtx().apps.find(a => a.remoteId === 'remote_1')?.name).toBe(remoteNewApp.name);

        // Second import : refusé, aucune duplication.
        let second: MiniApp | null = remoteNewApp as unknown as MiniApp;
        await act(async () => {
            second = await getCtx().importRemoteApp(remoteNewApp);
        });

        expect(second).toBeNull();
        expect(getCtx().apps.filter(a => a.remoteId === 'remote_1')).toHaveLength(1);
    });

    test('checkForMiniAppUpdates : applique automatiquement une version distante plus récente', async () => {
        // App locale sans remoteId :
        // le matching par nom permet de retrouver l'app distante.
        await seedStorage({
            [STORAGE_KEY]: [localManualApp],
        });

        fetchMock.mockResolvedValue([remoteSameNameNewer]);

        renderProvider();

        // Attendre que le catalogue distant soit chargé.
        await waitFor(() => expect(getCtx().remoteApps).toHaveLength(1));

        // Au démarrage, l'app n'a pas de remoteId :
        // elle ne doit donc pas être auto-mise à jour par le premier chargement.
        expect(getCtx().apps[0].version).toBe('1.0.0');

        await act(async () => {
            await getCtx().checkForMiniAppUpdates();
        });

        // La nouvelle logique applique directement la mise à jour.
        expect(getCtx().updateStatus).toBe('INSTALLED');

        const updated = getCtx().apps.find(
            a => a.id === localManualApp.id,
        );

        expect(updated).toBeDefined();
        expect(updated?.version).toBe(remoteSameNameNewer.version);
        expect(updated?.name).toBe(remoteSameNameNewer.name);
        expect(updated?.description).toBe(remoteSameNameNewer.description);
        expect(updated?.source).toBe(remoteSameNameNewer.source);
        expect(updated?.lastUpdated).toBe(remoteSameNameNewer.lastUpdated);

        // Vérifier que la nouvelle version est bien persistée.
        const storedApps = await readStored<MiniApp[]>(STORAGE_KEY);

        const storedUpdated = storedApps?.find(
            a => a.id === localManualApp.id,
        );

        expect(storedUpdated?.version).toBe(remoteSameNameNewer.version);
        expect(storedUpdated?.source).toBe(remoteSameNameNewer.source);
    });

    test('checkForMiniAppUpdates : pas de mise à jour quand la version locale est à jour', async () => {
        const upToDateLocal: MiniApp = { ...localManualApp };
        // hasRemoteChanges compare les 8 champs : doit correspondre à 100 %.
        const upToDateRemote: RemoteApp = {
            ...remoteSameNameNewer,
            version: '1.0.0',
            lastUpdated: localManualApp.lastUpdated,
        };
        await seedStorage({ [STORAGE_KEY]: [upToDateLocal] });
        fetchMock.mockResolvedValue([upToDateRemote]);

        renderProvider();
        await waitFor(() => expect(getCtx().remoteApps).toHaveLength(1));

        await act(async () => {
            await getCtx().checkForMiniAppUpdates();
        });

        expect(getCtx().updateStatus).toBe('INSTALLED');
    });

    test('installMiniAppUpdate : remplace les 8 champs par ceux de la version distante et persiste', async () => {
        // App locale avec remoteId, cache distant contenant la v2, Sanity hors-ligne :
        // le fetch du montage échoue → aucun rattrapage automatique, l'app locale
        // reste volontairement en v1 pour que installMiniAppUpdate fasse le travail.
        await seedStorage({
            [STORAGE_KEY]: [localOldApp],
            [REMOTE_CACHE_KEY]: [remoteNewApp],
        });

        renderProvider();
        await waitFor(() => expect(getCtx().remoteApps).toHaveLength(1));
        expect(getCtx().apps[0].version).toBe('1.0.0');

        let result: MiniApp | null = null;
        await act(async () => {
            result = await getCtx().installMiniAppUpdate('app_local_1');
        });

        expect(result).not.toBeNull();
        expect(getCtx().updateStatus).toBe('INSTALLED');

        const installed = getCtx().apps.find(a => a.id === 'app_local_1');
        expect(installed).toBeDefined();

        // Les 8 champs de métadonnées sont remplacés par la version distante.
        expect(installed?.name).toBe(remoteNewApp.name);
        expect(installed?.description).toBe(remoteNewApp.description);
        expect(installed?.categoryId).toBe(remoteNewApp.categoryId);
        expect(installed?.sourceType).toBe(remoteNewApp.sourceType);
        expect(installed?.source).toBe(remoteNewApp.source);
        expect(installed?.icon).toBe(remoteNewApp.icon);
        expect(installed?.version).toBe(remoteNewApp.version);
        expect(installed?.lastUpdated).toBe(remoteNewApp.lastUpdated);

        // L'identité locale est préservée.
        expect(installed?.id).toBe('app_local_1');
        expect(installed?.remoteId).toBe('remote_1');
        expect(installed?.addedAt).toBe(localOldApp.addedAt);

        // La mise à jour est persistée localement.
        const storedApps = await readStored<MiniApp[]>(STORAGE_KEY);
        expect(storedApps?.find(a => a.id === 'app_local_1')?.version).toBe(remoteNewApp.version);
        expect(storedApps?.find(a => a.id === 'app_local_1')?.source).toBe(remoteNewApp.source);
    });
});
