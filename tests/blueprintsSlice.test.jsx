import { describe, it, expect } from 'vitest'
import reducer, {
  blueprintRemoved,
  blueprintReplaced,
  blueprintsRestored,
  createBlueprint,
  deleteBlueprint,
  fetchAll,
  fetchBlueprint,
  fetchByAuthor,
  updateBlueprint,
} from '../src/features/blueprints/blueprintsSlice.js'

const house = { author: 'JohnConnor', name: 'house', points: [{ x: 1, y: 1 }] }
const garage = { author: 'JohnConnor', name: 'garage', points: [] }
const initial = () => reducer(undefined, { type: '@@INIT' })
const loaded = () => ({
  ...initial(),
  all: [house, garage],
  byAuthor: { JohnConnor: [house, garage] },
  current: house,
})

describe('blueprints slice', () => {
  it('should initialize correctly', () => {
    const state = initial()
    expect(state.all).toEqual([])
    expect(state.current).toBeNull()
  })

  it('guarda los planos del autor cuando fetchByAuthor termina bien', () => {
    const items = [house]
    let state = reducer(undefined, fetchByAuthor.pending('', 'JohnConnor'))
    expect(state.status).toBe('loading')
    state = reducer(
      state,
      fetchByAuthor.fulfilled({ author: 'JohnConnor', items }, '', 'JohnConnor'),
    )
    expect(state.status).toBe('succeeded')
    expect(state.byAuthor.JohnConnor).toEqual(items)
  })

  it('guarda el error cuando fetchByAuthor falla', () => {
    const state = reducer(
      undefined,
      fetchByAuthor.rejected(new Error('No hay planos'), '', 'Nadie'),
    )
    expect(state.status).toBe('failed')
    expect(state.error).toBe('No hay planos')
  })

  it('cada thunk tiene su propio estado de carga y error', () => {
    let state = reducer(undefined, fetchAll.pending(''))
    expect(state.allStatus).toBe('loading')
    state = reducer(state, fetchBlueprint.rejected(new Error('falló'), '', house))
    expect(state.currentStatus).toBe('failed')
    expect(state.currentError).toBe('falló')
    // la lista general sigue cargando, no se mezcla con el error del plano
    expect(state.allStatus).toBe('loading')
    state = reducer(state, fetchAll.fulfilled([house], ''))
    expect(state.allStatus).toBe('succeeded')
    expect(state.all).toEqual([house])
  })

  it('fetchBlueprint recuerda qué plano se pidió para poder reintentar', () => {
    const arg = { author: 'JohnConnor', name: 'house' }
    const state = reducer(undefined, fetchBlueprint.pending('', arg))
    expect(state.currentRequest).toEqual(arg)
  })

  it('createBlueprint agrega el plano a la lista general y a la del autor', () => {
    const nuevo = { author: 'JohnConnor', name: 'nuevo', points: [] }
    const state = reducer(loaded(), createBlueprint.fulfilled(nuevo, '', nuevo))
    expect(state.all).toContainEqual(nuevo)
    expect(state.byAuthor.JohnConnor).toContainEqual(nuevo)
    expect(state.current).toEqual(nuevo)
    expect(state.saveStatus).toBe('succeeded')
  })

  it('blueprintReplaced cambia el plano en todas las listas', () => {
    const edited = { ...house, points: [{ x: 9, y: 9 }] }
    const state = reducer(loaded(), blueprintReplaced(edited))
    expect(state.all[0]).toEqual(edited)
    expect(state.byAuthor.JohnConnor[0]).toEqual(edited)
    expect(state.current).toEqual(edited)
  })

  it('blueprintRemoved quita el plano de todas las listas', () => {
    const state = reducer(loaded(), blueprintRemoved(house))
    expect(state.all).toEqual([garage])
    expect(state.byAuthor.JohnConnor).toEqual([garage])
    expect(state.current).toBeNull()
  })

  it('blueprintsRestored deja todo como estaba antes de borrar', () => {
    const before = loaded()
    const snapshot = {
      author: 'JohnConnor',
      all: before.all,
      items: before.byAuthor.JohnConnor,
      current: before.current,
    }
    let state = reducer(before, blueprintRemoved(house))
    state = reducer(state, blueprintsRestored(snapshot))
    expect(state.all).toEqual(before.all)
    expect(state.byAuthor.JohnConnor).toEqual(before.byAuthor.JohnConnor)
    expect(state.current).toEqual(house)
  })

  it('guarda los errores de editar y borrar', () => {
    let state = reducer(loaded(), updateBlueprint.rejected(new Error('Sin conexión'), '', house))
    expect(state.saveStatus).toBe('failed')
    expect(state.saveError).toContain('Sin conexión')
    state = reducer(state, deleteBlueprint.rejected(new Error('Sin conexión'), '', house))
    expect(state.deleteError).toContain('Sin conexión')
  })
})
