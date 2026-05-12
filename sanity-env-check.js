// Script de vérification de l'environnement Sanity
const sanityClient = require('@sanity/client');

console.log('=== Vérification de la configuration Sanity ===');

// Vérifier les variables d'environnement
const projectId = process.env.EXPO_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.EXPO_PUBLIC_SANITY_DATASET;

console.log('EXPO_PUBLIC_SANITY_PROJECT_ID:', projectId ? 'Défini' : 'NON DÉFINI');
console.log('EXPO_PUBLIC_SANITY_DATASET:', dataset ? 'Défini' : 'NON DÉFINI');

if (!projectId || !dataset) {
  console.error('❌ Erreur: Les variables d\'environnement Sanity ne sont pas configurées');
  process.exit(1);
}

// Créer un client de test
const client = sanityClient.createClient({
  projectId,
  dataset,
  useCdn: false,
  apiVersion: new Date().toISOString().slice(0, 10),
});

// Tester la connexion
client.fetch('*[_type == "miniApp"]{name}').then(data => {
  console.log('✅ Connexion Sanity réussie');
  console.log(`📱 Applications trouvées: ${data.length}`);
  process.exit(0);
}).catch(err => {
  console.error('❌ Erreur de connexion à Sanity:', err.message);
  process.exit(1);
});