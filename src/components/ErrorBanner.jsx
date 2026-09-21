export default function ErrorBanner({ message, onRetry, onClose }) {
  return (
    <div className="banner" role="alert">
      <span>{message}</span>
      <div style={{ display: 'flex', gap: 8 }}>
        {onRetry && (
          <button className="btn" onClick={onRetry}>
            Reintentar
          </button>
        )}
        {onClose && (
          <button className="btn" onClick={onClose} aria-label="Cerrar aviso">
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
