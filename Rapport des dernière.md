# CombiStore — Rapport des dernières corrections

**Date :** 24 septembre 2026
**Dépôt :** `AndySIWA/CombiStore`
**Branche :** `master`

## 1. Objet

L’audit précédent a confirmé que les principales faiblesses structurelles de CombiStore ont été corrigées.

Le projet est désormais dans une phase de **consolidation et de sécurisation**, et non de refonte architecturale.

Les corrections restantes sont regroupées ci-dessous par priorité.

---

# 2. Corrections prioritaires

## P0 — Sécurité et isolation des Mini-Apps

### 2.1 Isoler davantage les WebViews

**Constat :**

Le lecteur `app/viewer/[id].tsx` possède déjà plusieurs protections :

* désactivation de l'accès aux fichiers locaux ;
* restriction des schémas d'URL ;
* `originWhitelist` ;
* sandbox HTML ;
* contrôle des navigations.

Cependant, les Mini-Apps externes peuvent encore charger des ressources HTTP/HTTPS relativement librement.

### Correction

Renforcer progressivement la politique de navigation :

```text
Mini-App
   │
   ├── HTML local → sandbox isolé
   │
   └── URL externe
          │
          └── domaine autorisé
```

Prévoir notamment :

* liste blanche de domaines lorsque nécessaire ;
* blocage des schémas non nécessaires ;
* ouverture externe des liens qui sortent du périmètre autorisé ;
* isolation stricte entre Mini-Apps.

### Priorité

**P0 — Sécurité**

---

# 3. Gestion des versions des Mini-Apps

## 3.1 Ajouter une vraie logique de mise à jour

Le modèle contient désormais :

```text
version
lastUpdated
```

Mais ces informations ne sont pas encore utilisées pour fournir un véritable cycle :

```text
Version installée
       ↓
Comparaison CMS
       ↓
Nouvelle version disponible ?
       ↓
Oui → proposer la mise à jour
       ↓
Téléchargement / remplacement
       ↓
Validation
       ↓
Version active
```

### Fonctionnalités à ajouter

Chaque Mini-App devrait pouvoir avoir :

* `version`
* `lastUpdated`
* éventuellement `minAppVersion`
* éventuellement `checksum`
* éventuellement `size`

L'application devra pouvoir déterminer :

```text
installedVersion < remoteVersion
```

et afficher :

> Mise à jour disponible — v1.3.0

### Priorité

**P0 — Fonctionnalité cœur du Store**

---

# 4. Cycle d'installation / mise à jour

## 4.1 Formaliser le lifecycle

Le système devrait distinguer clairement :

```text
AVAILABLE
    ↓
INSTALLING
    ↓
INSTALLED
    ↓
UPDATE_AVAILABLE
    ↓
UPDATING
    ↓
INSTALLED
```

Avec également :

```text
INSTALL_FAILED
UPDATE_FAILED
```

### Objectif

Éviter qu'une mise à jour interrompue ou corrompue laisse l'utilisateur avec une Mini-App inutilisable.

### Recommandation

Utiliser une stratégie atomique :

```text
ancienne version
       ↓
téléchargement nouvelle version
       ↓
validation
       ↓
activation
       ↓
suppression ancienne version
```

Ne jamais supprimer l'ancienne version avant validation de la nouvelle.

### Priorité

**P0**

---

# 5. Nettoyage des dépendances

## 5.1 Supprimer Supabase

`@supabase/supabase-js` est présent dans `package.json`, mais aucune utilisation réelle n'a été identifiée.

L'architecture actuelle utilise :

* Firebase Authentication
* Firestore
* Sanity CMS

### Correction

Supprimer :

```json
"@supabase/supabase-js": "..."
```

puis synchroniser :

```text
package-lock.json
```

### Priorité

**P1 — Nettoyage technique**

---

# 6. Configuration ESLint

## 6.1 Corriger le script `lint`

Le projet possède actuellement une commande de type :

```bash
npm run lint
```

mais aucun système ESLint complet n'a été identifié.

### Deux possibilités

#### Option A — Installer/configurer ESLint

Ajouter :

```text
eslint
eslint-config-expo
```

et une configuration adaptée à Expo/TypeScript.

Puis conserver :

```json
"lint": "eslint ."
```

#### Option B — Retirer temporairement `lint`

Si ESLint n'est pas encore souhaité, supprimer le script afin de ne pas laisser une commande cassée.

### Recommandation

**Option A**, car CombiStore commence à devenir suffisamment important pour bénéficier d'une vérification statique systématique.

### Priorité

**P1**

---

# 7. Ajouter `.env.example`

Le `.env` réel est maintenant correctement ignoré par Git.

Il manque cependant un modèle de configuration.

Créer :

```text
.env.example
```

avec uniquement des valeurs fictives :

```env
EXPO_PUBLIC_SANITY_PROJECT_ID=your_project_id
EXPO_PUBLIC_SANITY_DATASET=production

EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID=your_client_id
```

