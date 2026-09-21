import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import reducer from '../src/features/blueprints/blueprintsSlice.js'
import BlueprintsPage from '../src/pages/BlueprintsPage.jsx'

// Usa los datos de prueba en memoria
vi.mock('../src/services/blueprintsService.js', async () => ({
  default: (await import('../src/services/apimock.js')).default,
}))

describe('Abrir un plano', () => {
  it('al dar Open muestra el nombre del plano en el campo de texto', async () => {
    const store = configureStore({ reducer: { blueprints: reducer } })
    render(
      <Provider store={store}>
        <MemoryRouter>
          <BlueprintsPage />
        </MemoryRouter>
      </Provider>,
    )

    // espera a que cargue el top 5 para que no actualice la página en medio de la prueba
    await screen.findByText('6 pts')

    fireEvent.change(screen.getByPlaceholderText(/Author/i), { target: { value: 'JohnConnor' } })
    fireEvent.click(screen.getByText(/Get blueprints/i))
    const houseRow = (await screen.findByRole('cell', { name: 'house' })).closest('tr')

    fireEvent.click(within(houseRow).getByRole('button', { name: 'Open' }))

    const field = screen.getByLabelText('Current blueprint')
    await waitFor(() => expect(field).toHaveValue('JohnConnor / house'))
    expect(store.getState().blueprints.current.points).toHaveLength(6)
  })
})
