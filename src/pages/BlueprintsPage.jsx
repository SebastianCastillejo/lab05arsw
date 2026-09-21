import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  deleteBlueprint,
  deleteErrorCleared,
  fetchAll,
  fetchByAuthor,
  fetchBlueprint,
} from '../features/blueprints/blueprintsSlice.js'
import { selectAuthors, selectTop5ByPoints } from '../features/blueprints/selectors.js'
import { selectIsAuthenticated } from '../features/auth/authSlice.js'
import BlueprintCanvas from '../components/BlueprintCanvas.jsx'
import BlueprintList from '../components/BlueprintList.jsx'
import ErrorBanner from '../components/ErrorBanner.jsx'
import TopBlueprints from '../components/TopBlueprints.jsx'

export default function BlueprintsPage() {
  const dispatch = useDispatch()
  const {
    byAuthor,
    current,
    currentRequest,
    status,
    error,
    currentStatus,
    currentError,
    allStatus,
    allError,
    deleteError,
  } = useSelector((s) => s.blueprints)
  const authors = useSelector(selectAuthors)
  const top5 = useSelector(selectTop5ByPoints)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const [authorInput, setAuthorInput] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState('')
  const items = byAuthor[selectedAuthor] || []

  useEffect(() => {
    dispatch(fetchAll())
  }, [dispatch])

  const totalPoints = useMemo(
    () => items.reduce((acc, bp) => acc + (bp.points?.length || 0), 0),
    [items],
  )

  const getBlueprints = (e) => {
    e.preventDefault()
    const author = authorInput.trim()
    if (!author) return
    setSelectedAuthor(author)
    dispatch(fetchByAuthor(author))
  }

  const openBlueprint = (bp) => {
    dispatch(fetchBlueprint({ author: bp.author, name: bp.name }))
  }

  const removeBlueprint = (bp) => {
    if (window.confirm(`¿Borrar el plano "${bp.name}"?`)) {
      dispatch(deleteBlueprint({ author: bp.author, name: bp.name }))
    }
  }

  return (
    <div className="grid" style={{ gridTemplateColumns: '1.1fr 1.4fr', gap: 24 }}>
      <section className="grid" style={{ gap: 16 }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Blueprints</h2>
          <form style={{ display: 'flex', gap: 12 }} onSubmit={getBlueprints}>
            <input
              className="input"
              placeholder="Author"
              list="authors"
              value={authorInput}
              onChange={(e) => setAuthorInput(e.target.value)}
            />
            <datalist id="authors">
              {authors.map((a) => (
                <option key={a} value={a} />
              ))}
            </datalist>
            <button className="btn primary" type="submit">
              Get blueprints
            </button>
          </form>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>
            {selectedAuthor ? `${selectedAuthor}'s blueprints:` : 'Results'}
          </h3>
          {deleteError && (
            <ErrorBanner message={deleteError} onClose={() => dispatch(deleteErrorCleared())} />
          )}
          {!selectedAuthor && <p>Escribe un autor para ver sus planos.</p>}
          {selectedAuthor && status === 'loading' && <p>Cargando...</p>}
          {selectedAuthor && status === 'failed' && (
            <ErrorBanner message={error} onRetry={() => dispatch(fetchByAuthor(selectedAuthor))} />
          )}
          {selectedAuthor && status === 'succeeded' && (
            <BlueprintList
              items={items}
              selectedName={current?.author === selectedAuthor ? current.name : undefined}
              onOpen={openBlueprint}
              canEdit
              onDelete={isAuthenticated ? removeBlueprint : undefined}
            />
          )}
          <p style={{ marginTop: 12, fontWeight: 700 }}>Total user points: {totalPoints}</p>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Top 5 por cantidad de puntos</h3>
          {allStatus === 'loading' && <p>Cargando...</p>}
          {allStatus === 'failed' && (
            <ErrorBanner message={allError} onRetry={() => dispatch(fetchAll())} />
          )}
          {allStatus === 'succeeded' && <TopBlueprints items={top5} onOpen={openBlueprint} />}
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <h3 style={{ margin: 0 }}>Current blueprint</h3>
          {current && (
            <Link
              className="btn"
              to={`/blueprints/${encodeURIComponent(current.author)}/${encodeURIComponent(current.name)}/edit`}
            >
              Edit
            </Link>
          )}
        </div>
        <input
          className="input"
          aria-label="Current blueprint"
          readOnly
          value={current ? `${current.author} / ${current.name}` : ''}
          placeholder="Ningún plano abierto"
          style={{ marginBottom: 12 }}
        />
        {currentStatus === 'loading' && <p>Cargando plano...</p>}
        {currentStatus === 'failed' && (
          <ErrorBanner
            message={currentError}
            onRetry={() => dispatch(fetchBlueprint(currentRequest))}
          />
        )}
        <BlueprintCanvas
          id="blueprint-canvas"
          width={520}
          height={360}
          points={current?.points || []}
        />
      </section>
    </div>
  )
}
