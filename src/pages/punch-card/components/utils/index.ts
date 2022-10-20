export const getAdjacentIndex = (index: number, length: number): { prevSwipeIndex: number, nextSwipeIndex: number } => {
  if (index === 0) {
    return {
      prevSwipeIndex: length - 1,
      nextSwipeIndex: index + 1,
    };
  }
  else if (index === length - 1) {
    return {
      prevSwipeIndex: index - 1,
      nextSwipeIndex: 0,
    };
  }
  else {
    return {
      prevSwipeIndex: index - 1,
      nextSwipeIndex: index + 1,
    };
  }
};