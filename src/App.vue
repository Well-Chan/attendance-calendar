<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import NavigationBar from '@/components/navigation-bar/index.vue';
import TabBar from '@/components/tab-bar/index.vue';
import { useStore } from './store';
import zhCn from 'element-plus/lib/locale/lang/zh-cn'

const themeVars = {
};

const store = useStore();
store.dispatch('data/getLocalData');

</script>

<template>
  <van-config-provider :theme-vars="themeVars">
    <el-config-provider :locale="zhCn">
      <div class="application">
        <navigation-bar />
        <div class="page">
          <router-view></router-view>
        </div>
        <tab-bar />
      </div>
    </el-config-provider>
  </van-config-provider>
</template>

<style lang="scss">
body {
  --van-primary-color: #{$theme-color};
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  font-size: $font-size-m;
  background: $bg-color;
  -webkit-touch-callout: none !important;
  -webkit-user-select: none;
  .application {
    height: 100vh;
    display: flex;
    flex-direction: column;
    >.page {
      flex: 1;
      width: 100%;
      height: 0;
      overflow-y: scroll;
    }
  }
}
</style>
