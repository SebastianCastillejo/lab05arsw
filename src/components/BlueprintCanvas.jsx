import { useEffect, useRef } from 'react'

export default function BlueprintCanvas({
  id = 'blueprint-canvas',
  points = [],
  width = 520,
  height = 360,
  onPointAdd,
}) {
  const ref = useRef(null)

  // Convierte el clic a coordenadas del canvas (en pantalla puede verse más pequeño)
  const handleClick = (e) => {
    if (!onPointAdd) return
    const rect = e.currentTarget.getBoundingClientRect()
    const scaleX = rect.width ? width / rect.width : 1
    const scaleY = rect.height ? height / rect.height : 1
    onPointAdd({
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top) * scaleY),
    })
  }

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#0b1220'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = 'rgba(148,163,184,0.15)'
    ctx.lineWidth = 1
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }
    // Une los puntos en orden con segmentos de recta
    if (points.length > 1) {
      ctx.strokeStyle = '#93c5fd'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)
      for (let i = 1; i < points.length; i++) {
        const p = points[i]
        ctx.lineTo(p.x, p.y)
      }
      ctx.stroke()
    }
    // Marca cada punto con un círculo
    ctx.fillStyle = '#fbbf24'
    for (const p of points) {
      ctx.beginPath()
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [points])

  return (
    <canvas
      id={id}
      ref={ref}
      width={width}
      height={height}
      onClick={handleClick}
      style={{
        background: '#0b1220',
        border: '1px solid #334155',
        borderRadius: 12,
        width: '100%',
        maxWidth: width,
        cursor: onPointAdd ? 'crosshair' : 'default',
      }}
    />
  )
}
