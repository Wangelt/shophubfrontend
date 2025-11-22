import { configureStore } from '@reduxjs/toolkit'
import exampleReducer from './exampleslice'
import authReducer from './authSlice'
import cartReducer from './cartSlice'

const store = configureStore({
  reducer: {
    example: exampleReducer,
    auth: authReducer,
    cart: cartReducer,
    // add other reducers here
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [],
      },
    }),
})

export default store
