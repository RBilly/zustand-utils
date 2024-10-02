import { jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { createStore } from 'zustand';
import { createContext } from './createContext';
import { create } from './createStore';
import '@testing-library/jest-dom';

describe('createContext', () => {
  // Define types for our test store
  type TestState = { count: number };
  type TestActions = { inc: () => void };
  type TestInitialState = { initialCount: number };

  const zustandCreateInitFn = (initValue: TestInitialState) =>
    createStore<TestState & TestActions>((set) => ({
      count: initValue.initialCount,
      inc: () => set((state: TestState) => ({ count: state.count + 1 }))
    }));

  const zustandUtilsCreateInitFn = (initValue: TestInitialState) =>
    create({
      count: initValue.initialCount
    })
      .actions((set, get) => ({
        inc: () => set.count(get.count() + 1)
      }))
      .selectors((get) => ({
        doubleCount: () => get.count() * 2
      }));

  const mock = {
    initFn: zustandCreateInitFn
  };

  test('Provider and store accessor with Zustand createStore function', () => {
    const { StoreProvider, store } = createContext(zustandCreateInitFn);

    expect(StoreProvider).toBeDefined();
    expect(store).toBeDefined();
  });

  test('Provider and store accessor with Zustand-utils create function', () => {
    const { StoreProvider, store } = createContext(zustandUtilsCreateInitFn);

    expect(StoreProvider).toBeDefined();
    expect(store).toBeDefined();
  });

  test('Provider and store accessor without parameterized initial state', () => {
    const { StoreProvider, store } = createContext(() => create({ count: 9 }));

    const TestComponent = () => {
      const count = store().useCount();
      return <div>Count: {count}</div>;
    };

    render(
      <StoreProvider>
        <TestComponent />
      </StoreProvider>
    );

    expect(StoreProvider).toBeDefined();
    expect(store).toBeDefined();
    expect(screen.getByText('Count: 9')).toBeInTheDocument();
  });

  test('Provider renders children and initializes store', () => {
    const spy = jest.spyOn(mock, 'initFn');
    const { StoreProvider } = createContext(mock.initFn);

    const TestComponent = () => <div>Test Child</div>;

    render(
      <StoreProvider initialState={{ initialCount: 0 }}>
        <TestComponent />
      </StoreProvider>
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();
    expect(spy).toHaveBeenCalledWith({ initialCount: 0 });
  });

  test('store accessor provides access to store hooks', () => {
    const { StoreProvider, store } = createContext(zustandUtilsCreateInitFn);

    const TestComponent = () => {
      const count = store().useCount();
      return <div>Count: {count}</div>;
    };

    render(
      <StoreProvider initialState={{ initialCount: 5 }}>
        <TestComponent />
      </StoreProvider>
    );

    expect(screen.getByText('Count: 5')).toBeInTheDocument();
  });

  test('throws error when store is accessed outside Provider', () => {
    const { store } = createContext(zustandUtilsCreateInitFn);

    const TestComponent = () => {
      const count = store().useCount();
      return <div>Count: {count}</div>;
    };

    expect(() => render(<TestComponent />)).toThrow(
      'Context store must be used within the context provider'
    );
  });
});
