import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import {
  createBlueprint,
  fetchBlueprint,
  saveStatusReset,
  updateBlueprint,
} from '../features/blueprints/blueprintsSlice.js'
import BlueprintCanvas from '../components/BlueprintCanvas.jsx'
import ErrorBanner from '../components/ErrorBanner.jsx'

// Crear un plano nuevo (/blueprints/new) o editar uno existente (/blueprints/:author/:name/edit)
export default function BlueprintEditorPage() {
  const params = useParams()
  const isEdit = Boolean(params.author && params.name)
  const dispatch = useDispatch()
  const { current, currentStatus, currentError, saveStatus, saveError } = useSelector(
    (s) => s.blueprints,
  )

  const [author, setAuthor] = useState(params.author ?? '')
  const [name, setName] = useState(params.name ?? '')
  const [points, setPoints] = useState([])
  const [formError, setFormError] = useState(null)

  const loaded = isEdit && current?.author === params.author && current?.name === params.name

  useEffect(() => {
    dispatch(saveStatusReset())
  }, [dispatch])

  // Al editar, trae el plano si no es el que ya está abierto
  useEffect(() => {
    if (isEdit && !loaded) dispatch(fetchBlueprint({ author: params.author, name: params.name }))
  }, [isEdit, loaded, params.author, params.name, dispatch])

  // Cuando llega el plano, sus puntos pasan al borrador
  useEffect(() => {
    if (loaded) setPoints(current.points ?? [])
    // solo cuando cambia el plano cargado, no en cada guardado
  }, [loaded])

  const addPoint = (p) => {
    setPoints((prev) => [...prev, p])
    if (saveStatus !== 'idle') dispatch(saveStatusReset())
  }

  const save = (e) => {
    e.preventDefault()
    if (!author.trim() || !name.trim())
      return setFormError('Escribe el autor y el nombre del plano')
    if (!points.length) return setFormError('Haz clic en el lienzo para agregar al menos un punto')
    setFormError(null)
    const bp = { author: author.trim(), name: name.trim(), points }
    dispatch(isEdit ? updateBlueprint(bp) : createBlueprint(bp))
  }

  if (isEdit && currentStatus === 'failed' && !loaded) {
    return (
      <div className="card">
        <ErrorBanner
          message={currentError}
          onRetry={() => dispatch(fetchBlueprint({ author: params.author, name: params.name }))}
        />
      </div>
    )
  }

  return (
    <form className="card" onSubmit={save}>
      <div className="card-header">
        <h2 style={{ margin: 0 }}>{isEdit ? `Editar plano ${params.name}` : 'Nuevo plano'}</h2>
        <Link className="btn" to="/">
          Volver
        </Link>
      </div>

      <div className="grid cols-2" style={{ marginBottom: 12 }}>
        <div>
          <label htmlFor="bp-author">Autor</label>
          <input
            id="bp-author"
            className="input"
            value={author}
            disabled={isEdit}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="bp-name">Nombre</label>
          <input
            id="bp-name"
            className="input"
            value={name}
            disabled={isEdit}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </div>

      {isEdit && !loaded ? (
        <p>Cargando plano...</p>
      ) : (
        <>
          <p style={{ marginTop: 0 }}>
            Haz clic en el lienzo para agregar puntos. Puntos: {points.length}
          </p>
          <BlueprintCanvas id="blueprint-editor" points={points} onPointAdd={addPoint} />
        </>
      )}

      {formError && <p className="error">{formError}</p>}
      {saveStatus === 'failed' && <ErrorBanner message={saveError} />}
      {saveStatus === 'succeeded' && <p className="success">Plano guardado.</p>}

      <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        <button
          type="button"
          className="btn"
          disabled={!points.length}
          onClick={() => setPoints((prev) => prev.slice(0, -1))}
        >
          Deshacer
        </button>
        <button
          type="button"
          className="btn"
          disabled={!points.length}
          onClick={() => setPoints([])}
        >
          Limpiar
        </button>
        <button type="submit" className="btn primary" disabled={saveStatus === 'loading'}>
          {saveStatus === 'loading' ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}
