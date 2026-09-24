import { createClient } from '@sanity/client';

/**
 * Client d'accès à l'API Sanity CMS.
 * Permet d'effectuer des requêtes GROQ pour récupérer le catalogue d'applications,
 * les catégories et les informations développeur.
 */
export const client = createClient({
  projectId: process.env.EXPO_PUBLIC_SANITY_PROJECT_ID || '7a6tocy4',
  dataset: process.env.EXPO_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2024-03-01',
});

/**
 * Requête GROQ : Récupère la liste de toutes les Mini-Apps publiées sur Sanity CMS,
 * triées par date de dernière mise à jour descendante.
 */
export const getRemoteAppsQuery = `*[_type == "miniApp" && coalesce(isPublished, true) == true] {
  "id": _id,
  name,
  description,
  "categoryId": lower(coalesce(category->name.current, category->name, category->title)),
  sourceType,
  source,
  "icon": coalesce(icon, "🌐"),
  version,
  tags,
  featured,
  author,
  isPublished,
  "lastUpdated": coalesce(lastUpdated, _updatedAt)
} | order(lastUpdated desc)`;

/**
 * Requête GROQ : Récupère l'ensemble des catégories définies dans le CMS Sanity.
 */
export const getCategoriesQuery = `*[_type == "category"] {
  "id": _id,
  name,
  title,
  description,
  icon,
  color
}`;

/**
 * Requête GROQ : Récupère uniquement les Mini-Apps mises en avant ("featured").
 */
export const getFeaturedAppsQuery = `*[_type == "miniApp" && coalesce(isPublished, true) == true && featured == true] {
  "id": _id,
  name,
  description,
  "categoryId": lower(coalesce(category->name.current, category->name, category->title)),
  sourceType,
  source,
  "icon": coalesce(icon, "🌐"),
  version,
  tags,
  author,
  isPublished,
  "lastUpdated": coalesce(lastUpdated, _updatedAt)
} | order(lastUpdated desc)`;

/**
 * Requête GROQ : Récupère le profil et les informations de contact du développeur.
 */
export const getDeveloperQuery = `*[_type == "developer"][0] {
  name,
  "photoUrl": photo.asset->url,
  bio,
  services[] {
    title,
    icon
  },
  links {
    whatsapp,
    github,
    linkedin,
    email,
    portfolio
  }
}`;
