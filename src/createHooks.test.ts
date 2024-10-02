import { beforeEach, describe, expect, test } from '@jest/globals';
import { create, useStore } from 'zustand';
import { createHooks } from './createHooks';

// Mock zustand useStore hook
jest.mock('zustand', () => ({
  ...jest.requireActual('zustand'),
  useStore: jest.fn()
}));

describe('createHooks', () => {
  // Sample state type
  type TestState = {
    count: number;
    name: string;
    actions: {
      inc: () => void;
    };
  };

  // Create a test store
  const createTestStore = () =>
    create<TestState>((set) => ({
      count: 0,
      name: 'Test',
      actions: {
        inc: () => set((state) => ({ count: state.count + 1 }))
      }
    }));

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('create hooks for all state properties', () => {
    const store = createTestStore();
    const hooks = createHooks(store);

    expect(hooks).toHaveProperty('useCount');
    expect(hooks).toHaveProperty('useName');
    expect(hooks).toHaveProperty('useActions');

    hooks.useCount();
    expect(useStore).toHaveBeenCalledWith(store, expect.any(Function));
  });
});
