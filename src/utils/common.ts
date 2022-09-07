export const delay = (time = 0): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => resolve(), time);
  });
};

export class Thorttle {
  constructor(interval?: number) {
    this.interval = interval || this.interval;
  }
  interval = 100; // ms
  timer: NodeJS.Timeout | null = null;
  doSomething(callback: () => void): void {
    if (!this.timer) {
      this.timer = setTimeout(() => {
        this.timer = null;
      }, this.interval);
      callback && callback();
    }
  }
}