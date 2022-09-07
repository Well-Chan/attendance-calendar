/* eslint-disable no-prototype-builtins */
import { nanoid } from 'nanoid';
import dayjs from 'dayjs';
const dateFormat = 'YYYY-MM-DD HH:mm:ss';

export interface LogData {
  id?: string,
  date: string,
  text: string,
  createTime: string,
  updateTime: string,
}

export interface ItemData {
  id?: string,
  title: string,
  color: string,
  textColor: string,
  logList?: Array<LogData>,
  seq: number,
  createTime: string,
  updateTime: string,
}

export class Log {
  constructor({ id, date, text, createTime, updateTime }: LogData) {
    if (id) {
      this.id = id;
    }
    else {
      this.id = nanoid();
    }
    this.date = date;
    this.text = text;
    const currentTime = dayjs().format(dateFormat);
    this.createTime = createTime || currentTime;
    this.updateTime = updateTime || currentTime;
  }

  id: string;
  date: string;
  text: string;
  createTime: string;
  updateTime: string;

  setProps(data: ObjectWithKey): void {
    for (const key of Object.keys(data)) {
      if (this.hasOwnProperty(key)) {
        (this as ObjectWithKey)[key] = data[key];
      } 
    }
  }

  toLocalData(): LogData {
    return {
      id: this.id,
      date: this.date,
      text: this.text,
      createTime: this.createTime,
      updateTime: this.updateTime,
    };
  }
}

export class Item {
  constructor({id, title, color, textColor, seq, createTime, updateTime }: ItemData) {
    if (id) {
      this.id = id;
    }
    else {
      this.id = nanoid();
    }
    this.title = title;
    this.color = color;
    this.textColor = textColor;
    this.logList = [];
    this.seq = seq || 0;
    const currentTime = dayjs().format(dateFormat);
    this.createTime = createTime || currentTime;
    this.updateTime = updateTime || currentTime;
  }

  id: string;
  title: string;
  color: string;
  textColor: string;
  logList: Array<Log>;
  seq: number;
  createTime: string;
  updateTime: string;

  setProps(data: ObjectWithKey): void {
    for (const key of Object.keys(data)) {
      if (this.hasOwnProperty(key)) {
        (this as ObjectWithKey)[key] = data[key];
      } 
    }
  }

  addLog(data: LogData): void {
    this.logList.push(new Log(data));
    this.logList.sort((a, b) => Number(a.date.split('-').join('')) - Number(b.date.split('-').join('')));
  }

  deleteLog(logId: string): void {
    const index = this.logList.findIndex(log => log.id === logId);
    if (index != -1) {
      this.logList.splice(index, 1);
    }
    else {
      throw `DeleteLog failed: Can't find log whose id is '${logId}'`;
    }
  }

  toLocalData(): ItemData {
    return {
      id: this.id,
      title: this.title,
      color: this.color,
      textColor: this.textColor,
      logList: this.logList.map(log => log.toLocalData()),
      seq: this.seq,
      createTime: this.createTime,
      updateTime: this.updateTime,
    };
  }
}

export interface DataState {
  data: Array<Item>
}