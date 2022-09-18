<template>
  <div class="color-picker">
    <div class="content" @click="openDialog">
      <slot>
        <div class="color-display" :style="'background: ' + pickedColor.formatHex()"></div>
      </slot>
    </div>
    <van-dialog
      class="dialog"
      v-model:show="dialogShow"
      title="选择颜色"
      showCancelButton
      @confirm="dialogConfirm"
    >
      <div class="container">
        <div
          class="color-panel-box"
          @touchstart="dragging"
          @touchmove="dragging"
          @touchcancel="dragEnd"
          @touchend="dragEnd"
        >
          <div class="color-panel column">
            <div
              class="color-column"
              v-for="(column, index) in columnBgColorList"
              :style="`background: linear-gradient(to top, ${column.bottom}, ${column.top});`"
            ></div>
          </div>
          <div class="color-panel row" ref="colorPanelRef">
            <div
              class="color-row"
              v-for="(row, index) in rowBgColorList"
              :style="`background: linear-gradient(to right, ${row.left}, ${row.right});`"
            ></div>
          </div>
          <div class="point" :style="`top: ${255 - coordinate.y + 0.5}px; left: ${coordinate.x + 0.5}px;`"></div>
        </div>
        <div class="slider-box">
          <van-slider
            v-model="sliderValue"
            :min="0"
            :max="6 * 255"
            active-color="transparent"
            inactive-color="transparent"
            @change="changeMainColorBySlider"
          />
        </div>
        <div class="bottom">
          <div class="inputs-box">
            <div class="single-value-inputs">
              <van-field class="input" type="number" label-class="label" label="红" label-width="1em" input-align="right" :formatter="singleValueInputFormatter" v-model="inputColor.r" @blur="changePickedColorBySingleValueInput" @keyup.enter="changePickedColorBySingleValueInput" />
              <van-field class="input" type="number" label-class="label" label="绿" label-width="1em" input-align="right" :formatter="singleValueInputFormatter" v-model="inputColor.g" @blur="changePickedColorBySingleValueInput" @keyup.enter="changePickedColorBySingleValueInput" />
              <van-field class="input" type="number" label-class="label" label="蓝" label-width="1em" input-align="right" :formatter="singleValueInputFormatter" v-model="inputColor.b" @blur="changePickedColorBySingleValueInput" @keyup.enter="changePickedColorBySingleValueInput" />
            </div>
            <van-field class="name-input input" type="text" label-class="label" label="名称/十六进制" label-width="7em" input-align="right" v-model="inputColorName" @blur="changePickedColorByNameInput" @keyup.enter="changePickedColorByNameInput" />
          </div>
          <div class="color-demo" :style="`background: ${pickedColor}`"></div>
        </div>
      </div>
    </van-dialog>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, Ref, ref, watch } from 'vue';
import * as d3 from 'd3-color'
import _ from 'lodash';
import { sliderPartList } from './util'
import { Thorttle } from '@/utils/common'

interface ColumnBgColor {
  top: d3.RGBColor,
  bottom: d3.RGBColor
}
interface RowBgColor {
  left: d3.RGBColor,
  right: d3.RGBColor
}

const props = withDefaults(defineProps<{
  modelValue?: d3.RGBColor | null,
}>(), {
  modelValue: null,
});

const initColor: d3.RGBColor = d3.rgb(255, 0, 0);
let baseBgColorList: Array<any> = [];
baseBgColorList.length = 256;
baseBgColorList = _.fill(baseBgColorList, 0)

