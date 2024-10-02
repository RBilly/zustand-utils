import React, { createElement, type ReactNode, useContext, useState } from 'react';
import type { StoreApi } from 'zustand';
import { createHooks } from './createHooks';
import type { ExtendedStoreApi, State, StoreApiUse } from './types';

/**
 * Create a Zustand store wrapped in a React context.
 * It returns a Provider and a store function to retrieve the hooks to manipulate the store from the context.
 * @param initializeFn - a function that returns either a classic zustand store (created using the `createStore` function from Zustand)
 * or a store created through the `create` method from this Zustand-utils lib.
 */
export const createContext = <TState extends State, TActions, TSelectors, TInitialState>(
  initializeFn:
    | ((
        initialState: TInitialState
      ) => ExtendedStoreApi<TState, TActions, TSelectors> | StoreApi<TState>)
    | (() => ExtendedStoreApi<TState, TActions, TSelectors> | StoreApi<TState>)
) => {
  const context = React.createContext<
    ExtendedStoreApi<TState, TActions, TSelectors> | StoreApi<TState>
  >(undefined!);

  const StoreProvider = (
    props: (TInitialState extends State ? { initialState: TInitialState } : {}) & {
      children: ReactNode;
    }
  ) => {
    const [store] = useState(() => {
      if ('initialState' in props) {
        return (
          initializeFn as (
            initialState: TInitialState
          ) => ExtendedStoreApi<TState, TActions, TSelectors> | StoreApi<TState>
        )(props.initialState);
      } else {
        return (
          initializeFn as () => ExtendedStoreApi<TState, TActions, TSelectors> | StoreApi<TState>
        )();
      }
    });
    return createElement(context.Provider, { value: store }, props.children);
  };

  const contextHooks = () => {
    const store = useContext(context);
    if (!store) {
      throw new Error('Context store must be used within the context provider');
    }
    if ('use' in store) {
      return store.use;
    }
    return createHooks(store) as StoreApiUse<TState, TActions, TSelectors>;
  };

  return {
    StoreProvider,
    store: contextHooks
  };
};
