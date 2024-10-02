import type { StoreApi } from 'zustand';
import type { DevtoolsOptions, PersistOptions } from 'zustand/middleware';

export type State = Record<string, unknown>;

export type GetRecord<T> = {
  [Key in keyof T]: () => T[Key];
};

export type SetRecord<T> = {
  [Key in keyof T]: (value: T[Key]) => void;
};

export type UseStateRecord<T> = {
  [Key in keyof T as `use${Capitalize<string & Key>}`]: () => T[Key];
};

export type UseDerivedStateRecord<T> = {
  [Key in keyof T as `use${Capitalize<string & Key>}`]: T[Key];
};

export type ActionRecord<T> = {
  [Key in keyof T]: (...args: any[]) => void;
};

type GetState<T> = {
  state: StoreApi<T>['getState'];
};

type SetState<T> = {
  state: StoreApi<T>['setState'];
};

export type ActionsSetters<T> = {
  [Key in keyof T as `set${Capitalize<string & Key>}`]: (value: T[Key]) => void;
};

type StateGetters<TState extends State> = GetRecord<TState> & GetState<TState>;

type StateSetters<TState extends State> = SetRecord<TState> & SetState<TState>;

type UseState<TState extends State> = UseStateRecord<TState>;

export type UseSelectors<TSelectors> = UseDerivedStateRecord<TSelectors>;

type UseActions<TState, TActions> = {
  useActions: () => ActionsSetters<TState> & ActionRecord<TActions>;
};

export type StoreApiGet<TState extends State, TSelectors = State> = StateGetters<TState> &
  TSelectors;

export type StoreApiSet<TState extends State, TActions = State> = StateSetters<TState> & TActions;

export type StoreApiUse<
  TState extends State,
  TActions = State,
  TSelectors = State
> = UseState<TState> & UseSelectors<TSelectors> & UseActions<TState, TActions>;

export type SelectorBuilder<TState extends State, TSelectors = State> = (
  get: StoreApiGet<TState, TSelectors>
) => any;

export type ActionBuilder<TState extends State, TActions = State, TSelectors = State> = (
  set: StoreApiSet<TState, TActions>,
  get: StoreApiGet<TState, TSelectors>
) => any;

/**
 * Extended zustand store api type. \
 * It provides additional features to simplify store management
 */
export type ExtendedStoreApi<TState extends State = State, TActions = State, TSelectors = State> = {
  /** Collection of function to retrieve store elements */
  get: StoreApiGet<TState, TSelectors>;
  /** Collection of function to modify the state of the store*/
  set: StoreApiSet<TState, TActions>;
  /** Escape hatch to use original zustand store api*/
  store: StoreApi<TState>;
  /**
   * Collection of hooks to manipulate the store. \
   * Export the hooks to other components so that they can safely use the store
   */
  use: StoreApiUse<TState, TActions, TSelectors>;
  /**
   * Builder to define function that return values derived from the store state. \
   * Value from a derived function will be automatically updated when the store is updated.
   */
  selectors<TSelectorBuilder extends SelectorBuilder<TState, TSelectors>>(
    builder: TSelectorBuilder
  ): ExtendedStoreApi<TState, TActions, TSelectors & ReturnType<TSelectorBuilder>>;
  /**
   * Builder to define function to update the state of the store. \
   * Do not define direct update functions for store elements, those are auto-generated. \
   * e.g. no need to create the setMyValue(newValue) function to update the myValue element
   */
  actions<TActionBuilder extends ActionBuilder<TState, TActions, TSelectors>>(
    builder: TActionBuilder
  ): ExtendedStoreApi<TState, TActions & ReturnType<TActionBuilder>, TSelectors>;
};

/**
 * Middleware options to apply on the store
 */
export type CreateStoreOptions<TState extends State> = {
  /**
   * Devtools middleware options.
   */
  devtools?: DevtoolsOptions;
  /**
   * Persist middleware options.
   */
  persist?: PersistOptions<Partial<TState>>;
  /**
   * Other Zustand middlewares.
   */
  middlewares?: any[];
};
