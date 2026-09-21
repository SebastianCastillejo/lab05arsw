import { Link } from 'react-router-dom'

const editPath = (bp) =>
  `/blueprints/${encodeURIComponent(bp.author)}/${encodeURIComponent(bp.name)}/edit`

export default function BlueprintList({ items = [], selectedName, onOpen, canEdit, onDelete }) {
  if (!items.length) return <p>No hay blueprints para este autor.</p>
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="table">
        <thead>
          <tr>
            <th>Blueprint name</th>
            <th className="num">Number of points</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((bp) => (
            <tr key={bp.name} className={bp.name === selectedName ? 'selected' : undefined}>
              <td>{bp.name}</td>
              <td className="num">{bp.points?.length || 0}</td>
              <td className="actions">
                <button className="btn" onClick={() => onOpen(bp)}>
                  Open
                </button>
                {canEdit && (
                  <Link className="btn" to={editPath(bp)}>
                    Edit
                  </Link>
                )}
                {onDelete && (
                  <button className="btn danger" onClick={() => onDelete(bp)}>
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
