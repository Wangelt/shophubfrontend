import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  cart: null,
  totalItems: 0,
  isLoading: false,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart(state, action) {
      // Ensure payload is valid before setting
      if (action.payload && typeof action.payload === 'object') {
        state.cart = action.payload
        // Calculate totalItems from payload or products array
        if (action.payload.totalItems !== undefined) {
          state.totalItems = Number(action.payload.totalItems) || 0
        } else if (Array.isArray(action.payload.products)) {
          state.totalItems = action.payload.products.reduce(
            (sum, item) => sum + (item.quantity || 0),
            0
          )
        } else {
          state.totalItems = 0
        }
      }
    },
    clearCart(state) {
      state.cart = null
      state.totalItems = 0
    },
    setLoading(state, action) {
      state.isLoading = action.payload
    },
    updateCartItemCount(state, action) {
      state.totalItems = action.payload || 0
    },
  },
})

export const { setCart, clearCart, setLoading, updateCartItemCount } = cartSlice.actions

export default cartSlice.reducer

