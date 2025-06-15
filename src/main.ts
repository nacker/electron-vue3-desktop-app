import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import router from './router';

const app = createApp(App);

// 使用Pinia
const pinia = createPinia();
app.use(pinia);

// 使用Vue Router
app.use(router);

app.mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })
