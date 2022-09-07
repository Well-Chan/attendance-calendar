import { InjectionKey } from 'vue';
import { createStore, useStore as baseUseStore, Store } from 'vuex';
import data from './store/data/index';
import { DataState } from './store/data/define';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RootState {}

interface AllState extends RootState {
  data: DataState,
}

export const key: InjectionKey<Store<RootState>> = Symbol();

// 创建一个新的 store 实例
export const store = createStore<Store<RootState>>({
  modules: {
    data,
  }
});

export const useStore = <T = AllState>() => { return baseUseStore<T>(key); };