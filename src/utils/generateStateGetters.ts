import type { StoreApi } from 'zustand';
import type { GetRecord, State } from '../types';

/**
 * Generate getters for the state elements of the store
 * @param store
 */
export const generateStateGetters = <TState extends State>(store: StoreApi<TState>) => {
  const selectors = <GetRecord<TState>>{};
  for (const key of Object.keys(store.getState())) {
    selectors[key as keyof TState] = () => store.getState()[key as keyof TState];
  }
  return selectors;
};
