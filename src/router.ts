import { createRouter, createWebHashHistory } from 'vue-router';
import mainRouter from '@/router/main'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    ...mainRouter,
  ]
});

export default router