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

import { useSearchStore } from '@/stores/search'

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
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return {
      top: 0,
      behavior: 'smooth',
    }
  },
})

router.beforeEach((to, from, next) => {
  const searchStore = useSearchStore()

  if (from.name === 'home') {
    searchStore.setType('all')
  } else if (from.name === 'movies') {
    searchStore.setType('movie')
  } else if (from.name === 'series') {
    searchStore.setType('tv')
  } else if (from.name === 'collection') {
    searchStore.setType('all')
  } else if (from.name === 'filter-search') {
    searchStore.setType('all')
  }
  next()
})

export default router
