import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'miniApp',
  title: 'Mini App',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nom',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'category',
      title: 'Catégorie',
      type: 'reference',
      to: [{type: 'category'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sourceType',
      title: 'Type de Source',
      type: 'string',
      options: {
        list: [
          {title: 'URL', value: 'url'},
          {title: 'HTML', value: 'html'},
        ],
      },
      initialValue: 'url',
    }),
    defineField({
      name: 'source',
      title: 'URL ou Code HTML',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Icône (Emoji)',
      type: 'string',
    }),
    defineField({
      name: 'version',
      title: 'Version',
      type: 'string',
      initialValue: '1.0.0',
    }),
  ],
})
