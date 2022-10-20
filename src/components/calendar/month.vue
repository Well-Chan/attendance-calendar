<template>
  <div class="month-calendar" ref="rootElRef">
    <div ref="monthElRef">
      <div class="day-of-the-week-list">
        <div class="text">日</div>
        <div class="text">一</div>
        <div class="text">二</div>
        <div class="text">三</div>
        <div class="text">四</div>
        <div class="text">五</div>
        <div class="text">六</div>
      </div>
      <div class="date-cell-list">
        <div
          class="date-cell"
          :class="date.class"
          v-for="(date, index) in dateList"
          :key="index"
          @click="clickDate(date)"
        >
          <div class="content">
            <slot :data="date.data">
              <div class="label">{{date.label}}</div>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { CellDate } from './define'
import { getHtmlElementOffset } from '@/utils/common'
import dayjs from 'dayjs';
import { delay } from '@/utils/common';

const dateFormat = 'YYYY-MM-DD'

interface Props {
  modelValue: Date,
}
interface Emit {
  (e: 'update:modelValue', value: Date): void,
  (e: 'clickDate', date: Date, type: string): void,
};

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => new Date(),
})
const emit = defineEmits<Emit>()

const currentDay = ref<Date>(new Date());

watch(() => props.modelValue, (val) => {
  const date1 = dayjs(val).format(dateFormat);
  const date2 = dayjs(currentDay.value).format(dateFormat);
  if (date1 !== date2) {
    currentDay.value = dayjs(val).toDate();
  }
}, {
  immediate: true,
})
watch(() => currentDay.value, (val) => {
  emit('update:modelValue', val);
})

const dateList = computed<Array<CellDate>>(() => {
  const year = currentDay.value.getFullYear();
  const month = currentDay.value.getMonth();
  const length = new Date(year, month + 1, 0).getDate();
  const prevMonthDateList: Array<CellDate> = [];
  const currentMonthDateList: Array<CellDate> = [];
  const nextMonthDateList: Array<CellDate> = [];
  for (let i = 0; i < new Date(year, month, 1).getDay(); i++) {
    const date = dayjs(new Date(year, month, -i));
    prevMonthDateList.unshift({
      data: {
        type: 'prev-month',
        isSelected: false,
        date: date.toDate(),
        day: date.format(dateFormat),
      },
      class: 'prev',
      label: date.format('DD'),
    });
  }
  for (let i = 1; i <= length; i++) {
    const date = dayjs(new Date(year, month, i));
    const isToday =  date.format(dateFormat) === dayjs().format(dateFormat);
    const isSelected =  date.format(dateFormat) === dayjs(currentDay.value).format(dateFormat);
    currentMonthDateList.push({
      data: {
        type: 'current-month',
        isSelected: false,
        date: date.toDate(),
        day: date.format(dateFormat),
      },
      class: `current ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`,
      label: date.format('DD'),
    });
  }
  for (let i = 1; i <= 6 - new Date(year, month, length).getDay(); i++) {
    const date = dayjs(new Date(year, month + 1, i));
    nextMonthDateList.unshift({
      data: {
        type: 'next-month',
        isSelected: false,
        date: date.toDate(),
        day: date.format(dateFormat),
      },
      class: 'next',
      label: date.format('DD'),
    });
  }
  return prevMonthDateList.concat(currentMonthDateList, nextMonthDateList);
});

const clickDate = async (date: CellDate) => {
  currentDay.value = date.data.date;
  await delay();
  emit('clickDate', date.data.date, date.data.type);
}


const rootElRef = ref<HTMLElement>();
const monthElRef = ref<HTMLElement>();
const getMonthElData = (): {
  top: number,
  left: number,
  width: number,
  height: number,
} => {
  if (!rootElRef.value || !monthElRef.value) {
    return {
      top: 0,
      left: 0,
      width: 0,
      height: 0,
    }
  }
  const calendarOffset = getHtmlElementOffset(rootElRef.value);
  const monthElOffset = getHtmlElementOffset(monthElRef.value);
  return {
    top: monthElOffset.top - calendarOffset.top,
    left: monthElOffset.left - calendarOffset.left,
    width: monthElRef.value.clientWidth,
    height: monthElRef.value.clientHeight,
  }
}
defineExpose({
  getMonthElData,
})
</script>

<style lang="scss" scoped>
.month-calendar {
  $border: 1px $border-color solid;
  padding: 12px 20px 35px;
  background: #FFFFFF;
  .day-of-the-week-list {
    display: flex;
    align-items: center;
    text-align: center;
    .text {
      flex: 1;
      padding: 10px 0;
    }
  }
  .date-cell-list {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    border-right: $border;
    border-bottom: $border;
    
    .date-cell {
      border-top: $border;
      border-left: $border;
      &.prev,&.next {
        opacity: 0.3;
      }
      &.today {
        color: #409eff;
      }
      &.selected {
        background: #ecf5ff;
      }
      .content {
        min-height: 60px;
        padding: 8px;
      }
    }
  }
}
</style>