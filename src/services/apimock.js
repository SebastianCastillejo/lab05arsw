// Datos de prueba en memoria (no requiere backend)
const data = [
  {
    author: 'JohnConnor',
    name: 'house',
    points: [
      { x: 140, y: 300 },
      { x: 140, y: 160 },
      { x: 260, y: 60 },
      { x: 380, y: 160 },
      { x: 380, y: 300 },
      { x: 140, y: 300 },
    ],
  },
  {
    author: 'JohnConnor',
    name: 'garage',
    points: [
      { x: 100, y: 280 },
      { x: 100, y: 140 },
      { x: 420, y: 140 },
      { x: 420, y: 280 },
    ],
  },
  {
    author: 'JohnConnor',
    name: 'bridge',
    points: [
      { x: 40, y: 260 },
      { x: 140, y: 160 },
      { x: 260, y: 120 },
      { x: 380, y: 160 },
      { x: 480, y: 260 },
    ],
  },
  {
    author: 'SarahConnor',
    name: 'bunker',
    points: [
      { x: 120, y: 280 },
      { x: 200, y: 120 },
      { x: 320, y: 120 },
      { x: 400, y: 280 },
      { x: 120, y: 280 },
    ],
  },
  {
    author: 'SarahConnor',
    name: 'tower',
    points: [
      { x: 240, y: 320 },
      { x: 240, y: 60 },
      { x: 280, y: 60 },
      { x: 280, y: 320 },
    ],
  },
]

// Simula la latencia de la red y devuelve copias para no exponer el arreglo interno
const delay = (value, ms = 300) =>
  new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), ms))

const notFound = (msg) => Promise.reject(new Error(msg))

// Con VITE_MOCK_FAIL_WRITES=true editar y borrar fallan, para ver cómo se revierte el cambio
const failWrite = (msg) =>
  new Promise((_, reject) => setTimeout(() => reject(new Error(msg)), 1000))
const shouldFailWrites = () => import.meta.env.VITE_MOCK_FAIL_WRITES === 'true'

const indexOf = (author, name) => data.findIndex((b) => b.author === author && b.name === name)

const apimock = {
  getAll: () => delay(data),

  getByAuthor: (author) => {
    const items = data.filter((bp) => bp.author === author)
    return items.length ? delay(items) : notFound(`No hay planos para el autor "${author}"`)
  },

  getByAuthorAndName: (author, name) => {
    const bp = data.find((b) => b.author === author && b.name === name)
    return bp ? delay(bp) : notFound(`No existe el plano "${name}" de "${author}"`)
  },

  create: (blueprint) => {
    const exists = data.some((b) => b.author === blueprint.author && b.name === blueprint.name)
    if (exists) {
      return Promise.reject(
        new Error(`Ya existe el plano "${blueprint.name}" de "${blueprint.author}"`),
      )
    }
    const bp = structuredClone(blueprint)
    data.push(bp)
    return delay(bp)
  },

  update: (author, name, blueprint) => {
    if (shouldFailWrites()) return failWrite(`No se pudo actualizar el plano "${name}"`)
    const i = indexOf(author, name)
    if (i === -1) return notFound(`No existe el plano "${name}" de "${author}"`)
    data[i] = { author, name, points: structuredClone(blueprint.points) }
    return delay(data[i])
  },

  remove: (author, name) => {
    if (shouldFailWrites()) return failWrite(`No se pudo borrar el plano "${name}"`)
    const i = indexOf(author, name)
    if (i === -1) return notFound(`No existe el plano "${name}" de "${author}"`)
    data.splice(i, 1)
    return delay({ author, name })
  },
}

export default apimock
