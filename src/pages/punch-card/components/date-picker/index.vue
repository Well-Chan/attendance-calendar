<template>
  <div class="date-picker">
    <div class="date-text" @click="openPicker">
      {{ selectedDateText }}
      <div class="icon">{{pickerShow ? '▲' : '▼'}}</div>
    </div>
    <van-popup
      class="popup"
      v-model:show="pickerShow"
      position="bottom"
    >
      <div class="container">
        <van-date-picker
          :model-value="pickerValue"
          title="选择月份"
          :columns-type="pickerType"
          :min-date="pickerRange.min"
          :max-date="pickerRange.max"
          :formatter="pickerFormatter"
          @confirm="pickerConfirm"
          @cancel="pickerCancel"
        />
      </div>
    </van-popup>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import type { PickerOption, DatePickerColumnType } from 'vant';


const selectedDateText = computed(() => dayjs(selectedDate.value.value).format('YYYY 年'))

const type = ref<'year' | 'month'>('year');

const pickerShow = ref<boolean>(false);
const pickerValue = ref<Array<string>>([]);
const openPicker = () => {
  const today = new Date();
  pickerValue.value = [String(today.getFullYear()), String(today.getMonth() + 1)];
  pickerShow.value = true;
}
const pickerType = computed(() => {
  if (type.value === 'year') {
    return ['year'] as Array<DatePickerColumnType>;
  }
  else {
    return ['year', 'month'] as Array<DatePickerColumnType>;
  }
});
const pickerRange = (() => {
  const thisYear = new Date().getFullYear();
  return {
    min: new Date(thisYear - 100, 0, 1),
    max: new Date(thisYear + 100, 11, 31),
  };
})();
const pickerFormatter = (type: string, option: PickerOption): PickerOption => {
  if (type === 'year') {
    option.text += '年';
  }
  if (type === 'month') {
    option.text = Number(option.text) + '月';
  }
  return option;
};
const pickerConfirm = ({ selectedValues: [year, month] }: { selectedValues: Array<string> }): void => {
  let newDate;
  if (type.value === 'year') {
    newDate = new Date(Number(year), 1, 1);
  }
  else if (type.value === 'month') {
    newDate = new Date(Number(year), Number(month) - 1);
  }
  changeDate(newDate, true);
  pickerShow.value = false;
}
const pickerCancel = () => {
  pickerShow.value = false;
}

</script>

<style lang="scss" scoped>

</style>