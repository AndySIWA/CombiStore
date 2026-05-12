# CombiStore Studio

Studio de gestion de contenu pour CombiStore, basé sur Sanity CMS.

## Démarrage

```bash
cd studio
npm install
npm run dev
```

Le studio sera accessible sur `http://localhost:3333`.

## Structure du contenu

### Mini Apps
- **Nom** : Nom affiché de l'application
- **Slug** : Identifiant URL automatique
- **Description** : Description détaillée (10-500 caractères)
- **Catégorie** : Référence à une catégorie existante
- **Type de Source** : URL externe ou code HTML intégré
- **Source** : URL complète ou code HTML
- **Icône** : Emoji représentant l'app
- **Version** : Numérotation sémantique (ex: 1.0.0)
- **Tags** : Mots-clés pour la recherche
- **Publié** : Contrôle la visibilité dans l'app
- **Mis en avant** : Met l'app en évidence
- **Auteur** : Créateur de l'app
- **Dernière mise à jour** : Date automatique

### Catégories
- **Nom interne** : Slug automatique depuis le titre
- **Titre affiché** : Nom visible dans l'app
- **Description** : Description optionnelle
- **Icône** : Emoji représentatif
- **Couleur** : Code hexadécimal (#FF0000)
- **Ordre d'affichage** : Position dans les listes
- **Actif** : Contrôle la visibilité

## Organisation du studio

Le studio est organisé avec des vues filtrées :
- **Toutes les Apps** : Liste complète
- **Apps Publiées** : Apps visibles dans le store
- **Apps en Brouillon** : Apps non publiées
- **Apps Mises en Avant** : Apps en vedette

## Bonnes pratiques

1. **Validation** : Tous les champs requis sont validés automatiquement
2. **Slugs** : Générés automatiquement depuis les noms
3. **Versions** : Suivre le versioning sémantique
4. **Tags** : Utiliser des mots-clés pertinents pour la recherche
5. **Publication** : Cocher "Publié" uniquement quand l'app est prête

## Configuration des données de test

Pour tester l'application, créez d'abord les catégories puis les mini-apps :

### 1. Créer des catégories

Créez ces catégories dans l'ordre :

1. **Jeux**
   - Nom interne : `games`
   - Titre : Jeux
   - Icône : 🎮
   - Couleur : #EF4444
   - Ordre : 1

2. **Outils**
   - Nom interne : `tools`
   - Titre : Outils
   - Icône : 🔧
   - Couleur : #3B82F6
   - Ordre : 2

3. **Utilitaires**
   - Nom interne : `utilities`
   - Titre : Utilitaires
   - Icône : ⚡
   - Couleur : #6366F1
   - Ordre : 3

### 2. Créer des mini-apps

Exemples d'apps à créer :

1. **2048 Game**
   - Nom : 2048 Game
   - Description : Le célèbre jeu de puzzle où vous devez combiner les tuiles pour atteindre 2048.
   - Catégorie : Jeux
   - Type : URL
   - Source : https://play2048.co
   - Icône : 🔢
   - Tags : jeu, puzzle, mathématiques
   - **Publié : ✅ Oui**
   - Mis en avant : ✅ Oui

2. **Sudoku Online**
   - Nom : Sudoku Online
   - Description : Résolvez des grilles de sudoku de difficulté variable.
   - Catégorie : Jeux
   - Type : URL
   - Source : https://sudoku.com
   - Icône : 🧩
   - Tags : jeu, logique, cerveau
   - **Publié : ✅ Oui**

3. **Excalidraw**
   - Nom : Excalidraw
   - Description : Tableau blanc collaboratif pour dessiner et esquisser des idées.
   - Catégorie : Outils
   - Type : URL
   - Source : https://excalidraw.com
   - Icône : ✏️
   - Tags : dessin, collaboration, créativité
   - **Publié : ✅ Oui**
   - Mis en avant : ✅ Oui

4. **Pomodoro Timer**
   - Nom : Pomodoro Timer
   - Description : Technique Pomodoro pour améliorer votre productivité.
   - Catégorie : Utilitaires
   - Type : URL
   - Source : https://pomofocus.io
   - Icône : 🍅
   - Tags : productivité, timer, focus
   - **Publié : ✅ Oui**

## API GraphQL

Utilisez l'onglet "Vision" pour tester les requêtes GraphQL et explorer le schéma de données.