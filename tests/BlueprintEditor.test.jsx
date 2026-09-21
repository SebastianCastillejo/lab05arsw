import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import blueprintsService from '../src/services/blueprintsService.js'
import reducer from '../src/features/blueprints/blueprintsSlice.js'
import BlueprintEditorPage from '../src/pages/BlueprintEditorPage.jsx'

vi.mock('../src/services/blueprintsService.js', () => ({
  default: {
    create: vi.fn(async (bp) => bp),
    update: vi.fn(async (a, n, bp) => bp),
    getByAuthorAndName: vi.fn(async (author, name) => ({
      author,
      name,
      points: [{ x: 10, y: 10 }],
    })),
  },
}))

const renderEditor = (path) => {
  const store = configureStore({ reducer: { blueprints: reducer } })
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/blueprints/new" element={<BlueprintEditorPage />} />
          <Route path="/blueprints/:author/:name/edit" element={<BlueprintEditorPage />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  )
  return store
}

// En jsdom el canvas no tiene tamaño, se simula uno de 520x360 en pantalla
const clickCanvas = (canvas, x, y) => {
  canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 520, height: 360 })
  fireEvent.click(canvas, { clientX: x, clientY: y })
}

describe('Editor de planos', () => {
  beforeEach(() => vi.clearAllMocks())

  it('cada clic en el lienzo agrega un punto', () => {
    renderEditor('/blueprints/new')
    const canvas = document.querySelector('#blueprint-editor')

    clickCanvas(canvas, 100, 50)
    clickCanvas(canvas, 200, 150)
    expect(screen.getByText(/Puntos: 2/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Deshacer' }))
    expect(screen.getByText(/Puntos: 1/)).toBeInTheDocument()
  })

  it('Guardar envía el plano con los puntos dibujados', async () => {
    renderEditor('/blueprints/new')
    fireEvent.change(screen.getByLabelText('Autor'), { target: { value: 'Ana' } })
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'casa' } })
    const canvas = document.querySelector('#blueprint-editor')
    clickCanvas(canvas, 100, 50)
    clickCanvas(canvas, 200, 150)

    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByText('Plano guardado.')).toBeInTheDocument()
    expect(blueprintsService.create).toHaveBeenCalledWith({
      author: 'Ana',
      name: 'casa',
      points: [
        { x: 100, y: 50 },
        { x: 200, y: 150 },
      ],
    })
  })

  it('no deja guardar sin puntos', () => {
    renderEditor('/blueprints/new')
    fireEvent.change(screen.getByLabelText('Autor'), { target: { value: 'Ana' } })
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'casa' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(screen.getByText(/al menos un punto/)).toBeInTheDocument()
    expect(blueprintsService.create).not.toHaveBeenCalled()
  })

  it('al editar carga los puntos del plano y guarda con update', async () => {
    renderEditor('/blueprints/JohnConnor/house/edit')
    expect(await screen.findByText(/Puntos: 1/)).toBeInTheDocument()

    clickCanvas(document.querySelector('#blueprint-editor'), 300, 200)
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByText('Plano guardado.')).toBeInTheDocument()
    expect(blueprintsService.update).toHaveBeenCalledWith('JohnConnor', 'house', {
      author: 'JohnConnor',
      name: 'house',
      points: [
        { x: 10, y: 10 },
        { x: 300, y: 200 },
      ],
    })
  })
})
