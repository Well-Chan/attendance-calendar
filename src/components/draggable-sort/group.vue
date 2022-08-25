<template>
  <div class="draggable-sort-group" ref="draggableSortGroup">
    <div
      class="draggable-sort-cell"
      :class="{
        'dragging-cell-pre': draggingCellPreIndex === index,
        'dragging-cell-nxt': index === 0 && draggingCellPreIndex === -1,
        'dragged-cell': draggedIndex === index && isDragging,
      }"
      v-for="(item, index) in itemList"
      :key="index"
      :ref="setItemRef"
      @touchstart="dragStart($event, index)"
      @touchmove="dragging"
      @touchend="dragEnd"
      @touchcancel="dragEnd"
    >
      <slot :item="item" />
    </div>
    <div
      class="dragging-cell"
      ref="draggingCell"
      v-if="draggedItem.data"
      v-show="isDragging"
      :style="draggingCellStyle"
    >
      <slot :item="draggedItem.data" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUpdate, reactive, Ref, ref, watch } from 'vue';
import _ from 'lodash';

interface Props {
  list: Array<any>,
  disabled: boolean, 
}
const props = withDefaults(defineProps<Props>(), {
  list: () => [],
  disabled: false,
});

const itemList: Ref<Array<any>> = ref(reactive([]));
watch(() => props.list, (val) => {
  itemList.value = val.map(item => _.cloneDeep(item))
}, {
  immediate: true,
  deep: true,
})

const itemRefs: Ref<Array<any>> = ref(reactive([]));
onBeforeUpdate(() => itemRefs.value = reactive([]))
const setItemRef = (el: any) => {
  itemRefs.value.push(el)
};

interface Emit {
  (e: 'changeSeq', list: Array<any>): void,
  (e: 'update:list', list: Array<any>): void,
};

const emit = defineEmits<Emit>()

const isDragging = ref(false);
const draggedIndex = ref(0);
const draggedItem = reactive({
  el: null,
  data: null,
});
const draggingCellPreIndex = ref(0);
const draggingCellStyle = ref('');
const dragStart = (e: TouchEvent, index: number) => {
  if (props.disabled) {
    return;
  }
  draggedIndex.value = index;
  draggedItem.el = itemRefs.value[index];
  draggedItem.data = itemList.value[index];
  isDragging.value = true;
  updateDraggingCellStyle(e);
};
const dragEnd = () => {
  if (props.disabled || !isDragging.value) {
    return;
  }
  isDragging.value = false;
  emit('changeSeq', itemList.value);
  emit('update:list', itemList.value);
}
const getCenterPointList = () => {
  return itemRefs.value.map(el => {
    const offset = getElementOffset(el);
    return {
      top: offset.top + el.clientTop + el.clientHeight / 2,
      left: offset.left + el.clientLeft + el.clientWidth / 2,
    };
  });
}
const dragging = (e: TouchEvent) => {
  if (props.disabled || !isDragging.value) {
    return;
  }
  updateDraggingCellStyle(e);
  const goOn = throttle();
  if (!goOn) {
    return;
  }
  const pageY = e.targetTouches[0].pageY;
  const centerPointList = getCenterPointList();
  const newDraggingCellPreIndex = centerPointList.findIndex((point, index) => {
    if (index === centerPointList.length - 1) {
      if (pageY >= point.top) {
        return true;
      }
      else {
        return false;
      }
    }
    else {
      return pageY >= point.top && pageY < centerPointList[index + 1].top; 
    }
  })
  if (newDraggingCellPreIndex !== draggingCellPreIndex.value) {
    draggingCellPreIndex.value = newDraggingCellPreIndex;
    if (draggingCellPreIndex.value !== draggedIndex.value && draggingCellPreIndex.value !== draggedIndex.value - 1) {
      if (draggedIndex.value > draggingCellPreIndex.value) {
        const draggedItemArr = itemList.value.splice(draggedIndex.value, 1);
        itemList.value.splice(draggingCellPreIndex.value + 1, 0, ...draggedItemArr);
        draggedIndex.value = draggingCellPreIndex.value + 1;
      }
      else {
        const draggedItemArr = itemList.value.splice(draggedIndex.value, 1);
        itemList.value.splice(draggingCellPreIndex.value, 0, ...draggedItemArr);
        draggedIndex.value = draggingCellPreIndex.value;
      }
    }
  }
};
const draggingCell = ref(null);
const draggableSortGroup = ref(null);
const updateDraggingCellStyle = (e: TouchEvent) => {
  const top = e.targetTouches[0].pageY;
  if (top > document.body.clientHeight - ((draggingCell.value as any)?.clientHeight || 0) / 2) {
    return;
  }
  draggingCellStyle.value = `top: ${e.targetTouches[0].pageY - getElementOffset(draggableSortGroup.value).top}px; width: ${(draggedItem.el as any)?.clientWidth}px;`;
}

const throttle = (() => {
  let waiting = false;
  return () => {
    if (waiting) {
      return false;
    }
    waiting = true;
    setTimeout(() => {
      waiting = false;
    }, 1)
    return true;
  }
})();

const getElementOffset = (el: any): { top: number, left: number} => {
  const offset = {
    top: 0,
    left: 0,
  };
  while (el) {
    offset.top += el.offsetTop;
    offset.left += el.offsetLeft;
    el = el.offsetParent as any;
  }
  return offset;
}
</script>

<style lang="scss" scoped>
.draggable-sort-group {
  position: relative;
  .draggable-sort-cell {
    &.dragged-cell {
      opacity: 0;
    }
    &.dragging-cell-pre {
    }
    &.dragging-cell-nxt {
    }
  }
  .dragging-cell {
    position: absolute;
    left: 0;
    transform: translateY(-50%);
    opacity: 0.5;
  }
}
</style>