const getColorSingleValue = (start: number, end: number, index: number): number => {
  return start + (end - start) / 255 * index;
}
const columnBgColorList = computed((): Array<ColumnBgColor> => baseBgColorList.map((item, index) => ({
  top: d3.rgb(getColorSingleValue(255, mainColor.r, index), getColorSingleValue(255, mainColor.g, index), getColorSingleValue(255, mainColor.b, index)).rgb(),
  bottom: d3.rgb(0, 0, 0).rgb(),
})));
const rowBgColorList = computed((): Array<RowBgColor> => baseBgColorList.map((item, index) => ({
  left: d3.rgb(255 - index, 255 - index, 255 - index).rgb(),
  right: d3.rgb(getColorSingleValue(0, mainColor.r, 255 - index), getColorSingleValue(0, mainColor.g, 255 - index), getColorSingleValue(0, mainColor.b, 255 - index)).rgb(),
})));
const sliderValue = ref(0);
const mainColor: d3.RGBColor = reactive(initColor.copy());
const coordinate = reactive({
  x: 255,
  y: 255,
}) // 以左下角rgb(0, 0, 0)为原点
const pickedColor: d3.RGBColor = reactive(initColor.copy());
const inputColor: d3.RGBColor = reactive(initColor.copy());
const inputColorName: Ref<string> = ref(inputColor.formatHex());
watch(() => props.modelValue, (val) => {
  if (val) {
    setColor(val);
  }
})
const slidertThorttle = new Thorttle(10);
const changeMainColorBySlider= () => {
  const quotient = Math.floor(sliderValue.value / 255);
  const remainder = sliderValue.value % 255;
  const part = sliderPartList.find(part => part.index === quotient);
  if (part) {
    mainColor.r = part.value.r;
    mainColor.g = part.value.g;
    mainColor.b = part.value.b;
    mainColor[part.key] = part.isIncrease ? remainder : 255- remainder;
  }
}
watch(sliderValue, () => {
  slidertThorttle.doSomething(changeMainColorBySlider);
})
watch(mainColor, () => {
  for (const part of sliderPartList) {
    let flag = true;
    (['r', 'g', 'b'] as Array<'r'|'g'|'b'>).forEach(key => {
      if (key !== part.key) {
        flag = flag && (mainColor[key] === part.value[key]);
      }
    });
    if (flag) {
      if (part.index === 0 && mainColor[part.key] === 0) {
        sliderValue.value = sliderValue.value <= 3 * 255 ? 0 : 6 * 255;
      }
      else {
        sliderValue.value = 255 * part.index + (part.isIncrease ? mainColor[part.key] : 255 - mainColor[part.key]);
      }
      break;
    }
  }
},{
  deep: true,
})
watch(() => ({
  mainColor,
  coordinate,
}), () => {
  const rowBgColor: RowBgColor = {
    left: d3.rgb(getColorSingleValue(0, 255, coordinate.y), getColorSingleValue(0, 255, coordinate.y), getColorSingleValue(0, 255, coordinate.y)),
    right: d3.rgb(getColorSingleValue(0, mainColor.r, coordinate.y), getColorSingleValue(0, mainColor.g, coordinate.y), getColorSingleValue(0, mainColor.b, coordinate.y)),
  }
  pickedColor.r = getColorSingleValue(rowBgColor.left.r, rowBgColor.right.r, coordinate.x);
  pickedColor.g = getColorSingleValue(rowBgColor.left.g, rowBgColor.right.g, coordinate.x);
  pickedColor.b = getColorSingleValue(rowBgColor.left.b, rowBgColor.right.b, coordinate.x);
},{
  deep: true,
})

interface Emit {
  (e: 'update:modelValue', value: d3.RGBColor): void,
  (e: 'confirm', value: d3.RGBColor): void,
};
const emit = defineEmits<Emit>()

watch(pickedColor, () => {
  inputColor.r = Math.round(pickedColor.r);
  inputColor.g = Math.round(pickedColor.g);
  inputColor.b = Math.round(pickedColor.b);
  if (d3.color(inputColorName.value)?.formatHex() !== inputColor.formatHex()) {
    inputColorName.value = inputColor.formatHex();
  }
  
  // 当pickedColor的r、g、b三项相等时始终视为在左边框上，不需要更新当前mainColor，只需要更新坐标coordinate
  if (pickedColor.r === pickedColor.g && pickedColor.r === pickedColor.b) {
    coordinate.x = 0;
    coordinate.y = pickedColor.r;
  }
  // pickedColor的r、g、b中最大、最小的两项，对应的mainColor中一定也是最大、最小的两项，因为这三项本身就是mainColor按比例放缩得到的。又因mainColor的r、g、b至少为一项255和一项0，故mainColor的对应最大项必为255，最小项必为0
  else {
    const sortedKeyList = (['r', 'g', 'b'] as Array<('r' | 'g' | 'b')>).sort((a, b) => pickedColor[b] - pickedColor[a]);
    coordinate.y = pickedColor[sortedKeyList[0]];
    const topSmallKeyValue = pickedColor[sortedKeyList[2]] / coordinate.y * 255;
    const topMiddleKeyValue = pickedColor[sortedKeyList[1]] / coordinate.y * 255;
    coordinate.x = 255 - topSmallKeyValue;
    mainColor[sortedKeyList[0]] = 255;
    mainColor[sortedKeyList[2]] = 0;
    mainColor[sortedKeyList[1]] = 255 - (255 - topMiddleKeyValue) / (255 - topSmallKeyValue) * 255;
  }

  emit('update:modelValue', inputColor);
})

