import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'developer',
  title: 'Développeur',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nom complet',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'photo',
      title: 'Photo de profil',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'bio',
      title: 'Biographie',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'services',
      title: 'Expertises / Services',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'service',
          title: 'Expertise',
          fields: [
            defineField({
              name: 'title',
              title: 'Titre',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'icon',
              title: 'Emoji / Icône',
              type: 'string',
              description: 'Ex: 💻, 🔌, 🎨',
              validation: (Rule) => Rule.required(),
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'links',
      title: 'Liens de contact',
      type: 'object',
      fields: [
        defineField({
          name: 'whatsapp',
          title: 'Numéro WhatsApp (ou lien)',
          type: 'string',
          description: 'Ex: https://wa.me/... ou +237...',
        }),
        defineField({
          name: 'github',
          title: 'Lien GitHub',
          type: 'string',
        }),
        defineField({
          name: 'linkedin',
          title: 'Lien LinkedIn',
          type: 'string',
        }),
        defineField({
          name: 'email',
          title: 'Adresse Email (Gmail)',
          type: 'string',
        }),
        defineField({
          name: 'portfolio',
          title: 'Lien Site Web / Portfolio',
          type: 'string',
        }),
      ],
    }),
  ],
})
