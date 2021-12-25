import Vue from 'vue'
import App from './App.vue'

import { vueBaberrage } from 'vue-baberrage'
Vue.use(vueBaberrage)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