### Priorité

**P1**

---

# 8. Normalisation des catégories Sanity

Le code utilise encore une logique de compatibilité du type :

```groq
category->name.current
category->name
category->title
```

alors que le schéma actuel utilise désormais un champ `name` simple.

### Correction

Utiliser une référence canonique :

```groq
category->name
```

Idéalement, introduire également un `slug` :

```text
category
├── name
├── title
├── slug
├── icon
└── color
```

Le `slug` devrait devenir l'identifiant stable utilisé par l'application.

### Priorité

**P1**

---

# 9. Tests automatisés

## 9.1 Ajouter une première couche de tests

Aucun véritable système de tests automatisés complet n'a encore été identifié.

### Minimum recommandé

Tester :

### AppsContext

* chargement local ;
* chargement distant ;
* fallback offline ;
* ajout ;
* suppression ;
* synchronisation ;
* fusion des données.

### Favoris

* ajout ;
* suppression ;
* persistance ;
* synchronisation Firebase.

### Mini-App

* résolution d'une Mini-App ;
* détection d'une version plus récente ;
* comportement lorsqu'une source distante est indisponible.

### Priorité

**P1**

---

# 10. CI/CD

## 10.1 Ajouter une GitHub Action

Créer :

```text
.github/
└── workflows/
    └── ci.yml
```

Pipeline minimal :

```yaml
Install
   ↓
TypeScript
   ↓
Build Web
```

Commandes :

```bash
npm ci
npm run typecheck
npm run build:web
```

### Évolution ultérieure

Ajouter :

```text
Lint
 ↓
Unit Tests
 ↓
Expo Doctor
 ↓
Build
```

puis éventuellement :

```text
CI
 ↓
EAS Build
 ↓
Release
```

### Priorité

**P1**

---

# 11. Observabilité et gestion des erreurs

CombiStore devra progressivement pouvoir identifier :

* échec de chargement d'une Mini-App ;
* erreur réseau ;
* erreur Sanity ;
* erreur Firebase ;
* échec d'installation ;
* échec de mise à jour ;
* crash WebView.

Prévoir à terme un service d'observabilité ou au minimum un système centralisé de logs.

### Priorité

**P2**

---

# 12. Migration stricte de `isPublished`

La requête actuelle utilise une logique compatible avec les anciens documents :

```groq
coalesce(isPublished, true) == true
```

Cela signifie qu'un document ne possédant pas encore `isPublished` peut être considéré comme publié.

### Objectif final

Après migration de tous les documents Sanity :

```groq
isPublished == true
```

Ainsi :

```text
isPublished = true  → visible
isPublished = false → masqué
absent               → masqué
```

### Priorité

**P2**

---

# 13. Architecture cible après corrections

L'architecture devrait progressivement évoluer vers :

```text
                    ┌──────────────────┐
                    │   Sanity CMS     │
                    │ Catalogue +      │
                    │ versions         │
                    └────────┬─────────┘
                             │
                             ▼
┌──────────────┐      ┌───────────────┐
│ AsyncStorage │◄────►│ AppsContext   │
│ Cache local  │      │               │
└──────────────┘      └───────┬───────┘
                              │
               ┌──────────────┼──────────────┐
               ▼              ▼              ▼
          Catalogue       Versions       Favoris
               │              │              │
               ▼              ▼              ▼
          Installation     Update        Firebase
               │
               ▼
        ┌───────────────┐
        │   WebView     │
        │  isolée        │
        └───────────────┘
```

---

# 14. Ordre d'exécution recommandé

| Priorité | Correction                      | Objectif             |
| -------- | ------------------------------- | -------------------- |
| **P0**   | Sécurisation WebView            | Sécurité             |
| **P0**   | Versioning Mini-Apps            | Fonctionnalité Store |
| **P0**   | Installation / Update lifecycle | Fiabilité            |
| **P1**   | Supprimer Supabase              | Nettoyage            |
| **P1**   | ESLint                          | Qualité du code      |
| **P1**   | `.env.example`                  | Maintenabilité       |
| **P1**   | Normalisation catégories        | Cohérence            |
| **P1**   | Tests automatisés               | Fiabilité            |
| **P1**   | CI GitHub                       | Qualité continue     |
| **P2**   | Observabilité                   | Exploitation         |
| **P2**   | Migration `isPublished` stricte | Cohérence CMS        |

---

# 15. Conclusion

CombiStore ne nécessite **pas de refonte architecturale**.

La prochaine étape doit être une phase de **stabilisation professionnelle** :

```text
Architecture actuelle
        ↓
Sécurité
        ↓
Versioning
        ↓
Update fiable
        ↓
Tests
        ↓
CI/CD
        ↓
Observabilité
        ↓
Version production robuste
```

Une fois ces éléments traités, CombiStore disposera d'une base beaucoup plus solide pour évoluer d'un simple lecteur de Mini-Apps vers un **véritable Store de Mini-Apps web distribuées**.
