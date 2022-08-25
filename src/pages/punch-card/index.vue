<template>
  <div class="punch-card">
    <div class="header">
      <van-dropdown-menu>
        <van-dropdown-item
          v-model="currentItemIndex"
          :options="itemList"
          :disabled="!currentItem"
        >
          <template #title>
            {{currentItem ? currentItem.title : '暂无项目'}}
          </template>
        </van-dropdown-item>
        <van-dropdown-item title-class="add-button" disabled>
          <template #title>
            <van-icon name="add-o" @click="addItem" />
          </template>
        </van-dropdown-item>
      </van-dropdown-menu>
    </div>
    <van-swipe
      class="my-swipe"
      ref="swipeRef"
      :autoplay="0"
      :initial-swipe="1"
      :duration="200"
      :show-indicators="false"
      @change="swipeIndexChange"
    >
      <van-swipe-item
        v-for="item, index in swipeItemList"
        :key="index"
      >
        <el-calendar
          class="calendar"
          ref="calendar"
          v-model="item.value"
        >
          <template #header="{ date }">
            <span class="current-month-name" @click="openMonthPicker">{{ date }}</span>
          </template>
          <template #dateCell="{ data: { type, isSelected, day, date } }">
            <div
              class="cell"
              :class="{ selected: isSelected, punched: punchDateList.includes(day) }"
              :style="`--item-color: ${currentItem?.color}; --item-text-color: ${currentItem?.textColor}`"
              @click.stop="cellClick(type, date)"
            >
              <div class="container">
                {{day.split('-')[2]}}
              </div>
            </div>
          </template>
        </el-calendar>
      </van-swipe-item>
    </van-swipe>
    <van-dialog
      class="dialog"
      v-model:show="dialogShow"
      :title="selectedDate.date"
      :confirmButtonText="selectedDate.punched ? '删除记录' : '打卡'"
      :confirm-button-color="selectedDate.punched ? 'var(--van-danger-color)' : 'var(--van-primary-color)'"
      :confirm-button-disabled="!currentItem"
      closeOnClickOverlay
      @confirm="dialogConfirm"
    >
      <div class="container">
        <div v-show="selectedDate.punched">{{selectedDate.text}}</div>
        <van-field
          class="input"
          v-show="!selectedDate.punched"
          v-model="selectedDate.text"
          label-width="30"
          rows="2"
          autosize
          label="备注"
          type="textarea"
          maxlength="100"
          placeholder="请输入"
          show-word-limit
        />
      </div>
    </van-dialog>
    <van-popup
      class="popup"
      v-model:show="monthPickerShow"
      position="bottom"
    >
      <div class="container">
        <van-date-picker
          :modelValue="monthPickerValue"
          title="选择月份"
          :columns-type="monthPickerType"
          :min-date="monthPickerRange.min"
          :max-date="monthPickerRange.max"
          :formatter="monthPickerFormatter"
          @confirm="monthPickerConfirm"
          @cancel="monthPickerCancel"
        />
      </div>
    </van-popup>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, watch } from 'vue';
import { showConfirmDialog, showLoadingToast, showToast } from 'vant';
import type { SwipeInstance } from 'vant';
import { useStore } from '@/store';
import dayjs from 'dayjs';
import { useRouter } from 'vue-router';
import { Item } from '@/store/data/define';
import type { PickerOption, DatePickerColumnType } from 'vant';

const dateFormat = 'YYYY-MM-DD'

interface ModelDate {
  value: Date,
  id: string,
  date: string,
  text: string,
  punched: boolean,
}

