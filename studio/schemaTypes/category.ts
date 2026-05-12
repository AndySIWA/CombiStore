import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'category',
  title: 'Catégorie',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nom Interne',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Titre Affiché',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Emoji / Icône',
      type: 'string',
    }),
    defineField({
      name: 'color',
      title: 'Couleur (Hex)',
      type: 'string',
      initialValue: '#7C3AED',
    }),
  ],
})
