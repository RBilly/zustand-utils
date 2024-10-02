import { type StoreApi, type UseBoundStore, useStore } from 'zustand';
import type { State, UseStateRecord } from './types';
import { capitalize } from './utils/capitalize';

/**
 * Create an object containing the hooks to access the store elements
 * @param store a Zustand store
 */
export function createHooks<T extends State>(store: UseBoundStore<StoreApi<T>> | StoreApi<T>) {
  const hooks = <UseStateRecord<T>>{};
  for (const key of Object.keys(store.getState())) {
    const selector = (state: T) => state[key as keyof T];
    const hookToKey = `use${capitalize(key)}` as keyof UseStateRecord<T>;
    hooks[hookToKey] = (() => useStore(store, selector)) as UseStateRecord<T>[typeof hookToKey];
  }
  return hooks;
}
