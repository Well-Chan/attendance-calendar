<template>
  <div class="navigation-bar">
    <div class="main">
      <van-icon v-if="showBack" class="button navigate-back" name="arrow-left" @click="navigateBack" />
      <div class="title">{{title}}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { tabBarList } from '@/components/tab-bar/const';

const route = useRoute();
const title = computed(() => route.meta.title || route.name);
const showBack = computed(() => history.length !== 1 && tabBarList.every(tabBar => tabBar.routerPath !== route.path))
const navigateBack = (): void => history.back();
</script>

<style lang="scss" scoped>
.navigation-bar {
  position: sticky;
  top: 0;
  font-size: $font-size-xl;
  height: $navigation-bar-height;
  background: #FFFFFF;
  z-index: $navigation-bar-z-index;
  color: #FFFFFF;
  background: $theme-color;
  .main {
    position: relative;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    .navigate-back {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      font-size: $font-size-xxl;
    }
  }
}
</style>