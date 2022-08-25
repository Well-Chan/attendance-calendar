import { Module } from 'vuex';
import { Log, ItemData, Item, DataState } from './define';
import { RootState } from '@/store';
import fileUtils from './file';

const fileSystem = await fileUtils.getFileSystem(1024 * 5);

const dataStore: Module<DataState, RootState> = {
  namespaced: true,
  state: {
    data: [],
  },
  getters: {
    data: (state: DataState): Array<Item> => state.data.sort((a, b) => a.seq - b.seq),
    oneItem: (state: DataState) => (id: string): Item => {
      const item = state.data.find(item => item.id === id);
      if (item) {
        return item;
      }
      else {
        throw `Getters-oneItem failed: Can't find item whose id is '${id}'`;
      }
    },
    localData(state: DataState): string {
      return JSON.stringify(state.data.map(item => item.toLocalData()));
    }
  },
  mutations: {
    setData(state, data: Array<Item>): void {
      state.data = data;
    },
    addItem(state, data: ItemData): void {
      const itemList = (this as any).getters['data/data'];
      data.seq = itemList[itemList.length - 1].seq + 1;
      state.data.push(new Item(data));
      (this as any).dispatch('data/setLocalData');
    },
    editItem(state, data: ItemData): void {
      const item = (this as any).getters['data/oneItem'](data.id);
      item.setProps(data);
      (this as any).dispatch('data/setLocalData');
    },
    deleteItem(state, id: string): void {
      const index = state.data.findIndex(item => item.id === id);
      if (index != -1) {
        state.data.splice(index, 1);
      }
      else {
        throw `DeleteItem failed: Can't find item whose id is '${id}'`;
      }
      (this as any).dispatch('data/setLocalData');
    },
    addLog(state, data: { itemId: string, date: string, text: string }): void {
      const item = (this as any).getters['data/oneItem'](data.itemId);
      item.addLog(data);
      (this as any).dispatch('data/setLocalData');
    },
    deleteLog(state, { itemId, logId }: { itemId: string, logId: string }): void {
      const item = (this as any).getters['data/oneItem'](itemId);
      item.deleteLog(logId);
      (this as any).dispatch('data/setLocalData');
    },
  },
  actions: {
    async setData({ commit }, data: Array<Item>): Promise<void> {
      try {
        commit('setData', data);
      }
      catch (err: any) {
        console.log('SetData failed: ' + err.toString());
        throw err;
      }
    },
    async getLocalData({ dispatch }): Promise<void> {
      try {
        const text = await fileSystem.readFile('/data/punchLog.txt');
        await dispatch('setData', (text ? JSON.parse(text) : []).map((data: ItemData): Item => {
          const item = new Item(data);
          item.logList = (data.logList || []).map(logData => new Log(logData));
          return item;
        }));
      }
      catch (err: any) {
        console.log('GetLocalData failed: ' + err.toString());
        throw err;
      }
    },
    async setLocalData({ state }, text: string): Promise<void> {
      try {
        if (text) {
          await fileSystem.writeFile('/data/punchLog.txt', text);
        }
        else {
          await fileSystem.writeFile('/data/punchLog.txt', (this as any).getters['data/localData']);
        }
      }
      catch (err: any) {
        console.log('SetLocalData failed: ' + err.toString());
        throw err;
      }
    },
    async addItem({ commit }, data: ItemData): Promise<void> {
      try {
        commit('addItem', data);
      }
      catch (err: any) {
        console.log('AddItem failed: ' + err.toString());
        throw err;
      }
    },
    async editItem({ commit }, data): Promise<void> {
      try {
        commit('editItem', data);
      }
      catch (err: any) {
        console.log('EditItem failed: ' + err.toString());
        throw err;
      }
    },
    async deleteItem({ commit }, id): Promise<void> {
      try {
        commit('deleteItem', id);
      }
      catch (err: any) {
        console.log('DeleteItem failed: ' + err.toString());
        throw err;
      }
    },
    async addLog({ commit }, data: { itemId: string, date: string, text: string }): Promise<void> {
      try {
        commit('addLog', data);
      }
      catch (err: any) {
        console.log('AddLog failed: ' + err.toString());
        throw err;
      }
    },
    async deleteLog({ commit }, data: { itemId: string, logId: string }): Promise<void> {
      try {
        commit('deleteLog', data);
      }
      catch (err: any) {
        console.log('DeleteLog failed: ' + err.toString());
        throw err;
      }
    },
  }
};

export default dataStore;