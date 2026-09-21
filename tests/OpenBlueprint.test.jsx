import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
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
        <BlueprintsPage />
      </Provider>,
    )

    fireEvent.change(screen.getByPlaceholderText(/Author/i), { target: { value: 'JohnConnor' } })
    fireEvent.click(screen.getByText(/Get blueprints/i))
    const openButtons = await screen.findAllByRole('button', { name: 'Open' })

    fireEvent.click(openButtons[0])

    const field = screen.getByLabelText('Current blueprint')
    await vi.waitFor(() => expect(field).toHaveValue('JohnConnor / house'))
    expect(store.getState().blueprints.current.points).toHaveLength(6)
  })
})
