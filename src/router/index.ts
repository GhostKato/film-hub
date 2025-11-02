import { createRouter, createWebHistory } from 'vue-router'

import HomePage from '../pages/HomePage/HomePage.vue'
import CatalogPage from '../pages/CatalogPage/CatalogPage.vue'
import MoviePage from '../pages/MoviePage/MoviePage.vue'
import CollectionPage from '../pages/CollectionPage/CollectionPage.vue'
import WatchLaterPage from '../pages/WatchLaterPage/WatchLaterPage.vue'
import NotFoundPage from '../pages/NotFoundPage/NotFoundPage.vue'

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
