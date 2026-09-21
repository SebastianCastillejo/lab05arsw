export default function TopBlueprints({ items = [], onOpen }) {
  if (!items.length) return <p>No hay planos todavía.</p>
  return (
    <ol className="top-list">
      {items.map((bp) => (
        <li key={`${bp.author}/${bp.name}`}>
          <span>
            {bp.name} <small>de {bp.author}</small>
          </span>
          <span className="top-actions">
            <strong>{bp.points?.length || 0} pts</strong>
            <button className="btn" onClick={() => onOpen(bp)}>
              Open
            </button>
          </span>
        </li>
      ))}
    </ol>
  )
}
