import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { XANO_ECOMMERCE_URL } from '../../config/xano';

export default function AdminDashboard() {
  const [seccionActiva, setSeccionActiva] = useState('dashboard');

  const [productosAdmin, setProductosAdmin] = useState([]);
  const [ordenesAdmin, setOrdenesAdmin] = useState([]);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);

  const [metricas, setMetricas] = useState({
    totalCompras: 0,
    totalProductos: 0,
    stockTotalUnidades: 0,
    totalUsuarios: 0,
    usuariosBaneados: 0
  });

  const [cargando, setCargando] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [errorCarga, setErrorCarga] = useState('');
  const [mensaje, setMensaje] = useState('');

  const [modoEdicion, setModoEdicion] = useState(false);
  const [formProd, setFormProd] = useState({
    id: null,
    name: '',
    description: '',
    price: '',
    stock: '',
    brand: '',
    category: 'Alimentos',
    nuevasImagenes: [],
    imagenesExistentes: []
  });

  const fileInputRef = useRef(null);
  const cacheRef = useRef({});

  useEffect(() => {
    cargarDatosDashboard(false);
  }, []);

  const fetchConCache = async (url, options = {}, ttlMs = 60000, forzar = false) => {
    const ahora = Date.now();
    const cached = cacheRef.current[url];

    if (!forzar && cached && (ahora - cached.timestamp < ttlMs)) {
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
        ...(token ? { Authorization: `Bearer ${token}` } : {})
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
              : '23/10/2026'
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
        usuariosBaneados: baneadosContados
      });

    } catch (err) {
      setErrorCarga('Error al obtener los datos.');
    } finally {
      setCargando(false);
    }
  };

  const obtenerUrlImagen = (img) => {
    if (!img) return '';
    if (typeof img === 'string') return img;
    if (img.url) return img.url;
    if (img.path) {
      if (img.path.startsWith('http')) return img.path;
      try {
        const urlBase = new URL(XANO_ECOMMERCE_URL).origin;
        return `${urlBase}${img.path}`;
      } catch (e) {
        return img.path;
      }
    }
    return '';
  };

  const subirImagenXano = async (file) => {
    const formData = new FormData();
    formData.append('content', file);

    const token = localStorage.getItem('authToken_purrfect');
    const res = await fetch(`${XANO_ECOMMERCE_URL}/upload/image`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });

    if (!res.ok) {
      throw new Error('Error al subir la imagen.');
    }

    const data = await res.json();
    return data;
  };

  const handleAgregarArchivos = (e) => {
    const archivosSeleccionados = Array.from(e.target.files);
    if (archivosSeleccionados.length > 0) {
      setFormProd((prev) => ({
        ...prev,
        nuevasImagenes: [...prev.nuevasImagenes, ...archivosSeleccionados]
      }));
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleQuitarImagenExistente = (index) => {
    setFormProd((prev) => ({
      ...prev,
      imagenesExistentes: prev.imagenesExistentes.filter((_, i) => i !== index)
    }));
  };

  const handleQuitarNuevaImagen = (index) => {
    setFormProd((prev) => ({
      ...prev,
      nuevasImagenes: prev.nuevasImagenes.filter((_, i) => i !== index)
    }));
  };

  const handleGuardarProducto = async (e) => {
    e.preventDefault();
    setSubiendo(true);
    setMensaje('');

    try {
      let arregloImagenesFinal = [...formProd.imagenesExistentes];

      if (formProd.nuevasImagenes.length > 0) {
        for (const file of formProd.nuevasImagenes) {
          const resultadoSubida = await subirImagenXano(file);
          const objetoSubido = Array.isArray(resultadoSubida) ? resultadoSubida[0] : resultadoSubida;
          if (objetoSubido) {
            arregloImagenesFinal.push(objetoSubido);
          }
        }
      }

      const payload = {
        name: formProd.name,
        description: formProd.description,
        price: Number(formProd.price),
        stock: Number(formProd.stock),
        brand: formProd.brand,
        category: formProd.category,
        image: arregloImagenesFinal
      };

      const token = localStorage.getItem('authToken_purrfect');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      if (modoEdicion && formProd.id) {
        const res = await fetch(`${XANO_ECOMMERCE_URL}/product/${formProd.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('No se pudo actualizar el producto.');
        setMensaje('Producto modificado con éxito.');
      } else {
        const res = await fetch(`${XANO_ECOMMERCE_URL}/product`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('No se pudo crear el producto.');
        setMensaje('Producto agregado con éxito.');
      }

      limpiarFormulario();
      await cargarDatosDashboard(true);

    } catch (err) {
      setMensaje(err.message || 'Ocurrió un error al procesar el producto.');
    } finally {
      setSubiendo(false);
      setTimeout(() => setMensaje(''), 4000);
    }
  };

  const handleIniciarEdicion = (prod) => {
    setModoEdicion(true);

    let imgs = [];
    if (Array.isArray(prod.image)) {
      imgs = prod.image;
    } else if (prod.image) {
      imgs = [prod.image];
    }

    setFormProd({
      id: prod.id,
      name: prod.name || prod.nombre || '',
      description: prod.description || prod.descripcion || '',
      price: prod.price || prod.precio || '',
      stock: prod.stock ?? 0,
      brand: prod.brand || prod.marca || '',
      category: prod.category || prod.categoria || 'Alimentos',
      nuevasImagenes: [],
      imagenesExistentes: imgs
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminarProducto = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto de la base de datos?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken_purrfect');
      const res = await fetch(`${XANO_ECOMMERCE_URL}/product/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (!res.ok) throw new Error('Error al eliminar el producto.');

      setMensaje('Producto eliminado correctamente.');
      await cargarDatosDashboard(true);
    } catch (err) {
      setMensaje('No se pudo eliminar el producto.');
    } finally {
      setTimeout(() => setMensaje(''), 3000);
    }
  };

  const limpiarFormulario = () => {
    setModoEdicion(false);
    setFormProd({
      id: null,
      name: '',
      description: '',
      price: '',
      stock: '',
      brand: '',
      category: 'Alimentos',
      nuevasImagenes: [],
      imagenesExistentes: []
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="container-fluid min-vh-100 bg-light">
      <div className="row min-vh-100">
        
        <aside className="col-md-3 col-lg-2 bg-dark text-white p-3 d-flex flex-column justify-content-between">
          <div>
            <div className="d-flex align-items-center mb-4 pb-2 border-bottom border-secondary">
              <span className="fs-4 fw-bold text-warning me-2"></span>
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
            <Link to="/" className="btn btn-outline-light w-100 mb-2 btn-sm">
              Volver a la Tienda
            </Link>
          </div>
        </aside>

        <main className="col-md-9 col-lg-10 p-4">

          {seccionActiva === 'dashboard' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-secondary mb-0">Dashboard de Control</h2>
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => cargarDatosDashboard(true)}
                  disabled={cargando}
                >
                  {cargando ? 'Cargando...' : 'Recargar Datos'}
                </button>
              </div>

              {errorCarga && <div className="alert alert-danger py-2">{errorCarga}</div>}

              {cargando ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status"></div>
                  <p className="mt-2 text-muted">Cargando métricas...</p>
                </div>
              ) : (
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <div className="card text-white bg-primary shadow-sm h-100">
                      <div className="card-body">
                        <h5 className="card-title">Compras Totales</h5>
                        <p className="display-6 fw-bold mb-0">{metricas.totalCompras.toLocaleString('es-CL')}</p>
                        <small className="text-light">Compras registradas</small>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card text-white bg-success shadow-sm h-100">
                      <div className="card-body">
                        <h5 className="card-title">Productos en Stock</h5>
                        <p className="display-6 fw-bold mb-0">{metricas.totalProductos}</p>
                        <small className="text-light">
                          Stock total: {metricas.stockTotalUnidades}
                        </small>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card text-white bg-warning shadow-sm h-100">
                      <div className="card-body">
                        <h5 className="card-title text-dark">Usuarios Registrados</h5>
                        <p className="display-6 fw-bold mb-0 text-dark">{metricas.totalUsuarios}</p>
                        <small className="text-dark">
                          Usuarios baneados: {metricas.usuariosBaneados}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {seccionActiva === 'productos' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-secondary mb-0">Gestión de Productos (CRUD)</h2>
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => cargarDatosDashboard(true)}
                  disabled={cargando}
                >
                  {cargando ? 'Cargando...' : 'Recargar Datos'}
                </button>
              </div>

              {mensaje && <div className="alert alert-info py-2">{mensaje}</div>}

              <div className="card shadow-sm mb-4 p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">{modoEdicion ? 'Modificar Producto' : 'Agregar Nuevo Producto'}</h5>
                  {modoEdicion && (
                    <button className="btn btn-sm btn-outline-secondary" onClick={limpiarFormulario}>
                      Cancelar Edición
                    </button>
                  )}
                </div>

                <form onSubmit={handleGuardarProducto} className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">Nombre del Producto</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formProd.name}
                      onChange={(e) => setFormProd({ ...formProd, name: e.target.value })}
                      placeholder="Ej. Rascador Grande"
                      required
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Categoría</label>
                    <select
                      className="form-select"
                      value={formProd.category}
                      onChange={(e) => setFormProd({ ...formProd, category: e.target.value })}
                    >
                      <option value="Alimentos">Alimentos</option>
                      <option value="Accesorios decorativos">Accesorios decorativos</option>
                      <option value="Higiene y Arenas">Higiene y Arenas</option>
                      <option value="Comodidad">Comodidad</option>
                      <option value="Juguetes">Juguetes</option>
                    </select>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Marca</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formProd.brand}
                      onChange={(e) => setFormProd({ ...formProd, brand: e.target.value })}
                      placeholder="Ej. Purina / Whiskas"
                    />
                  </div>

                  <div className="col-md-2">
                    <label className="form-label">Precio ($)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formProd.price}
                      onChange={(e) => setFormProd({ ...formProd, price: e.target.value })}
                      placeholder="9990"
                      required
                    />
                  </div>

                  <div className="col-md-2">
                    <label className="form-label">Stock</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formProd.stock}
                      onChange={(e) => setFormProd({ ...formProd, stock: e.target.value })}
                      placeholder="10"
                      required
                    />
                  </div>

                  <div className="col-md-10">
                    <label className="form-label">Descripción</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formProd.description}
                      onChange={(e) => setFormProd({ ...formProd, description: e.target.value })}
                      placeholder="Descripción del producto"
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-bold d-block">Imágenes del Producto</label>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="d-none"
                      accept="image/*"
                      multiple
                      onChange={handleAgregarArchivos}
                    />

                    <button
                      type="button"
                      className="btn btn-outline-secondary mb-2"
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    >
                      Seleccionar archivos
                    </button>

                    <div className="d-flex flex-wrap gap-3 mt-2">
                      {formProd.imagenesExistentes.map((img, idx) => (
                        <div
                          key={`exist-${idx}`}
                          className="border rounded p-2 bg-white shadow-sm text-center d-flex flex-column align-items-center"
                          style={{ width: '120px' }}
                        >
                          <img
                            src={obtenerUrlImagen(img)}
                            alt={`Imagen ${idx + 1}`}
                            className="rounded mb-2"
                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                          />
                          <button
                            type="button"
                            className="btn btn-danger btn-sm w-100 py-1"
                            style={{ fontSize: '12px' }}
                            onClick={() => handleQuitarImagenExistente(idx)}
                          >
                            Quitar
                          </button>
                        </div>
                      ))}

                      {formProd.nuevasImagenes.map((file, idx) => (
                        <div
                          key={`new-${idx}`}
                          className="border rounded p-2 bg-white shadow-sm text-center d-flex flex-column align-items-center"
                          style={{ width: '120px' }}
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Nueva ${idx + 1}`}
                            className="rounded mb-2"
                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                          />
                          <button
                            type="button"
                            className="btn btn-danger btn-sm w-100 py-1"
                            style={{ fontSize: '12px' }}
                            onClick={() => handleQuitarNuevaImagen(idx)}
                          >
                            Quitar
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="col-12 text-end mt-4">
                    <button type="submit" className="btn btn-success px-4" disabled={subiendo}>
                      {subiendo ? 'Guardando...' : (modoEdicion ? 'Actualizar Producto' : 'Guardar Producto')}
                    </button>
                  </div>
                </form>
              </div>

              <div className="card shadow-sm p-3">
                <h5 className="mb-3">Catálogo Actual</h5>
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-dark">
                      <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Categoría</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productosAdmin.map((prod) => (
                        <tr key={prod.id}>
                          <td>#{prod.id}</td>
                          <td className="fw-bold">{prod.name || prod.nombre}</td>
                          <td>
                            <span className="badge bg-secondary">
                              {prod.category || prod.categoria || 'Sin Cat.'}
                            </span>
                          </td>
                          <td>${Number(prod.price || prod.precio || 0).toLocaleString('es-CL')}</td>
                          <td>{prod.stock ?? 0}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-warning btn-sm"
                                onClick={() => handleIniciarEdicion(prod)}
                              >
                                Modificar
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleEliminarProducto(prod.id)}
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {seccionActiva === 'ordenes' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-secondary mb-0">Historial de Órdenes y Boletas</h2>
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => cargarDatosDashboard(true)}
                  disabled={cargando}
                >
                  {cargando ? 'Cargando...' : 'Recargar Datos'}
                </button>
              </div>

              <div className="card shadow-sm p-3">
                <div className="table-responsive">
                  <table className="table table-striped align-middle">
                    <thead className="table-primary">
                      <tr>
                        <th>N° Orden</th>
                        <th>Cliente</th>
                        <th>Email / Contacto</th>
                        <th>Fecha</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ordenesAdmin.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center text-muted py-4">
                            No hay órdenes completadas o rechazadas registradas.
                          </td>
                        </tr>
                      ) : (
                        ordenesAdmin.map((orden) => {
                          const esAprobado = orden.status === 'aprobado';
                          const numOrdenFormateado = String(orden.id || 1).padStart(6, '0');

                          return (
                            <tr key={orden.id}>
                              <td className="fw-bold">#{numOrdenFormateado}</td>
                              <td>{orden.clienteNombre}</td>
                              <td>
                                <div>{orden.clienteEmail}</div>
                                <small className="text-muted">{orden.clienteTelefono}</small>
                              </td>
                              <td>{orden.fechaFormateada}</td>
                              <td className="fw-bold">${Number(orden.total || 0).toLocaleString('es-CL')}</td>
                              <td>
                                <span className={`badge ${esAprobado ? 'bg-success' : 'bg-danger'}`}>
                                  {esAprobado ? 'Completado' : 'Rechazado'}
                                </span>
                              </td>
                              <td>
                                <button
                                  className="btn btn-info btn-sm text-white"
                                  onClick={() => setOrdenSeleccionada(orden)}
                                >
                                  Ver detalles
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {ordenSeleccionada && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content shadow">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title">
                  Detalle de Orden #{String(ordenSeleccionada.id || 1).padStart(6, '0')}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setOrdenSeleccionada(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3 pb-3 border-bottom">
                  <div className="col-md-6">
                    <p className="mb-1"><strong>Cliente:</strong> {ordenSeleccionada.clienteNombre}</p>
                    <p className="mb-1"><strong>Email:</strong> {ordenSeleccionada.clienteEmail}</p>
                    <p className="mb-0"><strong>Contacto:</strong> {ordenSeleccionada.clienteTelefono}</p>
                  </div>
                  <div className="col-md-6 text-md-end mt-3 mt-md-0">
                    <p className="mb-1"><strong>Fecha:</strong> {ordenSeleccionada.fechaFormateada}</p>
                    <p className="mb-0">
                      <strong>Estado:</strong>{' '}
                      <span className={`badge ${ordenSeleccionada.status === 'aprobado' ? 'bg-success' : 'bg-danger'}`}>
                        {ordenSeleccionada.status === 'aprobado' ? 'Completado' : 'Rechazado'}
                      </span>
                    </p>
                  </div>
                </div>

                <h6 className="fw-bold mb-3">Productos de la Orden:</h6>
                <div className="table-responsive">
                  <table className="table table-bordered align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Producto</th>
                        <th>Precio Unitario</th>
                        <th>Cantidad</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(ordenSeleccionada.product_id) && ordenSeleccionada.product_id.length > 0 ? (
                        ordenSeleccionada.product_id.map((item, idx) => {
                          const prod = item.product_details || {};
                          const precioUnitario = Number(prod.price ?? item.price ?? 0);
                          const cantidad = Number(item.quantity ?? item.cantidad ?? 1);
                          const subtotal = precioUnitario * cantidad;

                          return (
                            <tr key={idx}>
                              <td className="fw-bold">{prod.name || prod.nombre || `Producto #${item.product_id}`}</td>
                              <td>${precioUnitario.toLocaleString('es-CL')}</td>
                              <td>{cantidad}</td>
                              <td>${subtotal.toLocaleString('es-CL')}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center text-muted py-3">
                            Sin elementos registrados en esta orden.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="text-end fw-bold fs-5 mt-4">
                  Total Pagado: ${Number(ordenSeleccionada.total || 0).toLocaleString('es-CL')}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setOrdenSeleccionada(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}