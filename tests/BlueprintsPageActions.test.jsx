import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import blueprintsService from '../src/services/blueprintsService.js'
import blueprintsReducer from '../src/features/blueprints/blueprintsSlice.js'
import authReducer from '../src/features/auth/authSlice.js'
import BlueprintsPage from '../src/pages/BlueprintsPage.jsx'

vi.mock('../src/services/blueprintsService.js', () => ({
  default: {
    getAll: vi.fn(),
    getByAuthor: vi.fn(),
    getByAuthorAndName: vi.fn(),
    remove: vi.fn(),
  },
}))

const house = { author: 'JohnConnor', name: 'house', points: [{ x: 1, y: 1 }] }
const garage = { author: 'JohnConnor', name: 'garage', points: [] }

const renderPage = (token = null) => {
  const store = configureStore({
    reducer: { blueprints: blueprintsReducer, auth: authReducer },
    preloadedState: { auth: { token, status: 'idle', error: null } },
  })
  render(
    <Provider store={store}>
      <MemoryRouter>
        <BlueprintsPage />
      </MemoryRouter>
    </Provider>,
  )
  return store
}

const search = (author) => {
  fireEvent.change(screen.getByPlaceholderText('Author'), { target: { value: author } })
  fireEvent.click(screen.getByRole('button', { name: 'Get blueprints' }))
}

describe('BlueprintsPage: Reintentar, Top 5 y Delete', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    blueprintsService.getAll.mockResolvedValue([house, garage])
  })

  it('si la búsqueda falla muestra un banner y Reintentar vuelve a pedir los datos', async () => {
    blueprintsService.getByAuthor
      .mockRejectedValueOnce(new Error('Network Error'))
      .mockResolvedValueOnce([house, garage])
    renderPage()

    search('JohnConnor')
    expect(await screen.findByRole('alert')).toHaveTextContent('Network Error')

    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByRole('cell', { name: 'garage' })).toBeInTheDocument()
    expect(blueprintsService.getByAuthor).toHaveBeenCalledTimes(2)
  })

  it('muestra el top 5 con los planos cargados', async () => {
    renderPage()
    expect(await screen.findByText('Top 5 por cantidad de puntos')).toBeInTheDocument()
    expect(await screen.findByText('1 pts')).toBeInTheDocument()
  })

  it('sin sesión no aparece el botón Delete', async () => {
    blueprintsService.getByAuthor.mockResolvedValue([house, garage])
    renderPage()
    search('JohnConnor')
    await screen.findByRole('cell', { name: 'garage' })
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
  })

  it('con sesión, Delete quita el plano y lo devuelve si el servidor falla', async () => {
    blueprintsService.getByAuthor.mockResolvedValue([house, garage])
    blueprintsService.remove.mockRejectedValue(new Error('Sin conexión'))
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderPage('token')

    search('JohnConnor')
    await screen.findByRole('cell', { name: 'garage' })
    fireEvent.click(screen.getAllByRole('button', { name: 'Delete' })[1])

    expect(blueprintsService.remove).toHaveBeenCalledWith('JohnConnor', 'garage')
    expect(await screen.findByText(/El plano se restauró/)).toBeInTheDocument()
    await waitFor(() => expect(screen.getAllByRole('row')).toHaveLength(3))
  })
})
