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
import { computed, ref, watch } from 'vue';
import type { PickerOption, DatePickerColumnType } from 'vant';
import dayjs from 'dayjs';



interface Props {
  modelValue: Date,
  type: 'year' | 'month',
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => new Date,
  type: 'month',
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
  if (props.type === 'year') {
    return dayjs(value.value).format('YYYY 年');
  }
  else if (props.type === 'month') {
    return dayjs(value.value).format('YYYY 年 M 月');
  }
})

const pickerShow = ref<boolean>(false);
const pickerValue = computed(() => {
  if (props.type === 'year') {
    return [String(value.value.getFullYear())];
  }
  else if (props.type === 'month') {
    return [String(value.value.getFullYear()), String(value.value.getMonth() + 1)];
  }
  return [];
});
const openPicker = () => {
  pickerShow.value = true;
}
const pickerType = computed(() => {
  if (props.type === 'year') {
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

interface Emit {
  (e: 'update:modelValue', value: Date): void,
}
const emit = defineEmits<Emit>();

const pickerConfirm = ({ selectedValues: [year, month] }: { selectedValues: Array<string> }): void => {
  let newDate = new Date();
  if (props.type === 'year') {
    newDate = new Date(Number(year), 1, 1);
  }
  else if (props.type === 'month') {
    newDate = new Date(Number(year), Number(month) - 1);
  }
  pickerShow.value = false;
  emit('update:modelValue', newDate);
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