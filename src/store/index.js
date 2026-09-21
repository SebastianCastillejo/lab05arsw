import { configureStore } from '@reduxjs/toolkit'
import blueprintsReducer from '../features/blueprints/blueprintsSlice.js'
import authReducer, { logout } from '../features/auth/authSlice.js'

const store = configureStore({
  reducer: {
    blueprints: blueprintsReducer,
    auth: authReducer,
  },
})

// Guarda el token en localStorage para que el interceptor de Axios lo envíe
let lastToken = store.getState().auth.token
store.subscribe(() => {
  const { token } = store.getState().auth
  if (token === lastToken) return
  lastToken = token
  try {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  } catch {
    // sin localStorage la sesión solo dura mientras la página esté abierta
  }
})

// El interceptor avisa cuando el backend responde 401
window.addEventListener('auth:expired', () => store.dispatch(logout()))

export default store
