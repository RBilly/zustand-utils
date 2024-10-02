import { describe, expect, test } from '@jest/globals';
import { create } from './createStore';

describe('create function', () => {
  test('creates a store with initial state', () => {
    const store = create({ count: 0 })
      .selectors((get) => ({
        doubleCount: () => get.count() * 2
      }))
      .actions((set, get) => ({
        inc: (by: number) => set.count(get.count() + by)
      }));

    expect(store).toBeDefined();
    expect(store.get).toBeDefined();
    expect(store.set).toBeDefined();
    expect(store.use).toBeDefined();
    expect(store.store).toBeDefined();
    expect(store.selectors).toBeDefined();
    expect(store.actions).toBeDefined();

    // state getters and setters
    expect(store.get.count).toBeDefined();
    expect(store.set.count).toBeDefined();

    // underlying zustand store
    expect(store.store.getState).toBeDefined();
    expect(store.store.setState).toBeDefined();
    expect(store.store.subscribe).toBeDefined();

    // generated hooks
    const hooks = store.use;
    expect(hooks).toHaveProperty('useCount');
    expect(hooks).toHaveProperty('useDoubleCount');
    expect(hooks).toHaveProperty('useActions');
    const actions = hooks.useActions();
    expect(actions).toHaveProperty('setCount');
    expect(actions).toHaveProperty('inc');
  });
});
