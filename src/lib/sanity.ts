import {createClient} from '@sanity/client'

export const client = createClient({
  projectId: process.env.EXPO_PUBLIC_SANITY_PROJECT_ID || '7a6tocy4',
  dataset: process.env.EXPO_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2024-03-01', // Utilisez la date du jour
})

export const getRemoteAppsQuery = `*[_type == "miniApp"] {
  "id": _id,
  name,
  description,
  "categoryId": category->name,
  sourceType,
  source,
  "icon": coalesce(icon, "🌐"),
  version,
  tags,
  featured,
  author,
  "lastUpdated": coalesce(lastUpdated, _updatedAt)
} | order(lastUpdated desc)`

export const getCategoriesQuery = `*[_type == "category"] {
  "id": _id,
  name,
  title,
  description,
  icon,
  color
}`

export const getFeaturedAppsQuery = `*[_type == "miniApp" && featured == true] {
  "id": _id,
  name,
  description,
  "categoryId": category->name,
  sourceType,
  source,
  icon,
  version,
  tags,
  author,
  "lastUpdated": coalesce(lastUpdated, _updatedAt)
} | order(lastUpdated desc)`
