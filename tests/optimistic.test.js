import { describe, it, expect, vi, beforeEach } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import blueprintsService from '../src/services/blueprintsService.js'
import reducer, {
  deleteBlueprint,
  updateBlueprint,
} from '../src/features/blueprints/blueprintsSlice.js'

vi.mock('../src/services/blueprintsService.js', () => ({
  default: { update: vi.fn(), remove: vi.fn() },
}))

const house = { author: 'JohnConnor', name: 'house', points: [{ x: 1, y: 1 }] }
const garage = { author: 'JohnConnor', name: 'garage', points: [] }

const makeStore = () => {
  const base = reducer(undefined, { type: '@@INIT' })
  return configureStore({
    reducer: { blueprints: reducer },
    preloadedState: {
      blueprints: {
        ...base,
        all: [house, garage],
        byAuthor: { JohnConnor: [house, garage] },
        current: house,
      },
    },
  })
}

// Promesa que la prueba resuelve cuando quiere, para ver el estado "mientras tanto"
const deferred = () => {
  let resolve
  const promise = new Promise((res) => {
    resolve = res
  })
  return { promise, resolve }
}

describe('optimistic updates', () => {
  beforeEach(() => vi.clearAllMocks())

  it('borrar: el plano desaparece antes de que responda el servidor', async () => {
    const d = deferred()
    blueprintsService.remove.mockReturnValue(d.promise)
    const store = makeStore()

    const done = store.dispatch(deleteBlueprint(house))
    expect(store.getState().blueprints.all).toEqual([garage])

    d.resolve({})
    await done
    expect(store.getState().blueprints.all).toEqual([garage])
    expect(store.getState().blueprints.deleteError).toBeNull()
  })

  it('borrar: si el servidor falla el plano vuelve y se muestra el error', async () => {
    blueprintsService.remove.mockRejectedValue(new Error('Sin conexión'))
    const store = makeStore()

    await store.dispatch(deleteBlueprint(house))
    const s = store.getState().blueprints
    expect(s.all).toEqual([house, garage])
    expect(s.byAuthor.JohnConnor).toEqual([house, garage])
    expect(s.current).toEqual(house)
    expect(s.deleteError).toContain('Sin conexión')
  })

  it('editar: el cambio se ve de inmediato', async () => {
    const d = deferred()
    blueprintsService.update.mockReturnValue(d.promise)
    const store = makeStore()
    const edited = { ...house, points: [{ x: 9, y: 9 }] }

    const done = store.dispatch(updateBlueprint(edited))
    expect(store.getState().blueprints.current).toEqual(edited)

    d.resolve(edited)
    await done
    expect(store.getState().blueprints.saveStatus).toBe('succeeded')
  })

  it('editar: si el servidor falla vuelve la versión anterior', async () => {
    blueprintsService.update.mockRejectedValue(new Error('Sin conexión'))
    const store = makeStore()

    await store.dispatch(updateBlueprint({ ...house, points: [] }))
    const s = store.getState().blueprints
    expect(s.current).toEqual(house)
    expect(s.all[0]).toEqual(house)
    expect(s.saveStatus).toBe('failed')
  })
})