const colorPanelRef = ref<HTMLElement>();
const draggingThorttle = new Thorttle(10);
const dragging = (e: TouchEvent) => {
  const touch = e.targetTouches[0]
  if (!touch) {
    return;
  }
  draggingThorttle.doSomething(() => changeCoordinate(touch));
}
const dragEnd = (e: TouchEvent) => {
  const touch = e.changedTouches[0]
  if (!touch) {
    return;
  }
  changeCoordinate(touch)
}
const changeCoordinate = (touch: Touch): void => {
  if (colorPanelRef.value) {
    coordinate.x = Math.min(Math.max(touch.clientX - colorPanelRef.value.getBoundingClientRect().x, 0), 255);
    coordinate.y = 255 - Math.min(Math.max(touch.clientY - colorPanelRef.value.getBoundingClientRect().y, 0), 255);
  }
}
const singleValueInputFormatter = (value: string) => String(Math.min(Math.max(Number(value) || 0, 0), 255));
const changePickedColorBySingleValueInput = () => {
  pickedColor.r = inputColor.r;
  pickedColor.g = inputColor.g;
  pickedColor.b = inputColor.b;
}
const changePickedColorByNameInput = () => {
  const color = d3.color(inputColorName.value)?.rgb();
  if (color) {
    inputColor.r = color.r;
    inputColor.g = color.g;
    inputColor.b = color.b;
    changePickedColorBySingleValueInput();
  }
  else {
    inputColorName.value = inputColor.formatHex();
  }
}

const setColor = (color: d3.RGBColor): void => {
  pickedColor.r = color.r;
  pickedColor.g = color.g;
  pickedColor.b = color.b;
}
const getColor = (): d3.RGBColor => {
  return inputColor;
}


const dialogShow = ref(false);
const openDialog = () => dialogShow.value = true;
const dialogConfirm = () => {
  dialogShow.value = false;
  emit('confirm', inputColor);
}

defineExpose({
  setColor,
  getColor,
})

</script>

<style lang="scss" scoped>
$border-color: #CCCCCC;

.color-picker {
  --van-cell-vertical-padding: 6px;
  --van-cell-horizontal-padding: 0;
  display: inline-block;
  .content {
    display: inline-block;
    .color-display {
      width: 1em;
      height: 1em;
      border: 1px $border-color solid;
      border-radius: 2px;
    }
  }
  .dialog {
    .container {
      margin: 0 auto;
      width: 260px;
      padding: 10px 0;
      .color-panel-box {
        position: relative;
        margin: 10px auto;
        width: 256px;
        padding-bottom: 256px;
        height: 0;
        border: 2px $border-color solid;
        border-radius: 2px;
        .color-panel {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          display: flex;
          .color-column {
            flex: 1;
            height: 100%;
          }
          &.row {
            flex-direction: column;
            .color-row {
              flex: 1;
              width: 100%;
            }
          }
        }
        .point {
          position: absolute;
          top: 0;
          left: 0;
          width: 20px;
          height: 20px;
          transform: translate(-50%, -50%);
          background: #FFFFFF;
          border-radius: 50%;
          box-shadow: 1px 1px 4px 1px gray;
        }
      }
      .slider-box {
        margin: 10px auto 20px;
        padding-top: 30px;
        width: 256px;
        border: 2px $border-color solid;
        border-radius: 2px;
        background: linear-gradient(to right, rgb(255, 0, 0), rgb(255, 255, 0), rgb(0, 255, 0), rgb(0, 255, 255), rgb(0, 0, 255), rgb(255, 0, 255), rgb(255, 0, 0));
      }
      .bottom {
        display: flex;
        align-items: center;
        .inputs-box {
          flex: 1;
          width: 0;
          margin-right: 10px;
          :deep(.input) {
            flex: 1;
            padding: 0 5px;
            border: 1px $border-color solid;
            border-radius: 4px;
            .label {
              margin-right: 6px;
            }
          }
          .single-value-inputs {
            display: flex;
            align-items: center;
            .input:nth-of-type(2) {
              margin: 0 10px;
            }
          }
          .name-input {
            margin-top: 10px;
          }
        }
        .color-demo {
          width: 58px;
          height: 58px;
          border: 2px $border-color solid;
        }
      }
    }
  }
}
</style>