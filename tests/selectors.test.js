import { describe, it, expect } from 'vitest'
import { selectAuthors, selectTop5ByPoints } from '../src/features/blueprints/selectors.js'

const bp = (author, name, n) => ({
  author,
  name,
  points: Array.from({ length: n }, (_, i) => ({ x: i, y: i })),
})
const all = [
  bp('A', 'uno', 2),
  bp('B', 'dos', 7),
  bp('A', 'tres', 4),
  bp('C', 'cuatro', 9),
  bp('B', 'cinco', 1),
  bp('C', 'seis', 5),
]
const state = { blueprints: { all } }

describe('selectores', () => {
  it('selectTop5ByPoints devuelve los 5 planos con más puntos, de mayor a menor', () => {
    expect(selectTop5ByPoints(state).map((b) => b.name)).toEqual([
      'cuatro',
      'dos',
      'seis',
      'tres',
      'uno',
    ])
  })

  it('no modifica la lista original', () => {
    selectTop5ByPoints({ blueprints: { all: [...all] } })
    expect(all[0].name).toBe('uno')
  })

  it('está memorizado: con la misma lista devuelve el mismo resultado sin recalcular', () => {
    const first = selectTop5ByPoints(state)
    expect(selectTop5ByPoints({ blueprints: { all } })).toBe(first)
    expect(selectTop5ByPoints({ blueprints: { all: [...all] } })).not.toBe(first)
  })

  it('selectAuthors devuelve los autores sin repetir y ordenados', () => {
    expect(selectAuthors(state)).toEqual(['A', 'B', 'C'])
  })
})
