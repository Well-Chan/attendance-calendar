<template>
  <div class="mine">
    <div class="header flex-row-box">
      <div class="avatar">
        <van-icon class="icon" name="user-circle-o" />
      </div>
      <div class="member-info flex-content">
        <div class="button">请先登录</div>
      </div>
    </div>
    <div class="main">
      <van-cell-group class="menu-list">
        <van-cell
          class="menu"
          v-for="(menu, index) in menuList"
          :key="index"
          :icon="menu.icon"
          :title="menu.label"
          is-link
          @click="menuClick(menu as any)"
        />
      </van-cell-group>
    </div>
    <van-dialog
      class="dialog"
      v-model:show="dialogShow"
      title="导入数据"
      showCancelButton
      @confirm="dialogConfirm"
    >
      <van-field
        class="input"
        v-model="localData"
        label-width="30"
        rows="2"
        :autosize="{ maxHeight: 200}"
        label="数据"
        type="textarea"
        placeholder="请输入"
      />
    </van-dialog>
  </div>
</template>

<script lang="ts" setup>
import { useStore } from '@/store';
import { showDialog, showConfirmDialog, showLoadingToast, showToast } from 'vant';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const store = useStore();
const dialogShow = ref(false);
const localData = ref('');
const menuList = [
  {
    label: '我的项目',
    icon: 'edit',
    routerPath: '/item-manage',
  },
  {
    label: '导入数据',
    icon: 'exchange',
    onClick: () => dialogShow.value = true,
  },
  {
    label: '导出数据',
    icon: 'exchange',
    onClick: () => showDialog({
      title: '数据',
      message: store.getters['data/localData'],
    })
  }
];

const router = useRouter();
const menuClick = (menu: { onClick: () => any; routerPath: any; }): void => {
  menu.onClick && menu.onClick();
  menu.routerPath && router.push({ path: menu.routerPath });
}
const dialogConfirm = async (): Promise<void> => {
  await showConfirmDialog({
    title: '提示',
    message: '是否要导入数据？导入后原有数据将被清除',
  })
  try {
    showLoadingToast('');
    await store.dispatch('data/setLocalData', localData.value);
    await store.dispatch('data/getLocalData');
    showToast('导入成功');
    dialogShow.value = false
  }
  catch (err) {
    console.log(err);
    showToast('导入失败，请重试')
  }
}
</script>

<style lang="scss" scoped>
@include flex-box;

.mine {
  .header {
    padding: 20px 30px;
    background: rgba($theme-color, 0.1);
    .avatar {
      .icon {
        font-size: 60px;
      }
    }
    .member-info {
      margin-left: 30px;
    }
  }
  .main {
    margin-top: 30px;
  }
}
</style>