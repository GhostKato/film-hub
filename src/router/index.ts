import { createRouter, createWebHistory } from 'vue-router'

import HomePage from '../pages/HomePage/HomePage.vue'
import MoviesPage from '../pages/MoviesPage/MoviesPage.vue'
import SeriesPage from '../pages/SeriesPage/SeriesPage.vue'
import CollectionPage from '../pages/CollectionPage/CollectionPage.vue'
import MediaPage from '../pages/MediaPage/MediaPage.vue'
import NotFoundPage from '../pages/NotFoundPage/NotFoundPage.vue'
import SearchMultiPage from '@/pages/SearchMultiPage/SearchMultiPage.vue'

const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/movies', name: 'movies', component: MoviesPage },
  { path: '/series', name: 'series', component: SeriesPage },
  { path: '/collection', name: 'collection', component: CollectionPage },
  { path: '/media/:type/:id', name: 'media', component: MediaPage, props: true },
  { path: '/search/multi', name: 'search-multi', component: SearchMultiPage },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundPage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
