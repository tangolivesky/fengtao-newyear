import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import lanternRddle from '../views/lanternRddle/index.vue'
import Topic from '../views/lanternRddle/topic.vue'
import Result from '../views/lanternRddle/result.vue'

Vue.use(VueRouter)

const routes = [{
    path: '/springFestival',
    name: 'Home',
    component: Home
  },
  {
    path: '/haibao',
    name: 'HaiBao',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import( /* webpackChunkName: "about" */ '../views/haibao/Index.vue')
  },
  {
    path: '/yuanxiao',
    name: 'lanternRddle',
    component: lanternRddle,
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    // component: () => import(/* webpackChunkName: "about" */ '../views/lanternRddle/index.vue')
  },
  {
    path: '/yuanxiao/topic',
    name: 'Topic',
    component: Topic
  },
  {
    path: '/yuanxiao/result',
    name: 'Result',
    component: Result
  },
  {
    path: '/planttree',
    name: 'PlantTree',
    component: () => import( /* webpackChunkName: "about" */ '../views/plantTree/index.vue')
  },
]

const router = new VueRouter({
  routes
})

export default router