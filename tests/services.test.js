import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import api from '../src/services/apiClient.js'
import apimock from '../src/services/apimock.js'
import blueprintsApiClient from '../src/services/blueprintsApiClient.js'

const methods = ['getAll', 'getByAuthor', 'getByAuthorAndName', 'create', 'update', 'remove']

describe('apimock y apiclient', () => {
  it('tienen la misma interfaz', () => {
    for (const m of methods) {
      expect(typeof apimock[m]).toBe('function')
      expect(typeof blueprintsApiClient[m]).toBe('function')
    }
  })
})

describe('apimock', () => {
  it('devuelve los planos de un autor desde memoria', async () => {
    const items = await apimock.getByAuthor('JohnConnor')
    expect(items.map((bp) => bp.name)).toEqual(['house', 'garage', 'bridge'])
  })

  it('devuelve un plano por autor y nombre', async () => {
    const bp = await apimock.getByAuthorAndName('SarahConnor', 'tower')
    expect(bp.points).toHaveLength(4)
  })

  it('crea un plano y no permite repetirlo', async () => {
    const nuevo = { author: 'Test', name: 'nuevo', points: [{ x: 1, y: 2 }] }
    await apimock.create(nuevo)
    expect(await apimock.getByAuthor('Test')).toEqual([nuevo])
    await expect(apimock.create(nuevo)).rejects.toThrow('Ya existe')
  })

  it('falla si el autor no existe', async () => {
    await expect(apimock.getByAuthor('Nadie')).rejects.toThrow('No hay planos')
  })

  it('actualiza los puntos de un plano', async () => {
    const points = [{ x: 5, y: 5 }]
    await apimock.update('JohnConnor', 'garage', { author: 'JohnConnor', name: 'garage', points })
    expect((await apimock.getByAuthorAndName('JohnConnor', 'garage')).points).toEqual(points)
  })

  it('borra un plano', async () => {
    await apimock.remove('SarahConnor', 'tower')
    await expect(apimock.getByAuthorAndName('SarahConnor', 'tower')).rejects.toThrow('No existe')
  })

  it('con VITE_MOCK_FAIL_WRITES=true editar y borrar fallan', async () => {
    vi.stubEnv('VITE_MOCK_FAIL_WRITES', 'true')
    await expect(apimock.remove('JohnConnor', 'house')).rejects.toThrow('No se pudo borrar')
    vi.unstubAllEnvs()
  })
})

describe('apiclient', () => {
  beforeEach(() => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: 'ok' })
    vi.spyOn(api, 'post').mockResolvedValue({ data: 'creado' })
    vi.spyOn(api, 'put').mockResolvedValue({ data: 'actualizado' })
    vi.spyOn(api, 'delete').mockResolvedValue({ data: 'borrado' })
  })
  afterEach(() => vi.restoreAllMocks())

  it('llama a los endpoints REST correctos', async () => {
    await blueprintsApiClient.getAll()
    expect(api.get).toHaveBeenLastCalledWith('/blueprints')

    await blueprintsApiClient.getByAuthor('John Connor')
    expect(api.get).toHaveBeenLastCalledWith('/blueprints/John%20Connor')

    expect(await blueprintsApiClient.getByAuthorAndName('JohnConnor', 'house')).toBe('ok')
    expect(api.get).toHaveBeenLastCalledWith('/blueprints/JohnConnor/house')

    const bp = { author: 'A', name: 'b', points: [] }
    expect(await blueprintsApiClient.create(bp)).toBe('creado')
    expect(api.post).toHaveBeenCalledWith('/blueprints', bp)

    expect(await blueprintsApiClient.update('A', 'b', bp)).toBe('actualizado')
    expect(api.put).toHaveBeenCalledWith('/blueprints/A/b', bp)

    expect(await blueprintsApiClient.remove('A', 'b')).toBe('borrado')
    expect(api.delete).toHaveBeenCalledWith('/blueprints/A/b')
  })
})

describe('blueprintsService', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('usa apimock cuando VITE_USE_MOCK=true', async () => {
    vi.stubEnv('VITE_USE_MOCK', 'true')
    vi.resetModules()
    const service = (await import('../src/services/blueprintsService.js')).default
    const mock = (await import('../src/services/apimock.js')).default
    expect(service).toBe(mock)
  })

  it('usa apiclient cuando VITE_USE_MOCK=false', async () => {
    vi.stubEnv('VITE_USE_MOCK', 'false')
    vi.resetModules()
    const service = (await import('../src/services/blueprintsService.js')).default
    const client = (await import('../src/services/blueprintsApiClient.js')).default
    expect(service).toBe(client)
  })
})
