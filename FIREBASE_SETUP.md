# 🔥 Configuration Firebase pour CombiStore

Ce guide explique comment créer le projet Firebase gratuitement et renseigner les clés dans `.env` pour activer l'authentification Google et la synchronisation des favoris.

> **Coût total : 0,00 €** — Le plan Spark (gratuit) de Firebase est largement suffisant pour CombiStore.

---

## Étape 1 — Créer un projet Firebase

1. Aller sur **[https://console.firebase.google.com](https://console.firebase.google.com)**
2. Cliquer sur **« Créer un projet »**
3. Nommer le projet **`combistore-app`** (ou tout autre nom)
4. Désactiver Google Analytics (facultatif) → **Créer le projet**

---

## Étape 2 — Activer l'authentification Google

1. Dans la console Firebase, aller dans **Authentification → Méthodes de connexion**
2. Activer **Google**
3. Saisir un email d'assistance de projet
4. **Enregistrer**

---

## Étape 3 — Créer la base de données Firestore

1. Dans la console Firebase, aller dans **Firestore Database → Créer une base de données**
2. Choisir le mode **Production**
3. Sélectionner la région la plus proche (ex : `europe-west1`)
4. **Activer**

### Règles de sécurité Firestore recommandées

Dans **Firestore → Règles**, remplacer le contenu par :

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Chaque utilisateur ne peut lire/écrire que ses propres données
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## Étape 4 — Récupérer la configuration Firebase (SDK Web)

1. Dans la console Firebase, aller dans **Paramètres du projet** (⚙️ → Paramètres du projet)
2. Scroller jusqu'à **« Vos applications »** → Cliquer sur l'icône **Web** (`</>`)
3. Nommer l'app (ex : `CombiStore Web`) → **Enregistrer l'app**
4. Copier la configuration affichée :

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "combistore-app.firebaseapp.com",
  projectId: "combistore-app",
  storageBucket: "combistore-app.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};
```

5. Reporter chaque valeur dans le fichier **`.env`** :

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=combistore-app.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=combistore-app
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=combistore-app.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
EXPO_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
```

---

## Étape 5 — Récupérer le Web Client ID Google (pour OAuth)

1. Dans la console Firebase, aller dans **Authentification → Méthodes de connexion → Google**
2. Scroller jusqu'à **"ID client Web"** et copier la valeur

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=1234567890-xxxxxx.apps.googleusercontent.com
```

> **Android/iOS** : Si vous souhaitez un flux natif optimisé (feuille Google native), allez dans [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials) et créez des ID client OAuth pour Android et iOS. Ce n'est **pas obligatoire** — le flux WebBrowser fonctionne sans.

---

## Étape 6 — Redémarrer le serveur Expo

Après avoir renseigné les variables dans `.env` :

```bash
npx expo start --clear
```

---

## Résultat attendu

Une fois configuré, l'application CombiStore disposera de :

| Fonctionnalité | État |
|---|---|
| ✅ Connexion Google en 2 clics | Actif |
| ✅ Avatar utilisateur dans le Header | Actif |
| ✅ Modal de profil avec stats | Actif |
| ✅ Favoris locaux (AsyncStorage) | Actif |
| ✅ Synchronisation Favoris → Firestore | Actif |
| ✅ Filtre ❤️ Favoris dans Explorer | Actif |
| ✅ Bouton cœur animé sur chaque carte | Actif |
| ✅ Bouton cœur dans le Viewer | Actif |
| ✅ Mode Hors-Ligne (AsyncStorage only) | Toujours actif |

---

## Quotas gratuits Firebase (plan Spark)

| Service | Quota gratuit/jour |
|---|---|
| Auth (Google Sign-In) | **Illimité** |
| Firestore — Lectures | 50 000 / jour |
| Firestore — Écritures | 20 000 / jour |
| Firestore — Stockage | 1 Go total |

Ces quotas sont largement suffisants pour CombiStore, même avec plusieurs centaines d'utilisateurs actifs par jour.
