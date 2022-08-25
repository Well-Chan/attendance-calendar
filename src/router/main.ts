import PunchCard from '@/pages/punch-card/index.vue';
import ItemManage from '@/pages/item-manage/index.vue';
import ItemEdit from '@/pages/item-manage/edit.vue';
import Mine from '@/pages/mine/index.vue'

export default [
  {
    path: '/',
    name: '首页',
    redirect: '/punch-card',
  },
  {
    path: '/punch-card',
    name: '日历',
    component: PunchCard,
  },
  {
    path: '/item-manage',
    name: '项目',
    component: ItemManage,
  },
  {
    path: '/item-add',
    name: '添加',
    component: ItemEdit,
  },
  {
    path: '/item-edit',
    name: '编辑',
    component: ItemEdit,
  },
  {
    path: '/mine',
    name: '我的',
    component: Mine,
  },
]