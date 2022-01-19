import Vue from 'vue'
import App from './App.vue'
import router from './router'
import { vueBaberrage } from 'vue-baberrage'
import hevueImgPreview from 'hevue-img-preview'
Vue.use(hevueImgPreview)

Vue.use(vueBaberrage)
Vue.config.productionTip = false

console.log('router',router);

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
