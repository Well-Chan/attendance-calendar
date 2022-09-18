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
    <div class="tab-bars">
      <div
        class="bar"
        :class="{active: currentBarIndex === index}"
        v-for="(bar, index) in barList"
        :key="index"
        @click="bar.onClick"
      >
        {{bar.title}}
      </div>
    </div>
    <div
      class="calendar-swipe-box"
      :class="calendarSwipeStatus"
      :style="calendarBoxStyle"
    >
      <year-calendar-swipe
        class="calendar-swipe year"
        :class="yearCalendarSwipeData.status"
        :ref="(el: any) => yearCalendarSwipeData.ref = el"
        :data="currentItem"
        @date-changed="dateChanged"
        @click-month="toggleToMonth"
      />
      <month-calendar-swipe
        class="calendar-swipe month"
        :class="monthCalendarSwipeData.status"
        :ref="(el: any) => monthCalendarSwipeData.ref = el"
        :data="currentItem"
        @date-changed="dateChanged"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, reactive, onMounted, Ref } from 'vue';
import { useStore } from '@/store';
import { useRouter } from 'vue-router';
import { Item } from '@/store/data/define';
import YearCalendarSwipe from './components/calendar-swipe/year.vue'
import MonthCalendarSwipe from './components/calendar-swipe/month.vue'
import dayjs from 'dayjs';
import { delay } from '@/utils/common';


const router = useRouter();
const addItem = () => router.push({ path: '/item-add' })

const store = useStore();
const data = computed((): Array<Item> => store.getters['data/data']);

const itemList = computed(() => {
  return data.value.map((item, index) => {
    return {
      text: item.title,
      value: index,
    }
  });
})

const currentItemIndex = ref<number>(0);
const currentItem = computed(() => data.value.length === 0 ? null : data.value[currentItemIndex.value]);

const currentMode = ref<'year' | 'month'>('month');
const currentDay = ref(new Date());
const calendarSwipeStatus = ref('');
interface CalendarSwipeData {
  ref: Ref<{ rootElRef: HTMLElement, changeDate: Function, [key: string]: any } | undefined>,
  status: 'show' | 'hide' | 'fade-in' | 'fade-out',
}
const yearCalendarSwipeData = reactive<CalendarSwipeData>({
  ref: ref(),
  status: 'hide',
})
const monthCalendarSwipeData = reactive<CalendarSwipeData>({
  ref: ref(),
  status: 'show',
})
const calendarBoxStyle = ref('');

const dateChanged = (date: Date) => {
  if (dayjs(currentDay.value).format('YYYYMMDD') !== dayjs(date).format('YYYYMMDD')) {
    currentDay.value = date;
    yearCalendarSwipeData.ref?.changeDate(date, false)
    monthCalendarSwipeData.ref?.changeDate(date, false);
  }
}
const toggle = async (from: 'year' | 'month', to: 'year' | 'month') => {
  const calendarMap = {
    'year': yearCalendarSwipeData,
    'month': monthCalendarSwipeData,
  }
  const clendarSwipeDataFrom = calendarMap[from];
  const clendarSwipeDataTo = calendarMap[to];
  if (!clendarSwipeDataFrom || !clendarSwipeDataFrom.ref || !clendarSwipeDataTo || !clendarSwipeDataTo.ref) {
    return '';
  }
  const barIndex = barList.findIndex(bar => bar.key === to);
  if (barIndex !== -1) {
    currentBarIndex.value = barIndex;
  }
  let methed = '';
  if (from.match(/month/) || to.match(/month/)) {
    methed = 'getMonthElData';
  }
  const elDataFrom = clendarSwipeDataFrom.ref[methed](currentDay.value.getMonth());
  const elDataTo = clendarSwipeDataTo.ref[methed](currentDay.value.getMonth());
  const transformOrigin = {
    x: (elDataTo.left * elDataFrom.width - elDataFrom.left * elDataTo.width) / (elDataFrom.width - elDataTo.width),
    y: (elDataTo.top * elDataFrom.width - elDataFrom.top * elDataTo.width) / (elDataFrom.width - elDataTo.width),
  }
  const oldHeight = clendarSwipeDataFrom.ref.rootElRef.clientHeight;
  const newHeight = clendarSwipeDataTo.ref.rootElRef.clientHeight;
  calendarBoxStyle.value = `--transform-origin: ${transformOrigin.x}px ${transformOrigin.y}px;
  --${from}-calendar-swipe-scale-ratio: ${elDataTo.width / elDataFrom.width};
  --${to}-calendar-swipe-scale-ratio: ${elDataFrom.width / elDataTo.width};
  --calendar-swipe-old-height: ${oldHeight}px;
  --calendar-swipe-new-height: ${newHeight}px;
  height: ${oldHeight}px;`
  calendarSwipeStatus.value = '';
  clendarSwipeDataFrom.status = 'show';
  clendarSwipeDataTo.status = 'hide';
  // 如果delay(0)，渲染引擎有可能因为间隔时间太短而无法检测到status变化，从而无法重新触发动画
  await delay(10);
  calendarSwipeStatus.value = 'animating';
  clendarSwipeDataFrom.status = 'fade-out';
  clendarSwipeDataTo.status = 'fade-in';
}
const toggleToYear = () => {
  if (currentMode.value !== 'year') {
    toggle(currentMode.value, 'year');
    currentMode.value = 'year';
  }
}
const toggleToMonth = () => {
  if (currentMode.value !== 'month') {
    toggle(currentMode.value, 'month')
    currentMode.value = 'month';
  }
}

