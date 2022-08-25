<template>
  <div class="item-edit">
    <div class="prop-list">
      <van-field
        class="input"
        v-for="prop in editablePropList"
        :key="prop.key"
        :label="prop.name"
        input-align="right"
        v-model="item[prop.key]"
      >
        <template v-if="prop.key === 'color'" #label>
          <div class="label">
            <div class="text">{{prop.name}}</div>
            <div class="color-block" :style="'background: ' + item[prop.key]"></div>
          </div>
        </template>
      </van-field>
    </div>
    <div class="bottom">
      <div class="container">
        <van-button class="button" type="primary"  @click="confirm">确认</van-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router';
import { useStore } from '@/store';
import { showLoadingToast, showToast } from 'vant';
import { reactive } from 'vue';
import * as d3 from 'd3-color'

const editablePropList = [
  {
    name: '标题',
    key: 'title',
  },
  {
    name: '主题色',
    key: 'color',
  },
]

const route = useRoute();
const router = useRouter();
const store = useStore();
if (route.path === '/item-edit') {
  if (!route.query.id) {
    router.back();
  }
}
const item = route.path === '/item-edit' ? reactive({ ...store.getters['data/oneItem'](route.query.id) }) : reactive({
  title: '',
  color: '',
  textColor: '',
});

const confirm = async (): Promise<void> => {
  const color = d3.color(item.color)?.rgb();
  if (!color || isNaN(color.r) || isNaN(color.g) || isNaN(color.b)) {
    showToast('暂不支持当前颜色，请更换颜色后重试')
    return;
  }
  const grayLevel = (0.299 * color.r + 0.587 * color.g + 0.114 * color.b) / 255;
  item.textColor = grayLevel > 0.5 ? '#000000' : '#FFFFFF';
  const methods = route.query.id ? 'data/editItem' : 'data/addItem';
  try {
    showLoadingToast('');
    await store.dispatch(methods, item);
    showToast('保存成功');
    router.back();
  }
  catch (err) {
    console.log(err);
    showToast('保存失败，请重试');
  }
}

</script>

<style lang="scss" scoped>
.item-edit {
  .prop-list {
    .label {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      .color-block {
        margin-left: 10px;
        width: 1em;
        height: 1em;
        border: 1px #AAAAAA solid;
        border-radius: 2px;
      }
    }
  }
  .bottom {
    $height: 60px;
    height: $height;
    .container {
      @include bottom-fixed;
      height: $height;
      display: flex;
      justify-content: center;
      align-items: center;
      .button {
        flex: 1;
        margin: 0 20px;
        height: 40px;
      }
    }
  }
}
</style>