<template>
  <div class="year-calendar-swipe" ref="rootElRef">
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
        <year-calendar class="year-calendar" ref="yearCalendarRefList" v-model="item.value" @click-month="clickMonth">
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
        </year-calendar>
      </van-swipe-item>
    </van-swipe>
  </div>
</template>

<script lang="ts" setup>
import YearCalendar from '@/components/calendar/year.vue'
import { ref, computed, reactive, watch } from 'vue';
import { Item } from '@/store/data/define';
import dayjs from 'dayjs';
import type { SwipeInstance } from 'vant';
import { getAdjacentIndex } from '../utils/index';

interface Props {
  data: Item | null,
}

const props = withDefaults(defineProps<Props>(), {
  data: null,
})

// 打卡日期字符串列表，方便直接判断当前打卡列表内是否包含当前日期
const punchDateList = computed(() => {
  return props.data ? props.data.logList.map(day => day.date) : [];
})


const swipeRef = ref<SwipeInstance>();
const swipeItemList: Array<{ value: Date }> = reactive((() => {
  const today = new Date();
  const year = today.getFullYear();
  return [{ value: new Date(year - 1, 0, 1) }, { value: today }, { value: new Date(year + 1, 0, 1) }];
})())
const currentSwipeIndex = ref(1);
const selectedDate = computed(() => swipeItemList[currentSwipeIndex.value]);


// 轮播图切换的时候自动更新相邻月份，使左右月份与当前月份相连
const swipeIndexChange = (index: number): void => {
  const newSwipeItem = swipeItemList[index];
  const {
    prevSwipeIndex,
    nextSwipeIndex,
  } = getAdjacentIndex(index, 3);
  const prevYearDate = new Date(newSwipeItem.value.getFullYear() - 1, 0, 1);
  const nextYearDate = new Date(newSwipeItem.value.getFullYear() + 1, 0, 1);
  swipeItemList[prevSwipeIndex].value = prevYearDate;
  swipeItemList[nextSwipeIndex].value = nextYearDate;
  currentSwipeIndex.value = index;
}

interface Emit {
  (e: 'clickMonth', value: Date): void,
  (e: 'dateChanged', value: Date): void,
};
const emit = defineEmits<Emit>();
const clickMonth = (value: Date) => {
  emit('clickMonth', value);
}
watch(() => selectedDate.value.value, (val) => {
  emit('dateChanged', val);
});


const changeDate = (newDate: Date, swipe: boolean) => {
  const {
    prevSwipeIndex,
    nextSwipeIndex,
  } = getAdjacentIndex(currentSwipeIndex.value, 3);
  if (swipe) {
    if (dayjs(newDate).format('YYYY') > dayjs(selectedDate.value.value).format('YYYY')) {
      swipeItemList[nextSwipeIndex].value = newDate;
      swipeRef.value?.next();
    }
    else if (dayjs(newDate).format('YYYY') < dayjs(selectedDate.value.value).format('YYYY')) {
      swipeItemList[prevSwipeIndex].value = newDate;
      swipeRef.value?.prev();
    }
  }
  else {
    swipeItemList[currentSwipeIndex.value].value = newDate;
    swipeIndexChange(currentSwipeIndex.value);
  }
}

const rootElRef = ref<HTMLElement>();
const yearCalendarRefList = ref<Array<{
  getMonthElData: Function,
}>>([]);
const currentYearCalendarRef = computed(() => yearCalendarRefList.value[currentSwipeIndex.value]);
defineExpose({
  rootElRef,
  getMonthElData: (index: number) => {
    return currentYearCalendarRef.value?.getMonthElData(index);
  },
  changeDate,
})

</script>

<style lang="scss" scoped>
.year-calendar-swipe {
  :deep(.year-calendar) {
    .date-cell {
      .content {
        min-height: 0 !important;
        padding: 0;
        .cell {
          position: relative;
          padding-top: 100%;
          border-radius: 50%;
          &.punched {
            color: var(--item-text-color);
            background: var(--item-color);
            box-shadow: 2px 2px 10px -2px #000000;
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
</style>