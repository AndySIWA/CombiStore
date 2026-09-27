import * as Updates from 'expo-updates';
import { Alert } from 'react-native';

/**
 * Service gérant les mises à jour automatiques Over-The-Air (OTA) via `expo-updates`.
 * Vérifie si une mise à jour du bundle JS est disponible sur le serveur EAS/Expo,
 * la télécharge en arrière-plan et invite l'utilisateur à redémarrer l'application.
 */
export async function checkForAppUpdates(): Promise<void> {
    // Les vérifications OTA sont désactivées en mode développement local (__DEV__)
    if (__DEV__) {
        return;
    }

    try {
        const update = await Updates.checkForUpdateAsync();

        if (update.isAvailable) {
            // Téléchargement de la mise à jour en arrière-plan
            await Updates.fetchUpdateAsync();

            Alert.alert(
                'Mise à jour disponible 🚀',
                'Une nouvelle version de CombiStore avec de nouvelles fonctionnalités ou améliorations est prête.',
                [
                    {
                        text: 'Redémarrer maintenant',
                        onPress: async () => {
                            try {
                                await Updates.reloadAsync();
                            } catch (e) {
                                console.error('Erreur lors du rechargement de l\'application :', e);
                            }
                        },
                    },
                    {
                        text: 'Plus tard',
                        style: 'cancel',
                    },
                ],
                { cancelable: true },
            );
        }
    } catch (error) {
        console.log('Erreur lors de la vérification de la mise à jour OTA :', error);
    }
}
