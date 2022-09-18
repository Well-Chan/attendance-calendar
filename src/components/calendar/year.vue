<template>
  <div class="year-calendar" ref="rootElRef">
    <div class="month-cell-list">
      <div
        class="month-cell"
        v-for="(month, index) in monthList"
        :key="index"
        @click="clickMonth(index)"
      >
        <div class="content">
          <div class="label">{{month.label}}</div>
          <div class="month-el" ref="monthElRefList">
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
                :class="date ? date.class: ''"
                v-for="(date, dateIndex) in month.dateList"
                :key="dateIndex"
                @click.stop="clickDate(date, index)"
              >
                <div class="content" v-if="date">
                  <slot :data="date.data">
                    <div class="label">{{date.label}}</div>
                  </slot>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { CellDate, CellMonth } from './define';
import { getHtmlElementOffset } from '@/utils/common'
import dayjs from 'dayjs';
import { delay } from '@/utils/common';

const dateFormat = 'YYYY-MM-DD'

interface Props {
  modelValue: Date,
}
interface Emit {
  (e: 'update:modelValue', value: Date): void,
  (e: 'clickMonth', value: Date): void,
};

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => new Date(),
})
const emit = defineEmits<Emit>();

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

const year = computed<number>(() => currentDay.value.getFullYear());

const monthList = computed<Array<CellMonth>>(() => {
  const list = [];
  for (let i = 0; i < 12; i++) {
    const month = i;
    const length = new Date(year.value, month + 1, 0).getDate();
    const prevMonthDateList: Array<CellDate | null> = [];
    const currentMonthDateList: Array<CellDate | null> = [];
    const nextMonthDateList: Array<CellDate | null> = [];
    for (let i = 0; i < new Date(year.value, month, 1).getDay(); i++) {
      prevMonthDateList.push(null);
    }
    for (let i = 1; i <= length; i++) {
      const date = dayjs(new Date(year.value, month, i));
      const isToday =  date.format(dateFormat) === dayjs().format(dateFormat);
      currentMonthDateList.push({
        data: {
          type: 'current-month',
          isSelected: false,
          date: date.toDate(),
          day: date.format(dateFormat),
        },
        class: `current ${isToday ? 'today' : ''}`,
        label: date.format('DD'),
      });
    }
    for (let i = 1; i <= 6 - new Date(year.value, month, length).getDay(); i++) {
      nextMonthDateList.push(null);
    }
    const dateList = prevMonthDateList.concat(currentMonthDateList, nextMonthDateList);
    list.push({
      label: `${i + 1}月`,
      dateList,
    });
  }
  return list;
});


const clickMonth = async (index: number) => {
  const month = currentDay.value.getMonth();
  if (index !== month) {
    currentDay.value = new Date(year.value, index, 1);
  }
  await delay();
  emit('clickMonth', currentDay.value);
}
const clickDate = async (date: CellDate | null, index: number) => {
  if (!date) {
    clickMonth(index);
  }
  else {
    currentDay.value = date.data.date;
    await delay();
    emit('clickMonth', currentDay.value);
  }
}

const rootElRef = ref<HTMLElement>();
const monthElRefList = ref<Array<HTMLElement>>([]);
const getMonthElData = (index: number): {
  top: number,
  left: number,
  width: number,
  height: number,
} => {
  if (!rootElRef.value) {
    return {
      top: 0,
      left: 0,
      width: 0,
      height: 0,
    }
  }
  const el = monthElRefList.value[index];
  const calendarOffset = getHtmlElementOffset(rootElRef.value);
  const elOffset = getHtmlElementOffset(el);
  return {
    top: elOffset.top - calendarOffset.top,
    left: elOffset.left - calendarOffset.left,
    // 此时宽度和高度因为放缩的原因，是视觉的两倍，所以除2得到视觉的宽度及高度
    width: el.clientWidth / 2,
    height: el.clientHeight / 2,
  }
}
defineExpose({
  getMonthElData,
})
</script>

<style lang="scss" scoped>
.year-calendar {
  padding: 16px;
  .month-cell-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 140px;
    gap: 0 10px;
    .month-cell {
      >.content {
        position: relative;
        .label {
          font-size: 12px;
          font-weight: bold;
        }
        .month-el {
          margin-top: 5px;
          position: absolute;
          left: 0;
          width: 200%;
          transform-origin: top left;
          transform: scale(0.5);
          .day-of-the-week-list {
            display: flex;
            align-items: center;
            text-align: center;
            .text {
              flex: 1;
              padding: 6px 0;
            }
          }
          .date-cell-list {
            margin-top: 10px;
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 4px 4px;
            .date-cell {
              font-size: 12px;
              .content {
                min-height: 30px;
              }
            }
          }
        }
      }
    }
  }
}
</style>