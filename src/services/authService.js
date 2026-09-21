import api from './apiClient.js'

// Login de prueba: usuario admin / contraseña admin
const authMock = {
  login: (username, password) =>
    new Promise((resolve, reject) =>
      setTimeout(() => {
        if (username === 'admin' && password === 'admin') resolve({ token: 'mock-token' })
        else reject(new Error('Usuario o contraseña incorrectos'))
      }, 300),
    ),
}

const authApi = {
  login: async (username, password) => {
    try {
      return (await api.post('/auth/login', { username, password })).data
    } catch {
      throw new Error('Credenciales inválidas o servidor no disponible')
    }
  },
}

const authService = import.meta.env.VITE_USE_MOCK === 'true' ? authMock : authApi

export default authService
