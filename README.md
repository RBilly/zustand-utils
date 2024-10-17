# zustand-utils

### Table of contents
- **[Setup](#setup)** 
- **[Get Started](#get-started)** 
- **[Docs](#docs)** 
  - **[createHooks](#createHooks)** 
  - **[create](#create)** 
  - **[createContext](#createcontext)**

## Setup

Install the dependencies:

```bash
pnpm install
```

## Get Started

Build the library:

```bash
pnpm build
```

Test the library:

```bash
pnpm test
```

## Docs

Zustand-utils is a helper lib that provides functions to simplify usage of zustand and enforce good practices.

### createHooks
createHooks is a function that takes a zustand store and generate hooks to manipulate the store.

There is one small caveat to be aware of:  
All stores will export by default a useActions hooks and to prevent confusion, consider name aliasing the hooks to something more specific.
```tsx
import { create } from 'zustand'
import { generateHooks } from 'zustand-utils'

type CountStore = {
  count: number
  actions: {
    inc: () => void
    dec: () => void
    add: (by: number) => void
  }
}

const store = create<CountStore>()((set) => ({
  count: 1,
  actions: {
    inc: () => set((state) => ({ count: state.count + 1 })),
    dec: () => set((state) => ({ count: state.count - 1 })),
    add: (by) => set((state) => ({ count: state.count + by }))
  }
}))

export const {
  useCount,
  useActions: useCountActions // renamed to prevent confusion in case some components uses multiple stores
} = createHooks(store)

// ...

import { useCount, useCountActions } from './countStore'

function Counter() {
  const count = useCount()
  const { inc, dec } = useCountActions()
  return (
    <div>
    <button onClick={dec}>one down</button>
    <span>{count}</span>
    <button onClick={inc}>one up</button>
    </div>
  )
}
```

### create

The create function provided by zustand-utils will provide an alternative way to create a Zustand store. It removes boilerplate, has typescript support and even uses type inference so no need to declare a type for the store, and it provides more flexibility and an easy way to define derived state functionality.

Most of all, It provides a more idiomatic way to write actions function which enforces good practices.

Here is what the previous example would look like:

```tsx
import { create } from 'zustand-utils'

export const {
  useCount,
  useActions: useCountActions,
} = create({ // initial state
  count: 1,
}).actions((set, get) => ({ // actions builder with set and get functions to access store values
  inc: () => set.count(get.count() + 1),
  dec: () => set.count(get.count() - 1),
  add: (by: number) => set.count(get.count() + by),
})).use // retrieve hooks to be exported for component usage

// ...

import { useCount, useCountActions } from './countStore'

function Counter() {
  const count = useCount()
  const { inc, dec } = useCountActions()
  return (
    <div>
     <button onClick={dec}>one down</button>
     <span>{count}</span>
      <button onClick={inc}>one up</button>
    </div>
  )
}
```

Here is what the most minimal store definition would look like with this wrapper:

```ts
import { create } from 'zustand-utils'

export const { useValue, useActions } = create({ value: "Hi" }).use
```

The actions builder is optional, even without it, the function will generate setters to directly update the values. In above exemple, the useActions hooks will provide the function setValue: `(string) => void` to update `value`.

The wrapper also provides another optional builder. The selectors builder allows to define function to provide derived values from the store. A derived value will be automatically updated when the values it is derived from are updated.

```ts
import { create } from 'zustand-utils'

export const {
  useFirstName,
  useLastName,
  useFullName, // a hook is generated to directly use the derived value
  useActions   // no setter for derived values as they are only an effect of the store but not part of its state.
} = create({
  firstName: "John",
  lastName: "Smith"
}).selectors((get) => ({ //selectors builder only provide the get function to access the store values
  fullName: () => `${get.firstName()} ${get.lastName()}`
})).use
```

Of course both selectors and actions builder can be chain called to be used together and the order does not matter.

It is possible to override a state element with a selector.

```ts
export const {
  useText, // useText hook will retrieve the value returned by the text selector not the state element
  useActions
} = create({
  text: "some text", // state element
}).selectors((get) => ({
  text: () => capitalize(get.text()) // selector with same name will override state element
})).use
```

As you can see above, there is a state element named "text" and a selector named "text" as well. Doing that, allows to override the behavior of the state element.

Here, using the "useText" hooks will return the capitalized text.

**You should avoid overriding state element or use it very carefully as it can have unexpected behaviors in some cases, for exemple if the return type of the selector is different from the type of the state element.**


### createContext
The zustand-utils library will provide a `createContext` function that needs to be used instead of the React `createContext` function.

The `createContext` function provided by zustand-utils will return the `StoreProvider` and a `store` function used to access the hooks required to manipulate the store. It can only be used inside the `StoreProvider` component.

It is meant to simplify the usage of the Zustand + React context pattern.

The `createContext`  function takes either a store created using the `create` function from zustand-utils or a store created using the `createStore` function from zustand (**`createStore` not `create`**).

With the `createStore` from zustand:
```tsx
/*
* Using createStore from Zustand
*/
import { createStore } from 'zustand'
import { createContext } from 'zustand-utils'

type FishStoreValues = {
  fish: number
}

type FishStore = FishStoreValues & {
  actions: {
    addFish: (by: number) => void
  }
}

const initializeFishStore = (initFishStore: FishStoreValues) => createStore<FishStore>((set) => ({
  ...initFishStore,
  actions: {
    addFish: (by: number) => set((state: FishStoreValues) => ({ fish: state.fish + by }))
  }
}));

export const {
  StoreProvider: FishProvider,
  store: fishStore
} = createContext(initializeFishStore);

// ....

import { FishProvider, fishStore } from 'fishStore'

const FishCount = () => {
  const { useFish, useActions } = fishStore();
  const fish = useFish();
  const { addFish } = useActions();
  return (
    <div>
      <span>{fish}</span>
      <button type="button" onClick={() => addFish(1)}>Add Fish</button>
    </div>
  )
}

export const FishTest = () => (
  <FishProvider initValue={{fish: 12}}>
    <FishCount/>
  </FishProvider>
)
```

With the zustand-utils `create` method:
```tsx
/*
* Using create from zustand-utils
*/
import { create, createContext } from 'zustand-utils'

const initializeBearStore = (initBearStore: {bear: number}) => create({
  ...initBearStore
}).actions((set, get) => ({
  addBear: (by: number) => set.bear(get.bear() + by),
})).selectors((get) => ({
  doubleBear: () => get.bear() * 2
}));

export const {
  StoreProvider: BearProvider,
  store: bearStore
} = createContext(initializeBearStore);

// ...

import { BearProvider, bearStore } from 'bearStore'

const BearCount = () => {
  const { useBear, useDoubleBear, useActions } = bearStore();
  const bear = useBear();
  const doubleBear = useDoubleBear();
  const { addBear } = useActions();
  return (
    <div>
      <span>{bear} and double {doubleBear}</span>
      <button type="button" onClick={() => addBear(1)}>Add Bear</button>
    </div>
  )
}

export const BearTest = () => (
  <BearProvider initValue={{bear: 4}}>
    <BearCount/>
  </BearProvider>
)
```
Note that in those example, the `StoreProvider` needs an `initialState` prop to initialize the store. In some cases you may not want for the `StoreProvider` to set an initial state. In such cases, the store creation function passed to `createContext` only need to be of type `() => store` and the `StoreProvider` can be used without prop.
```tsx
export const {StoreProvider, store} = createContext(
  () => create({someValue: ""})
);

// ...

import { StoreProvider } from 'someStore'

export const RootComponent = () => (
  <StoreProvider>
    {/* ... */}
  </StoreProvider>
)
```

Additionally, while it requires a bit of manual work, we can simplify a bit the usage of the hooks for the consumers of the store by creating functions with the same name as the hooks that hides the context usage.

It is very useful when converting a global store to a context store because this way there is no change needed for consumers of the store.
```tsx
const {
  StoreProvider: BearProvider,
  store
} = createContext(initializeBearStore);

export {bearProvider}
export const useBear = () => store().useBear();
export const useDoubleBear = () => store().useDoubleBear();
export const useBearActions = () => store().useActions();

// ...

import { BearProvider, useBear, useDoubleBear, useBearActions } from 'bearStore'

const BearCount = () => {
  const bear = useBear();
  const doubleBear = useDoubleBear();
  const { addBear } = useBearActions();
  return (
    <div>
      <span>{bear} and double {doubleBear}</span>
      <button type="button" onClick={() => addBear(1)}>Add Bear</button>
    </div>
  )
}
```

**Using a simple Zustand store encapsulated in a React Context is a valid replacement to a raw React Context that could create performance issues when misused.**

# Credits

- Thanks to [zustand](https://github.com/pmndrs/zustand) for this amazing state management tool
- Thanks to [zustand-x](https://github.com/udecode/zustand-x) which was a heavy inspiration on how this tool was built
