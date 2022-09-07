export const sliderPartList: Array<{
  index: number,
  value: { r: number, g: number, b: number },
  key: 'r'|'g'|'b',
  isIncrease: boolean,
}> = [
  {
    index: 0,
    value: {
      r: 255,
      g: 0,
      b: 0,
    },
    key: 'g',
    isIncrease: true,
  },
  {
    index: 1,
    value: {
      r: 255,
      g: 255,
      b: 0,
    },
    key: 'r',
    isIncrease: false,
  },
  {
    index: 2,
    value: {
      r: 0,
      g: 255,
      b: 0,
    },
    key: 'b',
    isIncrease: true,
  },
  {
    index: 3,
    value: {
      r: 0,
      g: 255,
      b: 255,
    },
    key: 'g',
    isIncrease: false,
  },
  {
    index: 4,
    value: {
      r: 0,
      g: 0,
      b: 255,
    },
    key: 'r',
    isIncrease: true,
  },
  {
    index: 5,
    value: {
      r: 255,
      g: 0,
      b: 255,
    },
    key: 'b',
    isIncrease: false,
  },
  {
    index: 6,
    value: {
      r: 255,
      g: 0,
      b: 0,
    },
    key: 'g',
    isIncrease: true,
  },
  {
    index: 6,
    value: {
      r: 255,
      g: 0,
      b: 0,
    },
    key: 'g',
    isIncrease: false,
  },
];