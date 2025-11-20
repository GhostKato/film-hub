import { createRouter, createWebHistory } from 'vue-router'

import HomePage from '../pages/HomePage/HomePage.vue'
import MoviesPage from '../pages/MoviesPage/MoviesPage.vue'
import SeriesPage from '../pages/SeriesPage/SeriesPage.vue'
import CollectionPage from '../pages/CollectionPage/CollectionPage.vue'
import MediaPage from '../pages/MediaPage/MediaPage.vue'
import NotFoundPage from '../pages/NotFoundPage/NotFoundPage.vue'
import PersonPage from '@/pages/PersonPage/PersonPage.vue'
import MultiSearchPage from '@/pages/MultiSearchPage/MultiSearchPage.vue'
import FilterSearchPage from '@/pages/FilterSearchPage/FilterSearchPage.vue'

import { useMultiSearchStore } from '@/stores/multi-search'

const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/movies', name: 'movies', component: MoviesPage },
  { path: '/series', name: 'series', component: SeriesPage },
  { path: '/collection', name: 'collection', component: CollectionPage },
  { path: '/media/:type/:id', name: 'media', component: MediaPage, props: true },
  { path: '/person/:id', name: 'person', component: PersonPage, props: true },
  { path: '/filter-search', name: 'filter-search', component: FilterSearchPage },
  { path: '/multi-search', name: 'multi-search', component: MultiSearchPage },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundPage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const multiSearchStore = useMultiSearchStore()

  if (from.name === 'home') {
    multiSearchStore.setType('all')
  } else if (from.name === 'movies') {
    multiSearchStore.setType('movie')
  } else if (from.name === 'series') {
    multiSearchStore.setType('tv')
  }

  next()
})

export default router
