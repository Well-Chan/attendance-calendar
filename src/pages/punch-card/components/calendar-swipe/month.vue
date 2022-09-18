<template>
  <div class="month-calendar-swipe" ref="rootElRef">
    <van-swipe
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
        <month-calendar class="month-calendar" ref="monthCalendarRefList" v-model="item.value" @click-date="clickDate" @update:model-value="dateChanged(index, $event)">
          <template #default="{ data: { type, isSelected, day, date } }">
            <div
              class="cell"
              :class="{ selected: isSelected, punched: punchDateList.includes(day) }"
              :style="`--item-color: ${props.data?.color}; --item-text-color: ${props.data?.textColor}`"
            >
              <div class="container">
                {{Number(day.split('-')[2])}}
              </div>
            </div>
          </template>
        </month-calendar>
      </van-swipe-item>
    </van-swipe>
    <van-dialog
      class="dialog"
      v-model:show="dialogShow"
      :title="selectedDate.date"
      :confirmButtonText="selectedDate.punched ? '删除记录' : '打卡'"
      :confirm-button-color="selectedDate.punched ? 'var(--van-danger-color)' : 'var(--van-primary-color)'"
      :confirm-button-disabled="!props.data"
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
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, watch } from 'vue';
import { useStore } from '@/store';
import dayjs from 'dayjs';
import { Item } from '@/store/data/define';
import { showConfirmDialog, showLoadingToast, showToast } from 'vant';
import type { SwipeInstance } from 'vant';
import MonthCalendar from '@/components/calendar/month.vue';
import { getAdjacentIndex } from '../utils/index';


const dateFormat = 'YYYY-MM-DD'

interface Props {
  data: Item | null,
  modelValue?: Date | null,
}

const props = withDefaults(defineProps<Props>(), {
  data: null,
  modelValue: null,
})

interface ModelDate {
  value: Date,
  id: string,
  date: string,
  text: string,
  punched: boolean,
}

const store = useStore();

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

const dialogShow = ref(false);


// 打卡日期字符串列表，方便直接判断当前打卡列表内是否包含当前日期
const punchDateList = computed(() => {
  return props.data ? props.data.logList.map(day => day.date) : [];
})

// 每一个日历的选中日期变化时，都要获取选中日期的相关打卡数据
swipeItemList.forEach(swipeItem => {
  watch(() => swipeItem.value, (val) => {
    const date = dayjs(val).format(dateFormat);
    const log = props.data ? props.data.logList.find(day => date == day.date) : null;
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
    // 若滑动前选中日期月份与滑动后月份相同，则日期采用滑动前选中日期，与clickDate点击相邻月份时即触发滑动又在滑动前记录选中日期相呼应
    newSwipeItem.value = oldSwipeItem.value;
  }
  const {
    prevSwipeIndex,
    nextSwipeIndex,
  } = getAdjacentIndex(index, 3);
  const prevMonthDate = new Date(newSwipeItem.value.getFullYear(), newSwipeItem.value.getMonth() - 1, 1);
  const nextMonthDate = new Date(newSwipeItem.value.getFullYear(), newSwipeItem.value.getMonth() + 1, 1);
  swipeItemList[prevSwipeIndex].value = prevMonthDate;
  swipeItemList[nextSwipeIndex].value = nextMonthDate;
  currentSwipeIndex.value = index;
}

// 日历点击，手动触发日期绑定、轮播图滚动
const clickDate = (date: Date, type: string): void => {
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
        itemId: props.data?.id,
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
        itemId: props.data?.id,
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


interface Emit {
  (e: 'dateChanged', value: Date): void,
};
const emit = defineEmits<Emit>();

const rootElRef = ref<HTMLElement>();
const dateChanged = (index: number, date: Date) => {
  if (index === currentSwipeIndex.value) {
    emit('dateChanged', date);
  }
}
const changeDate = (newDate: Date, swipe: boolean): void => {
  const {
    prevSwipeIndex,
    nextSwipeIndex,
  } = getAdjacentIndex(currentSwipeIndex.value, 3);
  if (swipe) {
    if (dayjs(newDate).format('YYYYMM') > dayjs(selectedDate.value.value).format('YYYYMM')) {
      swipeItemList[nextSwipeIndex].value = newDate;
      swipeRef.value?.next();
    }
    else if (dayjs(newDate).format('YYYYMM') < dayjs(selectedDate.value.value).format('YYYYMM')) {
      swipeItemList[prevSwipeIndex].value = newDate;
      swipeRef.value?.prev();
    }
  }
  else {
    swipeItemList[currentSwipeIndex.value].value = newDate;
    swipeIndexChange(currentSwipeIndex.value);
  }
}

const monthCalendarRefList = ref<Array<{
  getMonthElData: Function,
}>>([]);
const currentMonthCalendarRef = computed(() => monthCalendarRefList.value[currentSwipeIndex.value]);
defineExpose({
  rootElRef,
  getMonthElData: () => {
    return currentMonthCalendarRef.value?.getMonthElData();
  },
  changeDate,
})

</script>

<style lang="scss" scoped>
.date-text {
  margin-top: 10px;
  padding: 10px 20px;
  font-size: 16px;
  border-bottom: 1px $border-color solid;
  .icon {
    display: inline-block;
    transform: scaleX(1.4) scale(0.8);
  }
}
:deep(.month-calendar) {
  min-height: 340px;
  .date-cell-list {
    .date-cell {
      .content {
        min-height: 0;
        padding: 0;
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
  }
}
:deep(.dialog) {
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
:deep(.van-popup) {
  overflow: hidden;
  .container {
    margin-bottom: -2px;
  }
}
</style>