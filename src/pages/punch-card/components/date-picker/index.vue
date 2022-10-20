<template>
  <div class="date-picker">
    <div class="date-text" @click="openPicker">
      <slot name="label">{{ selectedDateText }}</slot>
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
          title="选择日期"
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
import { computed, ref, watch } from 'vue';
import type { PickerOption, DatePickerColumnType } from 'vant';
import dayjs from 'dayjs';



interface Props {
  modelValue: Date,
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => new Date,
});

const value = ref(new Date());
watch(() => props.modelValue, (val) => {
  const date1 = dayjs(val).format('YYYY-MM-DD');
  const date2 = dayjs(value.value).format('YYYY-MM-DD');
  if (date1 !== date2) {
    value.value = dayjs(val).toDate();
  }
})
const selectedDateText = computed(() => {
  return dayjs(value.value).format('YYYY 年 M 月');
})

const pickerShow = ref<boolean>(false);
const pickerValue = computed(() => {
  const date = dayjs();
  return [date.format('YYYY'), date.format('MM'), date.format('DD')];
});
const openPicker = () => {
  pickerShow.value = true;
}
const pickerType = ['year', 'month', 'day'] as Array<DatePickerColumnType>;
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
  if (type === 'day') {
    option.text = Number(option.text) + '日';
  }
  return option;
};

interface Emit {
  (e: 'update:modelValue', value: Date): void,
}
const emit = defineEmits<Emit>();

const pickerConfirm = ({ selectedValues: [year, month, day] }: { selectedValues: Array<string> }): void => {
  value.value = new Date(Number(year), Number(month) - 1, Number(day));
  pickerShow.value = false;
  emit('update:modelValue', value.value);
}
const pickerCancel = () => {
  pickerShow.value = false;
}

</script>

<style lang="scss" scoped>
.date-picker {
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
  :deep(.van-popup) {
    overflow: hidden;
    .container {
      margin-bottom: -2px;
    }
  }
}

</style>