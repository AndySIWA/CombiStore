import { createClient } from '@sanity/client';

export const client = createClient({
  projectId: process.env.EXPO_PUBLIC_SANITY_PROJECT_ID || '7a6tocy4',
  dataset: process.env.EXPO_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2024-03-01',
});

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

export const getCategoriesQuery = `*[_type == "category"] {
  "id": _id,
  name,
  title,
  description,
  icon,
  color
}`;

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