const swipeRef = ref<SwipeInstance>();
const swipeItemList: Array<ModelDate> = reactive((() => {
  const currentDate = {
    value: new Date(),
    id: '',
    date: dayjs().format(dateFormat),
    text: '',
    punched: false,
  };
  const list: Array<ModelDate> = [currentDate];
  const prevMonthDate = new Date(currentDate.value.getFullYear(),currentDate.value.getMonth() - 1, 1)
  list.unshift({
    value: prevMonthDate,
    id: '',
    date: dayjs(prevMonthDate).format(dateFormat),
    text: '',
    punched: false,
  })
  const nextMonthDate = new Date(currentDate.value.getFullYear(),currentDate.value.getMonth() + 1, 1)
  list.push({
    value: nextMonthDate,
    id: '',
    date: dayjs(nextMonthDate).format(dateFormat),
    text: '',
    punched: false,
  })
  return list;
})())
const currentSwipeIndex = ref(1);
const selectedDate = computed(() => swipeItemList[currentSwipeIndex.value]);

const store = useStore();
const data = computed((): Array<Item> => store.getters['data/data']);

const dialogShow = ref(false);

const itemList = computed(() => {
  return data.value.map((item, index) => {
    return {
      text: item.title,
      value: index,
    }
  });
})

const currentItemIndex = ref(0);
const currentItem = computed(() => data.value.length === 0 ? null : data.value[currentItemIndex.value]);

// 打卡日期字符串列表，方便直接判断当前打卡列表内是否包含当前日期
const punchDateList = computed(() => {
  return currentItem.value ? currentItem.value.logList.map(day => day.date) : [];
})

// 每一个日历的选中日期变化时，都要获取选中日期的相关打卡数据
swipeItemList.forEach(swipeItem => {
  watch(() => swipeItem.value, (val) => {
    const date = dayjs(val).format(dateFormat);
    const log = currentItem.value ? currentItem.value.logList.find(day => date == day.date) : null;
    swipeItem.date = date;
    swipeItem.id = log ? log.id : '';
    swipeItem.punched = !!log;
    swipeItem.text = log ? log.text : '';
  }, {
    immediate: true,
  })
});

// 轮播图切换的时候自动更新相邻月份，使左右月份与当前月份相连
const swipeIndexChange = (index: number): void => {
  const oldSwipeItem = swipeItemList[currentSwipeIndex.value];
  const newSwipeItem = swipeItemList[index];
  if (newSwipeItem.value.getMonth() === oldSwipeItem.value.getMonth()) {
    // 若滑动前选中日期月份与滑动后月份相同，则日期采用滑动前选中日期，与cellClick点击相邻月份时即触发滑动又在滑动前记录选中日期相呼应
    newSwipeItem.value = oldSwipeItem.value;
  }
  const {
    prevSwipeIndex,
    nextSwipeIndex,
  } = getAdjacentIndex(index);
  const prevMonthDate = new Date(newSwipeItem.value.getFullYear(), newSwipeItem.value.getMonth() - 1, 1);
  const nextMonthDate = new Date(newSwipeItem.value.getFullYear(), newSwipeItem.value.getMonth() + 1, 1);
  swipeItemList[prevSwipeIndex].value = prevMonthDate;
  swipeItemList[nextSwipeIndex].value = nextMonthDate;
  currentSwipeIndex.value = index;
}
const getAdjacentIndex = (index: number): { prevSwipeIndex: number, nextSwipeIndex: number } => {
  if (index === 0) {
    return {
      prevSwipeIndex: 2,
      nextSwipeIndex: 1,
    }
  }
  else if (index === 1) {
    return {
      prevSwipeIndex: 0,
      nextSwipeIndex: 2,
    }
  }
  else {
    return {
      prevSwipeIndex: 1,
      nextSwipeIndex: 0,
    }
  }
}

// 日历点击，手动触发日期绑定、轮播图滚动
const cellClick = (type: string, date: Date): void => {
  selectedDate.value.value = date;
  if (type === 'current-month') {
    dialogShow.value = true;
  }
  else if (type === 'prev-month') {
    swipeRef.value?.prev();
  }
  else if (type === 'next-month') {
    swipeRef.value?.next();
  }
}

