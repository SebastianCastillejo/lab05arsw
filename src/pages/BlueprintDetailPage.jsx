import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import { fetchBlueprint } from '../features/blueprints/blueprintsSlice.js'
import BlueprintCanvas from '../components/BlueprintCanvas.jsx'
import ErrorBanner from '../components/ErrorBanner.jsx'

export default function BlueprintDetailPage() {
  const { author, name } = useParams()
  const dispatch = useDispatch()
  const { current: bp, currentStatus, currentError } = useSelector((s) => s.blueprints)
  const loaded = bp?.author === author && bp?.name === name

  useEffect(() => {
    dispatch(fetchBlueprint({ author, name }))
  }, [author, name, dispatch])

  if (currentStatus === 'failed')
    return (
      <div className="card">
        <ErrorBanner
          message={currentError}
          onRetry={() => dispatch(fetchBlueprint({ author, name }))}
        />
      </div>
    )

  if (!loaded)
    return (
      <div className="card">
        <p>Cargando...</p>
      </div>
    )

  return (
    <div className="card">
      <div className="card-header">
        <h2 style={{ margin: 0 }}>{bp.name}</h2>
        <Link
          className="btn"
          to={`/blueprints/${encodeURIComponent(author)}/${encodeURIComponent(name)}/edit`}
        >
          Edit
        </Link>
      </div>
      <p>
        <strong>Autor:</strong> {bp.author}
      </p>
      <p>
        <strong>Puntos:</strong> {bp.points?.length || 0}
      </p>
      <BlueprintCanvas id="blueprint-detail" points={bp.points || []} />
    </div>
  )
}
