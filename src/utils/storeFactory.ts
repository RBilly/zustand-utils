import { useStore } from 'zustand';
import type {
  ActionBuilder,
  ActionsSetters,
  ExtendedStoreApi,
  SelectorBuilder,
  SetRecord,
  State,
  StoreApiGet,
  StoreApiUse,
  UseDerivedStateRecord
} from '../types';
import { capitalize } from './capitalize';

/**
 * Add selectors to a store api from a selector builder
 * @param builder
 * @param api
 */
const setSelectors = <
  TSelectorBuilder extends SelectorBuilder<TState, TSelectors>,
  TState extends State,
  TActions = State,
  TSelectors = State
>(
  builder: TSelectorBuilder,
  api: ExtendedStoreApi<TState, TActions, TSelectors>
): ExtendedStoreApi<TState, TActions, TSelectors & ReturnType<TSelectorBuilder>> => {
  const selectorsKeys = Object.keys(builder(api.get)) as Array<keyof ReturnType<TSelectorBuilder>>;
  const get = { ...api.get } as StoreApiGet<TState, TSelectors & ReturnType<TSelectorBuilder>>;
  const use = { ...api.use } as StoreApiUse<
    TState,
    TActions,
    TSelectors & ReturnType<TSelectorBuilder>
  >;

  for (const key of selectorsKeys) {
    const hookToKey = `use${capitalize(key as string)}` as keyof UseDerivedStateRecord<TSelectors>;
    use[hookToKey] = ((
      ...args: any[] // generate and add new hooks for the new selectors to the store api
    ) =>
      useStore(api.store, () => {
        const selectors = builder(api.get);
        const selector = selectors[key as keyof typeof selectors];
        return selector(...args);
      })) as unknown as StoreApiUse<
      TState,
      TActions,
      TSelectors & ReturnType<TSelectorBuilder>
    >[typeof hookToKey];
    get[key] = ((...args: any[]) => {
      // generate selectors and add them to the get accessor of the store api
      const selectors = builder(api.get);
      const selector = selectors[key as keyof typeof selectors];
      return selector(...args);
    }) as StoreApiGet<TState, TSelectors & ReturnType<TSelectorBuilder>>[typeof key];
  }

  return {
    ...(api as any),
    get,
    use
  };
};

/**
 * Add actions to a store api from an action builder
 * @param builder
 * @param api
 */
const setActions = <
  TActionBuilder extends ActionBuilder<TState, TActions, TSelectors>,
  TState extends State,
  TActions = State,
  TSelectors = State
>(
  builder: TActionBuilder,
  api: ExtendedStoreApi<TState, TActions, TSelectors>
): ExtendedStoreApi<TState, TActions & ReturnType<TActionBuilder>, TSelectors> => {
  const actions = builder(api.set, api.get) as SetRecord<TState> & ReturnType<TActionBuilder>;
  // Add actions to the set accessor and to the useActions hook of the store api
  const set = { ...api.set, ...actions } as ActionsSetters<TState> &
    TActions &
    ReturnType<TActionBuilder>;
  const use = {
    ...api.use,
    useActions: () => ({ ...api.use.useActions(), ...actions })
  } as StoreApiUse<TState, TActions & ReturnType<TActionBuilder>, TSelectors>;

  return {
    ...(api as any),
    set,
    use
  };
};

/**
 * The storeFactory function allows to chain builders when creating the store and to provide type inference to the builders.
 * e.g: create(...).actions(...).selectors(...)
 * @param api
 */
export const storeFactory = <TState extends State, TActions, TSelectors>(
  api: ExtendedStoreApi<TState, TActions, TSelectors>
) => ({
  ...api,
  selectors: (builder: SelectorBuilder<TState, TSelectors>) =>
    storeFactory(setSelectors(builder, api)),
  actions: (builder: ActionBuilder<TState, TActions, TSelectors>) =>
    storeFactory(setActions(builder, api))
});
