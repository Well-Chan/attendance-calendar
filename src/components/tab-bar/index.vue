<template>
  <div
    class="tab-bar"
    v-show="show"
  >
    <div class="main">
      <router-link
        class="item"
        :class="{ selected: item.selected }"
        v-for="(item, index) in list"
        :key="index"
        :to="item.routerPath"
        replace
      >
        <van-icon class="icon" :name="item.icon" />
        <div class="label">{{item.label}}</div>
      </router-link>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { tabBarList } from './const';
import routerList from '@/router/main';

const route = useRoute();
// watch(route, () => console.log(route))
const selectedTabBar = computed(() => tabBarList.find(tabBar => tabBar.routerPath === route.path) || null);
const show = computed(() => !!selectedTabBar.value);
const list = computed(() => tabBarList.map(tabBar => ({
  ...tabBar,
  label: (tabBar as any).label || routerList.find(router => router.path === tabBar.routerPath)?.name,
  selected: selectedTabBar.value?.routerPath === tabBar.routerPath,
})));

</script>

<style lang="scss" scoped>
.tab-bar {
  height: $tab-bar-height;
  .main {
    @include bottom-fixed;
    position: relative;
    height: $tab-bar-height;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    z-index: $tab-bar-z-index;
    .item {
      height: 100%;
      padding: 0 20px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-size: $font-size-s;
      .icon {
        font-size: 24px;
      }
      .label {
        margin-top: 4px;
      }
      &.selected {
        color: $theme-color;
      }
    }
  }
}
</style>