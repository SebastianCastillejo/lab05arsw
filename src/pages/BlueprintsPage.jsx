import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchAuthors,
  fetchByAuthor,
  fetchBlueprint,
} from '../features/blueprints/blueprintsSlice.js'
import BlueprintCanvas from '../components/BlueprintCanvas.jsx'
import BlueprintList from '../components/BlueprintList.jsx'

export default function BlueprintsPage() {
  const dispatch = useDispatch()
  const { byAuthor, current, status, error, currentStatus, currentError } = useSelector(
    (s) => s.blueprints,
  )
  const [authorInput, setAuthorInput] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState('')
  const items = byAuthor[selectedAuthor] || []

  useEffect(() => {
    dispatch(fetchAuthors())
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

  return (
    <div className="grid" style={{ gridTemplateColumns: '1.1fr 1.4fr', gap: 24 }}>
      <section className="grid" style={{ gap: 16 }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Blueprints</h2>
          <form style={{ display: 'flex', gap: 12 }} onSubmit={getBlueprints}>
            <input
              className="input"
              placeholder="Author"
              value={authorInput}
              onChange={(e) => setAuthorInput(e.target.value)}
            />
            <button className="btn primary" type="submit">
              Get blueprints
            </button>
          </form>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>
            {selectedAuthor ? `${selectedAuthor}'s blueprints:` : 'Results'}
          </h3>
          {!selectedAuthor && <p>Escribe un autor para ver sus planos.</p>}
          {selectedAuthor && status === 'loading' && <p>Cargando...</p>}
          {selectedAuthor && status === 'failed' && <p className="error">{error}</p>}
          {selectedAuthor && status === 'succeeded' && (
            <BlueprintList
              items={items}
              selectedName={current?.author === selectedAuthor ? current.name : undefined}
              onOpen={openBlueprint}
            />
          )}
          <p style={{ marginTop: 12, fontWeight: 700 }}>Total user points: {totalPoints}</p>
        </div>
      </section>

      <section className="card">
        <h3 style={{ marginTop: 0 }}>Current blueprint</h3>
        <input
          className="input"
          aria-label="Current blueprint"
          readOnly
          value={current ? `${current.author} / ${current.name}` : ''}
          placeholder="Ningún plano abierto"
          style={{ marginBottom: 12 }}
        />
        {currentStatus === 'loading' && <p>Cargando plano...</p>}
        {currentStatus === 'failed' && <p className="error">{currentError}</p>}
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
