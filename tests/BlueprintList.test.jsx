import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BlueprintList from '../src/components/BlueprintList.jsx'

const items = [
  {
    author: 'JohnConnor',
    name: 'house',
    points: [
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ],
  },
  { author: 'JohnConnor', name: 'garage', points: [{ x: 1, y: 1 }] },
]

describe('BlueprintList', () => {
  it('muestra una tabla con nombre, número de puntos y botón Open', () => {
    render(<BlueprintList items={items} onOpen={() => {}} />)
    expect(screen.getByText('Blueprint name')).toBeInTheDocument()
    expect(screen.getByText('Number of points')).toBeInTheDocument()
    expect(screen.getByText('house')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Open' })).toHaveLength(2)
  })

  it('llama onOpen con el plano al hacer click en Open', () => {
    const onOpen = vi.fn()
    render(<BlueprintList items={items} onOpen={onOpen} />)
    fireEvent.click(screen.getAllByRole('button', { name: 'Open' })[1])
    expect(onOpen).toHaveBeenCalledWith(items[1])
  })
})
