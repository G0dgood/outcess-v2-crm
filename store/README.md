# Redux Toolkit (RTK) Setup

This directory contains the Redux Toolkit store configuration for the Outcess CRM application.

## Structure

```
store/
├── store.ts          # Main store configuration
├── hooks.ts          # Typed Redux hooks
├── slices/           # Redux slices (feature-based)
│   └── exampleSlice.ts
└── README.md         # This file
```

## Usage

### Creating a Slice

Create a new slice in `store/slices/`:

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MyState {
  // Your state shape
}

const initialState: MyState = {
  // Initial values
};

const mySlice = createSlice({
  name: 'myFeature',
  initialState,
  reducers: {
    // Your reducers here
    updateValue: (state, action: PayloadAction<string>) => {
      state.value = action.payload;
    },
  },
});

export const { updateValue } = mySlice.actions;
export default mySlice.reducer;
```

### Adding a Slice to the Store

1. Import the slice in `store/store.ts`:
```typescript
import mySlice from './slices/mySlice';
```

2. Add it to the reducer:
```typescript
export const store = configureStore({
  reducer: {
    myFeature: mySlice,
  },
});
```

### Using Redux in Components

```typescript
'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateValue } from '@/store/slices/mySlice';

export const MyComponent = () => {
  const dispatch = useAppDispatch();
  const value = useAppSelector((state) => state.myFeature.value);

  const handleUpdate = () => {
    dispatch(updateValue('New Value'));
  };

  return (
    <div>
      <p>Value: {value}</p>
      <button onClick={handleUpdate}>Update</button>
    </div>
  );
};
```

## Example Slices to Create

- `authSlice.ts` - Authentication state
- `dispositionSlice.ts` - Disposition management
- `customerSlice.ts` - Customer data
- `notificationSlice.ts` - Notifications
- `uiSlice.ts` - UI state (modals, sidebars, etc.)

## Best Practices

1. Keep slices focused on a single feature/domain
2. Use TypeScript for type safety
3. Use `PayloadAction<T>` for typed actions
4. Keep state normalized when possible
5. Use selectors for computed values

