import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import authReducer from '../src/features/auth/authSlice.js'
import PrivateRoute from '../src/components/PrivateRoute.jsx'
import LoginPage from '../src/pages/LoginPage.jsx'

vi.mock('../src/services/authService.js', () => ({
  default: {
    login: vi.fn(async (u, p) => {
      if (u === 'admin' && p === 'admin') return { token: 'abc' }
      throw new Error('Usuario o contraseña incorrectos')
    }),
  },
}))

const renderAt = (path, token = null) => {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: { token, status: 'idle', error: null } },
  })
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/blueprints/new"
            element={
              <PrivateRoute>
                <p>Editor protegido</p>
              </PrivateRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </Provider>,
  )
  return store
}

describe('PrivateRoute', () => {
  it('sin sesión manda al login', () => {
    renderAt('/blueprints/new')
    expect(screen.queryByText('Editor protegido')).not.toBeInTheDocument()
    expect(screen.getByText('Inicia sesión para continuar.')).toBeInTheDocument()
  })

  it('con sesión deja entrar', () => {
    renderAt('/blueprints/new', 'abc')
    expect(screen.getByText('Editor protegido')).toBeInTheDocument()
  })

  it('después de iniciar sesión vuelve a la página protegida', async () => {
    const store = renderAt('/blueprints/new')
    fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: 'admin' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'admin' } })
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByText('Editor protegido')).toBeInTheDocument()
    expect(store.getState().auth.token).toBe('abc')
  })

  it('con datos incorrectos muestra el error y no deja entrar', async () => {
    renderAt('/blueprints/new')
    fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: 'otro' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'mal' } })
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByText('Usuario o contraseña incorrectos')).toBeInTheDocument()
    expect(screen.queryByText('Editor protegido')).not.toBeInTheDocument()
  })
})
