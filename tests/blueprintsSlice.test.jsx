import { describe, it, expect } from 'vitest'
import reducer, { fetchByAuthor } from '../src/features/blueprints/blueprintsSlice.js'

describe('blueprints slice', () => {
  it('should initialize correctly', () => {
    const state = reducer(undefined, { type: '@@INIT' })
    expect(state.authors).toEqual([])
  })

  it('guarda los planos del autor cuando fetchByAuthor termina bien', () => {
    const items = [{ author: 'JohnConnor', name: 'house', points: [] }]
    let state = reducer(undefined, fetchByAuthor.pending('', 'JohnConnor'))
    expect(state.status).toBe('loading')
    state = reducer(state, fetchByAuthor.fulfilled({ author: 'JohnConnor', items }, '', 'JohnConnor'))
    expect(state.status).toBe('succeeded')
    expect(state.byAuthor.JohnConnor).toEqual(items)
  })

  it('guarda el error cuando fetchByAuthor falla', () => {
    const state = reducer(undefined, fetchByAuthor.rejected(new Error('No hay planos'), '', 'Nadie'))
    expect(state.status).toBe('failed')
    expect(state.error).toBe('No hay planos')
  })
})
