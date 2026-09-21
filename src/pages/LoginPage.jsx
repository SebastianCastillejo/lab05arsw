import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { login, logout, selectIsAuthenticated } from '../features/auth/authSlice.js'

const useMock = import.meta.env.VITE_USE_MOCK === 'true'

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { status, error } = useSelector((s) => s.auth)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // Página a la que se quería entrar antes de que PrivateRoute mandara al login
  const from = location.state?.from?.pathname ?? '/'

  const submit = async (e) => {
    e.preventDefault()
    try {
      await dispatch(login({ username, password })).unwrap()
      navigate(from, { replace: true })
    } catch {
      // el error queda guardado en el estado y se muestra abajo
    }
  }

  if (isAuthenticated)
    return (
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Sesión iniciada</h2>
        <button className="btn" onClick={() => dispatch(logout())}>
          Cerrar sesión
        </button>
      </div>
    )

  return (
    <form className="card" onSubmit={submit}>
      <h2 style={{ marginTop: 0 }}>Login</h2>
      {location.state?.from && <p>Inicia sesión para continuar.</p>}
      <div className="grid cols-2">
        <div>
          <label htmlFor="login-user">Usuario</label>
          <input
            id="login-user"
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="login-pass">Contraseña</label>
          <input
            id="login-pass"
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>
      {useMock && <p style={{ color: '#94a3b8' }}>Modo prueba: usuario admin, contraseña admin.</p>}
      {status === 'failed' && <p className="error">{error}</p>}
      <button className="btn primary" style={{ marginTop: 12 }} disabled={status === 'loading'}>
        {status === 'loading' ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  )
}
