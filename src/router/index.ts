// 新增一个基本的Vue Router配置
import { createRouter, createWebHistory } from 'vue-router';
import HelloWorld from '../components/HelloWorld.vue';

const routes = [
  { path: '/', component: HelloWorld }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
