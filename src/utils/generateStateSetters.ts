import type { StoreApi } from 'zustand';
import type { SetRecord, State } from '../types';

/**
 * Generate setters for the state elements of the store
 * @param store
 */
export const generateStateSetters = <TState extends State>(store: StoreApi<TState>) => {
  const actions = <SetRecord<TState>>{};
  for (const key of Object.keys(store.getState())) {
    actions[key as keyof TState] = (value) => {
      const prevValue = store.getState()[key as keyof TState];
      if (prevValue === value) return;
      const newState = { ...store.getState() };
      newState[key as keyof TState] = value;
      store.setState(newState);
    };
  }
  return actions;
};