// 打卡或删除记录
const dialogConfirm = async (): Promise<void> => {
  dialogShow.value = false;
  if (selectedDate.value.punched) {
    await showConfirmDialog({
      title: '提示',
      message: '是否要删除本次记录？删除后将无法复原',
    })
    try {
      showLoadingToast('');
      await store.dispatch('data/deleteLog', {
        itemId: currentItem.value?.id,
        logId: selectedDate.value.id,
      });
      showToast('删除成功');
    }
    catch (err) {
      console.log(err);
      showToast('删除失败，请重试');
    }
  }
  else {
    try {
      showLoadingToast('');
      await store.dispatch('data/addLog', {
        itemId: currentItem.value?.id,
        date: selectedDate.value.date,
        text: selectedDate.value.text,
      });
      showToast('打卡成功');
    }
    catch (err) {
      console.log(err);
      showToast('打卡失败，请重试');
    }
  }
}


const router = useRouter();
const addItem = () => router.push({ path: '/item-add' })

const monthPickerShow = ref(false);
const monthPickerValue = ref([] as Array<string>);
const openMonthPicker = () => {
  const today = dayjs().format(dateFormat);
  monthPickerValue.value = [today.substring(0, 4), today.substring(5, 7)];
  monthPickerShow.value = true;
}
const monthPickerType = ['year', 'month'] as Array<DatePickerColumnType>;
const monthPickerRange = (() => {
  const thisYear = new Date().getFullYear();
  return {
    min: new Date(thisYear - 100, 0, 1),
    max: new Date(thisYear + 100, 11, 31),
  };
})();
const monthPickerFormatter = (type: string, option: PickerOption): PickerOption => {
  if (type === 'year') {
    option.text += '年';
  }
  if (type === 'month') {
    option.text = Number(option.text) + '月';
  }
  return option;
};
const monthPickerConfirm = ({ selectedValues: [year, month] }: { selectedValues: Array<string> }): void => {
  const newDate = new Date(Number(year), Number(month) - 1);
  const {
    prevSwipeIndex,
    nextSwipeIndex,
  } = getAdjacentIndex(currentSwipeIndex.value);
  if (year + month > dayjs(selectedDate.value.value).format('YYYYMM')) {
    swipeItemList[nextSwipeIndex].value = newDate;
    swipeRef.value?.next();
  }
  else if (year + month < dayjs(selectedDate.value.value).format('YYYYMM')) {
    swipeItemList[prevSwipeIndex].value = newDate;
    swipeRef.value?.prev();
  }
  monthPickerShow.value = false;
}
const monthPickerCancel = () => {
  monthPickerShow.value = false;
}

</script>

<style lang="scss" scoped>
@include flex-box;

.punch-card {
  ::v-deep(.header) {
    .van-dropdown-menu__item{
      flex: none;
      margin: 0 20px;
      &:nth-last-of-type(1) {
        margin-left: auto;
        .add-button {
          color: var(--van-dropdown-menu-title-text-color);
          font-size: 24px;
          &::after {
            content: none;
          }
        }
      }
    }
  }
  ::v-deep(.calendar) {
    min-height: 412px;
    .current-month-name {
      font-size: $font-size-l;
    }
    .el-calendar-day{
      height: auto;
      padding: 0;
    }
    td {
      &.prev,&.next {
        opacity: 0.3;
      }
      .cell {
        position: relative;
        padding-top: 100%;
        border-radius: 50%;
        &.punched {
          color: var(--item-text-color);
          background: var(--item-color);
        }
        .container {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      }
    }
  }
  ::v-deep(.dialog) {
    .van-button {
      letter-spacing: 1px;
    }
    .container {
      padding: 10px 20px 20px;
      text-align: left;
      .input {
        padding: 0;
      }
    }
  }
  ::v-deep(.van-popup) {
    overflow: hidden;
    .container {
      margin-bottom: -2px;
    }
  }
}
</style>