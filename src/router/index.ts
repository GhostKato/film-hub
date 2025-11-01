import { createRouter, createWebHistory } from 'vue-router'

import HomePage from '../pages/HomePage.vue'
import CatalogPage from '../pages/CatalogPage.vue'
import MoviePage from '../pages/MoviePage.vue'
import CollectionPage from '../pages/CollectionPage.vue'
import WatchLaterPage from '../pages/WatchLaterPage.vue'
import NotFoundPage from '../pages/NotFoundPage.vue'

const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/catalog', name: 'catalog', component: CatalogPage },
  { path: '/movie/:id', name: 'movie', component: MoviePage },
  { path: '/collection', name: 'collection', component: CollectionPage },
  { path: '/watch-later', name: 'watch-later', component: WatchLaterPage },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundPage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
