import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ErrorBanner from '../src/components/ErrorBanner.jsx'

describe('ErrorBanner', () => {
  it('muestra el mensaje y llama onRetry al dar Reintentar', () => {
    const onRetry = vi.fn()
    render(<ErrorBanner message="Network Error" onRetry={onRetry} />)

    expect(screen.getByRole('alert')).toHaveTextContent('Network Error')
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('no muestra Reintentar si no se pasa onRetry', () => {
    render(<ErrorBanner message="Algo falló" />)
    expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument()
  })
})
