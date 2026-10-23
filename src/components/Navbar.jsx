import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ carritoTotal = 0, usuario = null, onCerrarSesion }) {
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const navigate = useNavigate();

  const ejecutarBusqueda = (e) => {
    e.preventDefault();
    if (terminoBusqueda.trim()) {
      navigate(`/productos?search=${encodeURIComponent(terminoBusqueda.trim())}`);
    } else {
      navigate('/productos');
    }
  };

  const manejarClickCarrito = (e) => {
    const token = localStorage.getItem('authToken_purrfect');
    if (!token) {
      e.preventDefault();
      alert('Regístrate o inicia sesión primero.');
    }
  };

  return (
    <header className="w-100 border-0">
      <nav className="navbar navbar-expand-lg bg-white py-2 shadow-sm border-0 w-100">
        <div className="container-fluid px-4">
          <Link
            className="navbar-brand d-flex align-items-center fw-bold fs-3 brand-title"
            to="/"
            style={{ color: '#2b2e33' }}
          >
            <img
              src="/img/storeimage.png"
              alt="PurrfectStore Logo"
              style={{ height: '76px', width: 'auto' }}
              className="me-3 object-fit-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <span>PurrfectStore</span>
          </Link>

          <div className="collapse navbar-collapse justify-content-center" id="navbarTopContent">
            <form className="d-flex w-50" role="search" onSubmit={ejecutarBusqueda}>
              <input
                className="form-control me-2 border-secondary-subtle"
                type="search"
                placeholder="Buscar alimentos, juguetes..."
                aria-label="Buscar"
                value={terminoBusqueda}
                onChange={(e) => setTerminoBusqueda(e.target.value)}
              />
              <button className="btn btn-outline-primary px-3" type="submit">
                <i className="bi bi-search"></i>
              </button>
            </form>
          </div>

          <div className="d-flex align-items-center gap-2">
            {usuario ? (
              <div className="d-flex align-items-center gap-3">
                <span className="fw-bold text-dark fs-6">
                  <i className="bi bi-person-circle me-1 text-primary"></i>
                  {usuario.name || usuario.first_name || 'Usuario'}
                </span>
                <button
                  onClick={onCerrarSesion}
                  className="btn btn-outline-danger btn-sm fw-medium"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <>
                <Link to="/iniciar-sesion" className="btn btn-outline-primary px-3 fw-medium">
                  Iniciar sesión
                </Link>
                <Link to="/crear-sesion" className="btn btn-primary px-3 fw-medium">
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <nav
        className="navbar navbar-expand-lg py-2 border-bottom border-light-subtle w-100"
        style={{ backgroundColor: '#f0f2f5' }}
      >
        <div className="container-fluid px-4">
          <div className="collapse navbar-collapse justify-content-center">
            <ul className="navbar-nav gap-4 align-items-center">
              <li className="nav-item">
                <Link className="nav-link fw-semibold text-dark" to="/">
                  Home
                </Link>
              </li>
              
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle fw-semibold text-dark"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Categorías
                </a>
                <ul className="dropdown-menu shadow-sm border-0">
                  <li>
                    <Link className="dropdown-item fw-bold border-bottom" to="/productos">
                      Catálogo completo
                    </Link>
                  </li>
                  <li><Link className="dropdown-item" to="/productos?cat=Alimentos">Alimentos</Link></li>
                  <li><Link className="dropdown-item" to="/productos?cat=Accesorios decorativos">Accesorios decorativos</Link></li>
                  <li><Link className="dropdown-item" to="/productos?cat=Higiene y Arenas">Higiene y Arenas</Link></li>
                  <li><Link className="dropdown-item" to="/productos?cat=Comodidad">Comodidad</Link></li>
                  <li><Link className="dropdown-item" to="/productos?cat=Juguetes">Juguetes</Link></li>
                </ul>
              </li>

              <li className="nav-item">
                <Link className="nav-link fw-semibold text-dark" to="/nosotros">
                  Nosotros
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link fw-semibold text-dark" to="/contacto">
                  Contacto
                </Link>
              </li>

              <li className="nav-item ms-2">
                <Link
                  className="btn btn-success fw-bold d-flex align-items-center gap-2 px-3 py-2"
                  to="/carrito"
                  onClick={manejarClickCarrito}
                >
                  <i className="bi bi-cart4 fs-5"></i>
                  <span>Carrito ${carritoTotal.toLocaleString('es-CL')}</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}