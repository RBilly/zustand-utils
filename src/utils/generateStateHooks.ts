import { type StoreApi, useStore } from 'zustand';
import type { ActionsSetters, State, StoreApiUse, UseStateRecord } from '../types';
import { capitalize } from './capitalize';

/**
 * Generate hooks to access and update state elements of the store
 * @param store
 */
export const generateStateHooks = <TState extends State>(store: StoreApi<TState>) => {
  const hooks = <StoreApiUse<TState>>{};
  const actions = <ActionsSetters<TState>>{};
  for (const key of Object.keys(store.getState()) as Array<keyof TState>) {
    const capitalizedKey = capitalize(key as string);
    const hookToKey = `use${capitalizedKey}` as keyof UseStateRecord<TState>;
    const actionKey = `set${capitalizedKey}` as keyof ActionsSetters<TState>;
    hooks[hookToKey] = (() =>
      useStore(store, () => store.getState()[key])) as StoreApiUse<TState>[typeof hookToKey];
    actions[actionKey] = ((value: TState[keyof TState]) => {
      const prevValue = store.getState()[key as keyof TState];
      if (prevValue === value) return;
      const newState = { ...store.getState() };
      newState[key as keyof TState] = value;
      store.setState(newState);
    }) as ActionsSetters<TState>[typeof actionKey];
  }
  hooks.useActions = () => actions;
  return hooks;
};
