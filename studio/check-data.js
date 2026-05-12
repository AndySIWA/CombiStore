const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: '7a6tocy4',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-03-01',
})

async function checkData() {
  try {
    console.log('🔍 Vérification des données Sanity...\n')

    // Vérifier les catégories
    const categories = await client.fetch('*[_type == "category"]')
    console.log(`📂 Catégories trouvées: ${categories.length}`)
    categories.forEach(cat => {
      console.log(`  - ${cat.title} (${cat.name?.current || cat.name})`)
    })

    // Vérifier les mini-apps
    const miniApps = await client.fetch('*[_type == "miniApp"]')
    console.log(`\n📱 Mini-apps trouvées: ${miniApps.length}`)
    miniApps.forEach(app => {
      console.log(`  - ${app.name} (${app.isPublished ? 'publié' : 'brouillon'})`)
      console.log(`    Catégorie: ${app.category?._ref || 'non définie'}`)
    })

    // Tester la requête utilisée dans l'app
    const remoteAppsQuery = `*[_type == "miniApp" && isPublished == true] {
      "id": _id,
      name,
      description,
      "categoryId": category->name.current,
      sourceType,
      source,
      icon,
      version,
      tags,
      featured,
      author,
      lastUpdated
    } | order(lastUpdated desc)`

    const remoteApps = await client.fetch(remoteAppsQuery)
    console.log(`\n🌐 Apps distantes récupérables: ${remoteApps.length}`)
    remoteApps.forEach(app => {
      console.log(`  - ${app.name} (catégorie: ${app.categoryId})`)
    })

  } catch (error) {
    console.error('❌ Erreur:', error.message)
  }
}

checkData()