import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { XANO_AUTH_URL } from '../config/xano';

export default function Login({ onLoginExitoso }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const respuesta = await fetch(`${XANO_AUTH_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const datos = await respuesta.json();

      if (respuesta.ok && datos.authToken) {
        const usuarioData = datos.user || { name: email.split('@')[0], email };
        onLoginExitoso(usuarioData, datos.authToken);
        navigate('/');
      } else {
        setError(datos.message || 'Credenciales inválidas. Verifica tu correo y contraseña.');
      }
    } catch (err) {
      setError('Error de conexión con el servidor de autenticación.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="container py-5">
      <div className="card shadow-sm border-0 rounded-3 overflow-hidden bg-white">
        <div className="row g-0">
          
          <div className="col-md-6 d-none d-md-block bg-light">
            <img
              src="/img/authimage.jpg"
              alt="Autenticación PurrfectStore"
              className="w-100 h-100 object-fit-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/600x400?text=PurrfectStore';
              }}
            />
          </div>

          <div className="col-md-6 p-4 p-lg-5 d-flex flex-column justify-content-center">
            <h2 className="fw-bold text-center text-dark mb-4">Iniciar Sesión</h2>

            {error && (
              <div className="alert alert-danger py-2 small mb-3" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={manejarSubmit}>
              <div className="mb-3">
                <label className="form-label text-secondary small fw-medium">Usuario / Correo</label>
                <input
                  type="email"
                  className="form-control"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary small fw-medium">Contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="d-flex justify-content-between align-items-center mb-4 small">
                <Link to="/crear-sesion" className="text-decoration-underline text-primary">
                  ¿No tienes cuenta? Regístrate aquí
                </Link>
                <span className="text-secondary" style={{ cursor: 'not-allowed' }}>
                  ¿Olvidaste tu contraseña?
                </span>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 fw-bold py-2 shadow-sm text-uppercase"
                disabled={cargando}
              >
                {cargando ? 'Iniciando sesión...' : 'INICIAR SESIÓN'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </main>
  );
}