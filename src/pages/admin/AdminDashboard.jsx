import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { XANO_ECOMMERCE_URL } from '../../config/xano';

import AdminMetricas from './AdminMetricas';
import AdminProductos from './AdminProductos';
import AdminOrdenes from './AdminOrdenes';

export default function AdminDashboard() {
  const [seccionActiva, setSeccionActiva] = useState('dashboard');

  const [productosAdmin, setProductosAdmin] = useState([]);
  const [ordenesAdmin, setOrdenesAdmin] = useState([]);
  const [metricas, setMetricas] = useState({
    totalCompras: 0,
    totalProductos: 0,
    stockTotalUnidades: 0,
    totalUsuarios: 0,
    usuariosBaneados: 0,
  });

  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');

  const cacheRef = useRef({});

  useEffect(() => {
    cargarDatosDashboard(false);
  }, []);

  const fetchConCache = async (url, options = {}, ttlMs = 60000, forzar = false) => {
    const ahora = Date.now();
    const cached = cacheRef.current[url];

    if (!forzar && cached && ahora - cached.timestamp < ttlMs) {
      return cached.data;
    }

    const res = await fetch(url, options);
    if (!res.ok) {
      throw new Error(`Error HTTP: ${res.status}`);
    }
    const data = await res.json();

    cacheRef.current[url] = { data, timestamp: ahora };
    return data;
  };

  const cargarDatosDashboard = async (forzar = false) => {
    setCargando(true);
    setErrorCarga('');

    try {
      const token = localStorage.getItem('authToken_purrfect');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const dataCarts = await fetchConCache(`${XANO_ECOMMERCE_URL}/cart`, { headers }, 60000, forzar);
      const listaCarritos = Array.isArray(dataCarts) ? dataCarts : [];

      const dataProducts = await fetchConCache(`${XANO_ECOMMERCE_URL}/product`, { headers }, 60000, forzar);
      const listaProductos = Array.isArray(dataProducts) ? dataProducts : [];
      listaProductos.sort((a, b) => Number(a.id) - Number(b.id));

      setProductosAdmin(listaProductos);

      const dataUsers = await fetchConCache(`${XANO_ECOMMERCE_URL}/user`, { headers }, 60000, forzar);
      const listaUsuarios = Array.isArray(dataUsers) ? dataUsers : [];

      const usuariosMap = {};
      listaUsuarios.forEach((u) => {
        usuariosMap[u.id] = u;
      });

      const listaOrdenesProcesada = listaCarritos
        .filter((c) => c.status !== 'en proceso')
        .map((c) => {
          const usr = usuariosMap[c.user_id] || {};
          return {
            ...c,
            clienteNombre: usr.name || usr.nombre || usr.email || `Usuario #${c.user_id}`,
            clienteEmail: usr.email || 'No registrado',
            clienteTelefono: usr.phone || usr.telefono || 'Sin registro',
            fechaFormateada: c.created_at
              ? new Date(c.created_at).toLocaleDateString('es-CL')
              : '23/10/2026',
          };
        })
        .sort((a, b) => Number(b.id) - Number(a.id));

      setOrdenesAdmin(listaOrdenesProcesada);

      const stockTotalSumado = listaProductos.reduce((acumulado, prod) => {
        return acumulado + Number(prod.stock || 0);
      }, 0);

      const baneadosContados = listaUsuarios.filter((u) => {
        return u.banned === true || u.status === 'banned' || u.role === 'banned';
      }).length;

      setMetricas({
        totalCompras: listaCarritos.length,
        totalProductos: listaProductos.length,
        stockTotalUnidades: stockTotalSumado,
        totalUsuarios: listaUsuarios.length,
        usuariosBaneados: baneadosContados,
      });
    } catch (err) {
      setErrorCarga('Error al obtener los datos.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 bg-light">
      <div className="row min-vh-100">
        <aside className="col-md-3 col-lg-2 bg-dark text-white p-3 d-flex flex-column justify-content-between">
          <div>
            <div className="d-flex align-items-center mb-4 pb-2 border-bottom border-secondary">
              <span className="fs-5 fw-bold">PurrfectStore Admin view</span>
            </div>

            <ul className="nav nav-pills flex-column mb-auto">
              <li className="nav-item mb-1">
                <button
                  className={`nav-link w-100 text-start ${seccionActiva === 'dashboard' ? 'active bg-primary' : 'text-white'}`}
                  onClick={() => setSeccionActiva('dashboard')}
                >
                  Dashboard
                </button>
              </li>
              <li className="nav-item mb-1">
                <button
                  className={`nav-link w-100 text-start ${seccionActiva === 'productos' ? 'active bg-primary' : 'text-white'}`}
                  onClick={() => setSeccionActiva('productos')}
                >
                  Productos (CRUD)
                </button>
              </li>
              <li className="nav-item mb-1">
                <button
                  className={`nav-link w-100 text-start ${seccionActiva === 'ordenes' ? 'active bg-primary' : 'text-white'}`}
                  onClick={() => setSeccionActiva('ordenes')}
                >
                  Órdenes / Boletas
                </button>
              </li>
            </ul>
          </div>

          <div className="pt-3 border-top border-secondary">
            <Link to="/" className="btn btn-outline-light w-100 fw-semibold">
              <i className="bi bi-arrow-left me-2"></i>
              Volver a la tienda
            </Link>
          </div>
        </aside>

        <main className="col-md-9 col-lg-10 p-4">
          {seccionActiva === 'dashboard' && (
            <AdminMetricas
              metricas={metricas}
              cargando={cargando}
              errorCarga={errorCarga}
              onRecargar={() => cargarDatosDashboard(true)}
            />
          )}

          {seccionActiva === 'productos' && (
            <AdminProductos
              productosAdmin={productosAdmin}
              cargando={cargando}
              onRecargar={() => cargarDatosDashboard(true)}
            />
          )}

          {seccionActiva === 'ordenes' && (
            <AdminOrdenes
              ordenesAdmin={ordenesAdmin}
              cargando={cargando}
              onRecargar={() => cargarDatosDashboard(true)}
            />
          )}
        </main>
      </div>
    </div>
  );
}