import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { XANO_ECOMMERCE_URL } from '../config/xano';

export default function DetalleProducto({ onAgregarAlCarrito }) {
  const { id } = useParams();

  const [producto, setProducto] = useState(null);
  const [imagenSeleccionada, setImagenSeleccionada] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  
  const [estadoBoton, setEstadoBoton] = useState('normal');

  useEffect(() => {
    const obtenerDetalle = async () => {
      setCargando(true);
      setError('');

      try {
        const respuesta = await fetch(`${XANO_ECOMMERCE_URL}/product/${id}`);
        const datos = await respuesta.json();

        if (respuesta.ok && datos) {
          setProducto(datos);
          configurarImagenPrincipal(datos);
        } else {
          setError('El producto consultado no existe o fue retirado.');
        }
      } catch (err) {
        setError('Error al obtener la información del producto.');
      } finally {
        setCargando(false);
      }
    };

    obtenerDetalle();
  }, [id]);

  const configurarImagenPrincipal = (prod) => {
    if (Array.isArray(prod.image) && prod.image.length > 0) {
      const url = prod.image[0].url || prod.image[0];
      setImagenSeleccionada(url);
    } else if (typeof prod.image === 'string') {
      setImagenSeleccionada(prod.image);
    } else {
      setImagenSeleccionada('https://via.placeholder.com/600x600?text=PurrfectStore');
    }
  };

  const decrementar = () => setCantidad((prev) => Math.max(1, prev - 1));
  const incrementar = () => {
    const stockMax = producto?.stock || 99;
    setCantidad((prev) => Math.min(stockMax, prev + 1));
  };

  const manejarClickAgregar = async () => {
    if (estadoBoton !== 'normal') return;

    setEstadoBoton('cargando');
    const resultado = await onAgregarAlCarrito(producto, cantidad);

    if (resultado !== false) {
      setEstadoBoton('exito');
      setTimeout(() => {
        setEstadoBoton('normal');
      }, 2000);
    } else {
      setEstadoBoton('normal');
    }
  };

  if (cargando) {
    return (
      <main className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3 text-muted fw-medium">Cargando producto...</p>
      </main>
    );
  }

  if (error || !producto) {
    return (
      <main className="container py-5">
        <div className="alert alert-danger text-center shadow-sm">
          {error || 'Producto no encontrado.'}
        </div>
        <div className="text-center mt-4">
          <Link to="/productos" className="btn btn-primary fw-bold">
            Volver al catálogo
          </Link>
        </div>
      </main>
    );
  }

  const precioUnitario = Number(producto.price ?? producto.precio_nuevo ?? producto.precio ?? 0);
  const imagenesArray = Array.isArray(producto.image) ? producto.image : [];

  return (
    <main className="container py-5">
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/productos">Productos</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{producto.name}</li>
        </ol>
      </nav>

      <div className="card shadow-sm border-0 rounded-3 overflow-hidden bg-white p-4">
        <div className="row g-4 align-items-start">
          
          <div className="col-md-6">
            <div className="bg-light rounded-3 p-4 text-center mb-3">
              <img
                src={imagenSeleccionada}
                alt={producto.name}
                className="img-fluid object-fit-contain"
                style={{ maxHeight: '400px', width: '100%' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/600x600?text=PurrfectStore';
                }}
              />
            </div>

            {imagenesArray.length > 1 && (
              <div className="d-flex gap-2 overflow-x-auto pb-2">
                {imagenesArray.map((imgObj, idx) => {
                  const urlMiniatura = imgObj.url || imgObj;
                  return (
                    <img
                      key={idx}
                      src={urlMiniatura}
                      alt={`Vista ${idx + 1}`}
                      className={`rounded border p-1 object-fit-cover ${
                        imagenSeleccionada === urlMiniatura ? 'border-primary border-2' : ''
                      }`}
                      style={{ width: '70px', height: '70px', cursor: 'pointer' }}
                      onClick={() => setImagenSeleccionada(urlMiniatura)}
                    />
                  );
                })}
              </div>
            )}
          </div>

          <div className="col-md-6 d-flex flex-column">
            {producto.category && (
              <span className="badge bg-secondary-subtle text-dark align-self-start mb-2 px-3 py-2 fs-6">
                {producto.category}
              </span>
            )}

            <h2 className="fw-bold text-dark mb-3">{producto.name}</h2>

            <div className="fs-2 fw-bold text-primary mb-3">
              ${precioUnitario.toLocaleString('es-CL')}
            </div>

            {producto.stock !== undefined && (
              <p className="small text-muted mb-3">
                Stock disponible: <span className="fw-bold text-dark">{producto.stock} unidades</span>
              </p>
            )}

            <hr />

            <h6 className="fw-bold text-dark mb-2">Descripción del producto:</h6>
            <p className="text-secondary mb-4 leading-relaxed">
              {producto.description || 'Sin descripción disponible.'}
            </p>

            <div className="d-flex align-items-center gap-3 mt-auto pt-3 border-top">
              <div className="input-group" style={{ width: '130px' }}>
                <button
                  className="btn btn-outline-secondary fw-bold"
                  type="button"
                  onClick={decrementar}
                  disabled={estadoBoton !== 'normal'}
                >
                  -
                </button>
                <input
                  type="text"
                  className="form-control text-center bg-white fw-bold"
                  readOnly
                  value={cantidad}
                />
                <button
                  className="btn btn-outline-secondary fw-bold"
                  type="button"
                  onClick={incrementar}
                  disabled={estadoBoton !== 'normal'}
                >
                  +
                </button>
              </div>

              <button
                className={`btn btn-lg flex-grow-1 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 ${
                  estadoBoton === 'exito' ? 'btn-success' : 'btn-primary'
                }`}
                onClick={manejarClickAgregar}
                disabled={estadoBoton === 'cargando'}
              >
                {estadoBoton === 'cargando' && (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    <span>Añadiendo...</span>
                  </>
                )}
                {estadoBoton === 'exito' && (
                  <>
                    <i className="bi bi-check-circle-fill fs-5"></i>
                    <span>Añadido al carrito</span>
                  </>
                )}
                {estadoBoton === 'normal' && (
                  <>
                    <i className="bi bi-cart-plus fs-5"></i>
                    <span>Añadir al carrito</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}