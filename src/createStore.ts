import { type StateCreator, type StoreApi, createStore } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { CreateStoreOptions, ExtendedStoreApi, State } from './types';
import { generateStateGetters } from './utils/generateStateGetters';
import { generateStateHooks } from './utils/generateStateHooks';
import { generateStateSetters } from './utils/generateStateSetters';
import { storeFactory } from './utils/storeFactory';

/**
 * Replace Zustand create function to provide an opinionated way of creating a Zustand store \
 * It generates automatically setters for state elements of the store. \
 * E.g: `create({count: 0})` will provide function to read count value and to set count value. \
 * It allows to define custom actions through the action builder. \
 * E.g: `create({count: 0}).actions((set, get) => ({inc: (by: number) => set.count(get.count() + by)}))` \
 * It allows to define custom selectors through the selector builder. \
 * E.g: `create({firstName: 'John', lastName: 'Doe'}).selectors((get) => ({fullName: ``${get.firstName()} ${get.lastName()}``}))`\
 * If a selector hase the same key as an element of the state then it overrides it. \
 * E.g: `create({name: 'test'}).selectors((get) => ({name: () => capitalize(get.name()) })`
 * `get` will give access to the state element but when using hooks useName will return the value of the selector not the state element
 * And it provides hooks to manipulate the store safely. \
 * E.g: `create({count: 0}).selectors((get) => ({doubleCount: ...})).actions((set, get) => ({inc: ...})).use`
 * will return `{useCount, useDoubleCount, useActions}` hooks. `useActions` hooks will return the `inc` function when called
 * @param initialState - the state of the store at creation time
 * @param options - options to use middleware supported by zustand, such as persist and devtools middleware
 */
export const create = <TState extends State>(
  initialState: TState,
  options: CreateStoreOptions<TState> = {}
): ExtendedStoreApi<TState> => {
  const { middlewares = [], devtools: devtoolsOpts, persist: persistOpts } = options;

  if (persistOpts) {
    middlewares.push((config: any) => persist(config, persistOpts));
  }

  if (devtoolsOpts) {
    middlewares.push((config: any) => devtools(config, devtoolsOpts));
  }

  middlewares.push(createStore);

  const pipeMiddleware = (createState: StateCreator<TState>) => {
    return middlewares.reduce(
      (previousMiddleware, currentMiddleware) => currentMiddleware(previousMiddleware),
      createState
    );
  };

  const store = pipeMiddleware(() => initialState) as StoreApi<TState>;

  const api: ExtendedStoreApi<TState> = {
    get: {
      ...generateStateGetters(store),
      state: store.getState
    },
    set: {
      ...generateStateSetters(store),
      state: store.setState
    },
    store,
    use: generateStateHooks(store),
    selectors: () => api as any,
    actions: () => api as any
  };

  return storeFactory(api);
};
