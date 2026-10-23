import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { XANO_ECOMMERCE_URL } from '../config/xano';

export default function Checkout({
  carrito = [],
  carritoId = null,
  usuario = null,
  onCompletarPedido,
  onRechazarPedido,
  onActualizarUsuario,
}) {
  const [paso, setPaso] = useState('formulario');
  const [notificacion, setNotificacion] = useState('');
  const [idBoleta, setIdBoleta] = useState(carritoId);
  const [carritoFinal, setCarritoFinal] = useState([]);
  const [guardandoDir, setGuardandoDir] = useState(false);
  const [actualizadoExito, setActualizadoExito] = useState(false);

  const dirObj = usuario?.shipping_address || {};
  const direccionInicial = typeof dirObj === 'string' ? dirObj : dirObj.direccion || '';
  const ciudadInicial = typeof dirObj === 'object' ? dirObj.ciudad || '' : '';
  const regionInicial = typeof dirObj === 'object' ? dirObj.region || '' : '';
  const comunaInicial = typeof dirObj === 'object' ? dirObj.comuna || '' : '';

  const [direccion, setDireccion] = useState(direccionInicial);
  const [ciudad, setCiudad] = useState(ciudadInicial);
  const [region, setRegion] = useState(regionInicial);
  const [comuna, setComuna] = useState(comunaInicial);

  useEffect(() => {
    setDireccion(direccionInicial);
    setCiudad(ciudadInicial);
    setRegion(regionInicial);
    setComuna(comunaInicial);
  }, [usuario]);

  const direccionModificada =
    direccion !== direccionInicial ||
    ciudad !== ciudadInicial ||
    region !== regionInicial ||
    comuna !== comunaInicial;

  const obtenerPrecio = (item) => Number(item.price ?? item.precio_nuevo ?? item.precio ?? 0);

  const obtenerImagenUrl = (item) => {
    if (Array.isArray(item.image) && item.image.length > 0) return item.image[0].url || item.image[0];
    if (typeof item.image === 'string') return item.image;
    return 'https://via.placeholder.com/80x80?text=Purrfect';
  };

  const totalPagar = (paso === 'boleta' || paso === 'error' ? carritoFinal : carrito).reduce((acc, item) => {
    return acc + obtenerPrecio(item) * (item.cantidad || 1);
  }, 0);

  const guardarDireccion = async () => {
    const userId = usuario?.id || usuario?.user_id || usuario?.user?.id;
    if (!userId) return;

    setGuardandoDir(true);
    const token = localStorage.getItem('authToken_purrfect');
    const nuevaDireccionObj = { direccion, ciudad, region, comuna };

    const bodyPayload = {
      user_id: Number(userId),
      name: usuario?.name || `${usuario?.first_name || ''} ${usuario?.last_name || ''}`.trim(),
      email: usuario?.email || null,
      first_name: usuario?.first_name || '',
      last_name: usuario?.last_name || '',
      role: usuario?.role || 'cliente',
      status: usuario?.status || 'normal',
      phone: usuario?.phone || '',
      shipping_address: nuevaDireccionObj,
    };

    try {
      const respuesta = await fetch(`${XANO_ECOMMERCE_URL}/user/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(bodyPayload),
      });

      if (respuesta.ok) {
        const respuestaServidor = await respuesta.json().catch(() => null);
        const usuarioActualizado = {
          ...(usuario || {}),
          ...(respuestaServidor || {}),
          shipping_address: nuevaDireccionObj,
        };

        localStorage.setItem('usuario_purrfect', JSON.stringify(usuarioActualizado));
        if (onActualizarUsuario) onActualizarUsuario(usuarioActualizado);

        setActualizadoExito(true);
        setTimeout(() => {
          setActualizadoExito(false);
        }, 3000);
      }
    } catch (err) {
      console.error('Error enviando PATCH de dirección a Xano:', err);
    } finally {
      setGuardandoDir(false);
    }
  };

  const cancelarCambios = () => {
    setDireccion(direccionInicial);
    setCiudad(ciudadInicial);
    setRegion(regionInicial);
    setComuna(comunaInicial);
  };

  const iniciarPago = () => {
    setCarritoFinal([...carrito]);
    setIdBoleta(carritoId);
    setPaso('procesando');
  };

  useEffect(() => {
    if (paso === 'procesando') {
      const temporizador = setTimeout(async () => {
        const exito = await onCompletarPedido();
        if (exito !== false) {
          setPaso('boleta');
        } else {
          setPaso('formulario');
        }
      }, 5000);

      return () => clearTimeout(temporizador);
    }
  }, [paso]);

  const simularErrorPago = async () => {
    setPaso('procesando_error');
    if (onRechazarPedido) {
      await onRechazarPedido();
    }
    setPaso('error');
  };

  const manejarDescargarBoleta = () => {
    setNotificacion('Boleta descargada');
    setTimeout(() => {
      setNotificacion('');
    }, 4000);
  };

  const numeroOrdenFormateado = String(idBoleta || 1).padStart(6, '0');

  if (carrito.length === 0 && paso === 'formulario') {
    return (
      <main className="container py-5 text-center">
        <div className="card border-0 shadow-sm p-5 bg-white mx-auto" style={{ maxWidth: '500px' }}>
          <i className="bi bi-cart-x fs-1 text-muted mb-3"></i>
          <h4 className="fw-bold text-secondary mb-3">No tienes productos en el carrito</h4>
          <Link to="/productos" className="btn btn-primary fw-bold">
            Ir al Catálogo
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-5">
      {notificacion && (
        <div className="alert alert-success text-center fw-bold shadow-sm mb-4">
          <i className="bi bi-check-circle-fill me-2"></i>
          {notificacion}
        </div>
      )}

      {paso === 'formulario' && (
        <div className="card border-0 shadow-sm p-4 bg-white mx-auto rounded-4" style={{ maxWidth: '850px' }}>
          <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
            <div>
              <h3 className="fw-bold text-dark mb-1">Carrito de compra</h3>
              <p className="text-muted small mb-0">Completa la siguiente información</p>
            </div>
            <div className="bg-primary text-white fw-bold px-3 py-2 rounded-3 fs-5">
              Total a pagar: ${totalPagar.toLocaleString('es-CL')}
            </div>
          </div>

          <div className="table-responsive mb-4">
            <table className="table align-middle">
              <thead className="table-light fs-6 fw-bold">
                <tr>
                  <th>Imagen</th>
                  <th>Nombre</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {carrito.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <img
                        src={obtenerImagenUrl(item)}
                        alt={item.name || item.nombre}
                        className="rounded object-fit-cover"
                        style={{ width: '50px', height: '50px' }}
                      />
                    </td>
                    <td className="fw-semibold text-dark">{item.name || item.nombre}</td>
                    <td>${obtenerPrecio(item).toLocaleString('es-CL')}</td>
                    <td className="fw-bold">{item.cantidad || 1}</td>
                    <td className="fw-bold text-dark">
                      ${(obtenerPrecio(item) * (item.cantidad || 1)).toLocaleString('es-CL')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h5 className="fw-bold text-dark mb-1">Información del cliente</h5>
          <p className="text-muted small mb-3">Información asociada a tu cuenta</p>

          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label fw-semibold small mb-1">Nombre*</label>
              <input type="text" className="form-control bg-light" value={usuario?.first_name || usuario?.name || ''} readOnly />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold small mb-1">Apellidos*</label>
              <input type="text" className="form-control bg-light" value={usuario?.last_name || ''} readOnly />
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold small mb-1">Correo*</label>
              <input type="email" className="form-control bg-light" value={usuario?.email || ''} readOnly />
            </div>
          </div>

          <h5 className="fw-bold text-dark mb-1">Dirección de entrega de los productos</h5>
          <p className="text-muted small mb-3">Ingrese dirección de forma detallada</p>

          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label fw-semibold small mb-1">Dirección*</label>
              <input type="text" className="form-control" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold small mb-1">Ciudad*</label>
              <input type="text" className="form-control" value={ciudad} onChange={(e) => setCiudad(e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold small mb-1">Región*</label>
              <input type="text" className="form-control" value={region} onChange={(e) => setRegion(e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold small mb-1">Comuna*</label>
              <input type="text" className="form-control" value={comuna} onChange={(e) => setComuna(e.target.value)} />
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2">
            {direccionModificada || actualizadoExito ? (
              <>
                {!actualizadoExito && (
                  <button type="button" onClick={cancelarCambios} disabled={guardandoDir} className="btn btn-secondary btn-lg px-4 fw-bold shadow-sm">
                    Cancelar
                  </button>
                )}
                <button
                  type="button"
                  onClick={guardarDireccion}
                  disabled={guardandoDir || actualizadoExito}
                  className={`btn btn-lg px-4 fw-bold shadow-sm ${actualizadoExito ? 'btn-success' : 'btn-warning'}`}
                >
                  {actualizadoExito ? (
                    <><i className="bi bi-check-lg me-2"></i>Dirección actualizada</>
                  ) : guardandoDir ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span>Guardando...</>
                  ) : (
                    'Guardar cambios'
                  )}
                </button>
              </>
            ) : (
              <button onClick={iniciarPago} className="btn btn-success btn-lg px-4 fw-bold shadow-sm" style={{ backgroundColor: '#198754' }}>
                Pagar ahora ${totalPagar.toLocaleString('es-CL')}
              </button>
            )}
          </div>
        </div>
      )}

      {(paso === 'procesando' || paso === 'procesando_error') && (
        <div className="card border-0 shadow-sm p-5 bg-white mx-auto text-center rounded-4" style={{ maxWidth: '550px' }}>
          <div className="py-4">
            <div className="spinner-border text-success mb-3" style={{ width: '4rem', height: '4rem' }} role="status"></div>
            <h3 className="fw-bold text-dark mb-2">Procesando pago...</h3>
            <p className="text-muted mb-4">
              Por favor espere unos segundos mientras confirmamos su transacción con el banco.
            </p>

            <button
              onClick={simularErrorPago}
              disabled={paso === 'procesando_error'}
              className="btn btn-outline-danger btn-sm fw-bold px-3 py-2"
            >
              {paso === 'procesando_error' ? 'Rechazando...' : 'Simular error en el pago'}
            </button>
          </div>
        </div>
      )}

      {paso === 'boleta' && (
        <div className="card border-0 shadow-sm p-4 bg-white mx-auto rounded-4" style={{ maxWidth: '850px' }}>
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h3 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                <i className="bi bi-check-circle-fill text-success fs-2"></i>
                Se ha realizado la compra. nro. #{numeroOrdenFormateado}
              </h3>
              <p className="text-muted small">Resumen detallado de la transacción realizada</p>
            </div>
            <span className="badge bg-light text-dark border px-3 py-2 fw-semibold">
              Código orden: ORDER{numeroOrdenFormateado}
            </span>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <label className="form-label fw-semibold small mb-1">Nombre*</label>
              <input type="text" className="form-control bg-light" value={usuario?.first_name || usuario?.name || ''} disabled />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold small mb-1">Apellidos*</label>
              <input type="text" className="form-control bg-light" value={usuario?.last_name || ''} disabled />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold small mb-1">Correo*</label>
              <input type="email" className="form-control bg-light" value={usuario?.email || ''} disabled />
            </div>
          </div>

          <h6 className="fw-bold text-dark mb-2">Dirección de entrega de los productos</h6>
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label fw-semibold small mb-1">Dirección*</label>
              <input type="text" className="form-control bg-light" value={direccion} disabled />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold small mb-1">Ciudad*</label>
              <input type="text" className="form-control bg-light" value={ciudad} disabled />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold small mb-1">Región*</label>
              <input type="text" className="form-control bg-light" value={region} disabled />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold small mb-1">Comuna*</label>
              <input type="text" className="form-control bg-light" value={comuna} disabled />
            </div>
          </div>

          <div className="table-responsive mb-4">
            <table className="table align-middle">
              <thead className="table-light fs-6 fw-bold">
                <tr>
                  <th>Imagen</th>
                  <th>Nombre</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {carritoFinal.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <img src={obtenerImagenUrl(item)} alt={item.name || item.nombre} className="rounded object-fit-cover" style={{ width: '50px', height: '50px' }} />
                    </td>
                    <td className="fw-semibold text-dark">{item.name || item.nombre}</td>
                    <td>${obtenerPrecio(item).toLocaleString('es-CL')}</td>
                    <td className="fw-bold">{item.cantidad || 1}</td>
                    <td className="fw-bold text-dark">${(obtenerPrecio(item) * (item.cantidad || 1)).toLocaleString('es-CL')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-light p-3 text-center rounded-3 mb-4">
            <span className="fs-4 fw-bolder text-dark">
              Total pagado: ${totalPagar.toLocaleString('es-CL')}
            </span>
          </div>

          <div className="d-flex justify-content-center">
            <button onClick={manejarDescargarBoleta} className="btn btn-danger fw-bold px-4 py-2">
              Imprimir boleta en PDF
            </button>
          </div>
        </div>
      )}

      {paso === 'error' && (
        <div className="card border-0 shadow-sm p-4 bg-white mx-auto rounded-4 text-center" style={{ maxWidth: '850px' }}>
          <div className="py-3">
            <i className="bi bi-x-circle-fill text-danger display-1 mb-3"></i>
            <h3 className="fw-bold text-dark mb-2">
              No se pudo realizar el pago. nro. #{numeroOrdenFormateado}
            </h3>
            <p className="text-muted mb-4 fs-6">
              Ocurrió un problema durante la transacción con su entidad bancaria. El pedido ha sido cancelado.
            </p>

            <div className="d-flex justify-content-center gap-3">
              <Link to="/carrito" className="btn btn-primary btn-lg fw-bold px-4">
                Volver al carrito
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}