const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: '7a6tocy4',
  dataset: 'production',
  useCdn: false,
  token: process.env.SANITY_AUTH_TOKEN,
  apiVersion: '2024-03-01',
})

async function createTestData() {
  try {
    console.log('🚀 Création de données de test...\n')

    // Créer des catégories
    const categories = [
      {
        _type: 'category',
        name: { _type: 'slug', current: 'games' },
        title: 'Jeux',
        description: 'Applications de jeux et divertissement',
        icon: '🎮',
        color: '#EF4444',
        order: 1,
        isActive: true,
      },
      {
        _type: 'category',
        name: { _type: 'slug', current: 'tools' },
        title: 'Outils',
        description: 'Outils de productivité et utilitaires',
        icon: '🔧',
        color: '#3B82F6',
        order: 2,
        isActive: true,
      },
      {
        _type: 'category',
        name: { _type: 'slug', current: 'utilities' },
        title: 'Utilitaires',
        description: 'Applications utilitaires diverses',
        icon: '⚡',
        color: '#6366F1',
        order: 3,
        isActive: true,
      },
    ]

    console.log('📂 Création des catégories...')
    for (const cat of categories) {
      const result = await client.createOrReplace(cat)
      console.log(`  ✓ ${cat.title} créé`)
    }

    // Créer des mini-apps
    const miniApps = [
      {
        _type: 'miniApp',
        name: '2048 Game',
        slug: { _type: 'slug', current: '2048-game' },
        description: 'Le célèbre jeu de puzzle où vous devez combiner les tuiles pour atteindre 2048.',
        category: { _type: 'reference', _ref: 'games' }, // Sera résolu après création
        sourceType: 'url',
        source: 'https://play2048.co',
        icon: '🔢',
        version: '1.0.0',
        tags: ['jeu', 'puzzle', 'mathématiques'],
        isPublished: true,
        featured: true,
        author: 'CombiStore',
        lastUpdated: new Date().toISOString(),
      },
      {
        _type: 'miniApp',
        name: 'Sudoku Online',
        slug: { _type: 'slug', current: 'sudoku-online' },
        description: 'Résolvez des grilles de sudoku de difficulté variable.',
        category: { _type: 'reference', _ref: 'games' },
        sourceType: 'url',
        source: 'https://sudoku.com',
        icon: '🧩',
        version: '1.0.0',
        tags: ['jeu', 'logique', 'cerveau'],
        isPublished: true,
        featured: false,
        author: 'CombiStore',
        lastUpdated: new Date().toISOString(),
      },
      {
        _type: 'miniApp',
        name: 'Excalidraw',
        slug: { _type: 'slug', current: 'excalidraw' },
        description: 'Tableau blanc collaboratif pour dessiner et esquisser des idées.',
        category: { _type: 'reference', _ref: 'tools' },
        sourceType: 'url',
        source: 'https://excalidraw.com',
        icon: '✏️',
        version: '1.0.0',
        tags: ['dessin', 'collaboration', 'créativité'],
        isPublished: true,
        featured: true,
        author: 'CombiStore',
        lastUpdated: new Date().toISOString(),
      },
      {
        _type: 'miniApp',
        name: 'Pomodoro Timer',
        slug: { _type: 'slug', current: 'pomodoro-timer' },
        description: 'Technique Pomodoro pour améliorer votre productivité.',
        category: { _type: 'reference', _ref: 'utilities' },
        sourceType: 'url',
        source: 'https://pomofocus.io',
        icon: '🍅',
        version: '1.0.0',
        tags: ['productivité', 'timer', 'focus'],
        isPublished: true,
        featured: false,
        author: 'CombiStore',
        lastUpdated: new Date().toISOString(),
      },
    ]

    console.log('\n📱 Création des mini-apps...')
    for (const app of miniApps) {
      // Résoudre la référence de catégorie
      const catQuery = `*[_type == "category" && name.current == "${app.category._ref}"][0]`
      const category = await client.fetch(catQuery)
      if (category) {
        app.category._ref = category._id
      }

      const result = await client.create(app)
      console.log(`  ✓ ${app.name} créé`)
    }

    console.log('\n✅ Données de test créées avec succès!')

  } catch (error) {
    console.error('❌ Erreur lors de la création:', error.message)
  }
}

createTestData()