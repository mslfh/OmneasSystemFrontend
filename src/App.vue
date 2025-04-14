<template>
  <router-view />
</template>

<script setup>
import { useMeta } from 'quasar'

useMeta({
  title: "Mia's Massage Launceston",
  meta: [
    {
      name: 'description',
      content: "Relax and heal with professional massage therapy in Launceston. Book online with Mia's Massage for stress relief and wellness."
    },
    {
      name: 'robots',
      content: 'index, follow'
    }
  ],
  link: [
    {
      rel: 'canonical',
      href: 'http://www.miasmassagetherapy.com/'
    }
  ]
})
</script>
