import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import authService from '../../services/authService.js'

const readToken = () => {
  try {
    return localStorage.getItem('token')
  } catch {
    return null
  }
}

export const login = createAsyncThunk('auth/login', async ({ username, password }) => {
  const { token } = await authService.login(username, password)
  return token
})

const slice = createSlice({
  name: 'auth',
  initialState: { token: readToken(), status: 'idle', error: null },
  reducers: {
    logout: (s) => {
      s.token = null
      s.status = 'idle'
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (s) => {
        s.status = 'loading'
        s.error = null
      })
      .addCase(login.fulfilled, (s, a) => {
        s.status = 'succeeded'
        s.token = a.payload
      })
      .addCase(login.rejected, (s, a) => {
        s.status = 'failed'
        s.error = a.error.message
      })
  },
})

export const { logout } = slice.actions
export const selectIsAuthenticated = (s) => Boolean(s.auth?.token)

export default slice.reducer
