import { createSlice } from '@reduxjs/toolkit'

// Helper function to check if token exists in localStorage
// Safe for SSR - returns false on server
const hasToken = () => {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('accessToken')
}

// Always start with false to prevent hydration mismatch
// Authentication state will be checked on client mount
const initialState = {
  isAuthenticated: false,
  user: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoggedIn(state) {
      state.isAuthenticated = true
    },
    setLoggedOut(state) {
      state.isAuthenticated = false
      state.user = null
    },
    refreshAuthFromStorage(state) {
      state.isAuthenticated = hasToken()
    },
    setUser(state, action) {
      state.user = action.payload
    }
  },
})

export const { setLoggedIn, setLoggedOut, refreshAuthFromStorage, setUser } = authSlice.actions

export default authSlice.reducer