const barList = [{
  title: '年',
  key: 'year',
  onClick: toggleToYear,
},{
  title: '月',
  key: 'month',
  onClick: toggleToMonth,
}]
const currentBarIndex = ref(0);


onMounted(() => {
  calendarBoxStyle.value = `height: ${monthCalendarSwipeData.ref?.rootElRef.clientHeight}px;`;
});

</script>

<style lang="scss" scoped>
@include flex-box;

.punch-card {
  background: #FFFFFF;
  :deep(.header) {
    position: sticky;
    top: 0;
    z-index: 9;
    .van-dropdown-menu__item {
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
  .tab-bars {
    margin-top: 10px;
    padding: 0 20px;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    .bar {
      position: relative;
      padding: 10px 20px;
      &.active {
        color: $theme-color;
        &::after {
          content: '';
          position: absolute;
          left: 50%;
          bottom: 0;
          transform: translateX(-50%);
          height: 2px;
          width: 36px;
          background: $theme-color;
        }
      }
    }
  }
  .calendar-swipe-box {
    position: relative;
    width: 100%;
    overflow: hidden;
    @mixin swipe-show {
      transform: scale(1);
      opacity: 1;
      z-index: 1;
    }
    @mixin year-calendar-swipe-hide {
      transform: scale(var(--year-calendar-swipe-scale-ratio));
      opacity: 0;
      z-index: -1;
    }
    @mixin month-calendar-swipe-hide {
      transform: scale(var(--month-calendar-swipe-scale-ratio));
      opacity: 0;
      z-index: -1;
    }
    .calendar-swipe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      transform-origin: var(--transform-origin);
      &.year.hide {
        @include year-calendar-swipe-hide;
      }
      &.month.hide {
        @include month-calendar-swipe-hide;
      }
    }
    @keyframes calendar-swipe-animation {
      from {
        height: var(--calendar-swipe-old-height);
      }
      to {
        height: var(--calendar-swipe-new-height);
      }
    }
    @keyframes year-calendar-swipe-animation {
      from {
        @include swipe-show;
      }
      to {
        @include year-calendar-swipe-hide;
      }
    }
    @keyframes month-calendar-swipe-animation {
      from {
        @include swipe-show;
      }
      to {
        @include month-calendar-swipe-hide;
      }
    }
    --animation-duration: 0.3s;
    &.animating {
      animation: calendar-swipe-animation var(--animation-duration) linear 0s 1 normal both;
    }
    .year-calendar-swipe.fade-in,.year-calendar-swipe.fade-out {
      animation: year-calendar-swipe-animation var(--animation-duration) linear 0s 1 var(--animation-direction) both;
    }
    .month-calendar-swipe.fade-in,.month-calendar-swipe.fade-out {
      animation: month-calendar-swipe-animation var(--animation-duration) linear 0s 1 var(--animation-direction) both;
    }
    .fade-in {
      --animation-direction: reverse;
    }
    .fade-out {
      --animation-direction: normal;
    }
  }
}
</style>