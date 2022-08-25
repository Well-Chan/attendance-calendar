<template>
  <div
    class="item-manage"
    :class="{ sorting, deleting, }"
  >
    <div class="header">
      <div class="button sort">
        排序
        <van-switch class="switch" :model-value="sorting" @update:model-value="startSorting" size="22px" />
      </div>
      <div class="button delete">
        删除
        <van-switch class="switch" :model-value="deleting" @update:model-value="startDeleting" size="22px" />
      </div>
      <van-icon class="button add" name="add-o" @click="addItem" />
    </div>
    <div class="item-list">
      <draggable-sort-group :list="itemList" :disabled="!sorting" @change-seq="changeSeq">
        <template #="{ item }: { item: any}">
          <van-cell
            class="item"
            v-if="sorting"
            :title="item.title"
          >
            <template #right-icon>
              <van-icon class="icon" name="wap-nav" />
            </template>
          </van-cell>
          <van-cell
            class="item"
            v-else-if="deleting"
            :title="item.title"
          >
            <template #right-icon>
              <van-icon class="icon" name="delete-o" @click="deleteItem(item)" />
            </template>
          </van-cell>
          <van-cell
            class="item"
            v-else
            :title="item.title"
            is-link
            :to="{ path: '/item-edit', query: { id: item.id } }"
          />
        </template>
      </draggable-sort-group>
    </div>
  </div>
</template>

<script lang="ts" setup>
import DraggableSortGroup from '@/components/draggable-sort/group.vue'
import { useStore } from '@/store';
import { Item } from '@/store/data/define';
import { showConfirmDialog, showLoadingToast, showToast } from 'vant';
import { computed, nextTick, ref } from 'vue';
import { useRouter } from 'vue-router';

const store = useStore()
const itemList = ref(store.getters['data/data']);
const handle = ref('');
const sorting = computed(() => handle.value === 'sort');
const startSorting = (newValue: boolean) => handle.value = newValue ? 'sort' : '';
const deleting = computed(() => handle.value === 'delete');
const startDeleting = (newValue: boolean) => handle.value = newValue ? 'delete' : '';
const router = useRouter();
const addItem = () => router.push({ path: '/item-add' })
const changeSeq = async (list: Array<Item>) => {
  try {
    list.forEach((item, index) => {
      item.seq = index;
    });
    await store.dispatch('data/setData', list);
  }
  catch {
    showToast('更新失败，请重试');
    itemList.value = [];
    await nextTick();
    itemList.value = store.getters['data/data'];
  }
}
const deleteItem = async (item: Item) => {
  await showConfirmDialog({
    title: '提示',
    message: '是否要删除该项目？删除后将无法复原',
  })
  try {
    showLoadingToast('');
    await store.dispatch('data/deleteItem', item.id);
    showToast('删除成功');
  }
  catch {
    showToast('删除失败，请重试');
  }
}
</script>

<style lang="scss" scoped>
.item-manage {
  background: #FFFFFF;
  .header {
    height: var(--van-dropdown-menu-height);
    display: flex;
    align-items: center;
    border-bottom: 1px $border-color solid;
    .button {
      padding: 0 var(--van-cell-horizontal-padding);
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      .switch {
        margin-left: 10px;
      }
    }
    .add {
      margin-left: auto;
      font-size: 24px;
    }
  }
  .item-list {
    .item {
      .icon {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: $font-size-l;
      }
    }
  }
  // &.sorting {
  //   >:not(.item-list) {
  //     opacity: 0.3;
  //   }
  // }
}
</style>