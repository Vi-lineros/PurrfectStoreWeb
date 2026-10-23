import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Carrito({
  carrito = [],
  usuario = null,
  onActualizarCantidad,
  onEliminarProducto,
}) {
  const navigate = useNavigate();
  const [cantidadesEditadas, setCantidadesEditadas] = useState({});
  const [cargandoId, setCargandoId] = useState(null);

  const obtenerPrecio = (item) => Number(item.price ?? item.precio_nuevo ?? item.precio ?? 0);

  const obtenerImagenUrl = (item) => {
    if (Array.isArray(item.image) && item.image.length > 0) {
      return item.image[0].url || item.image[0];
    }
    if (typeof item.image === 'string') return item.image;
    return 'https://via.placeholder.com/100x100?text=Sin+Imagen';
  };

  const cambiarCantidadLocal = (id, delta, cantidadActual) => {
    const valorBase = cantidadesEditadas[id] !== undefined ? cantidadesEditadas[id] : cantidadActual;
    const nuevoValor = Math.max(1, valorBase + delta);
    setCantidadesEditadas((prev) => ({ ...prev, [id]: nuevoValor }));
  };

  const guardarEdicion = async (id) => {
    const nuevaCantidad = cantidadesEditadas[id];
    if (nuevaCantidad !== undefined) {
      setCargandoId(id);
      await onActualizarCantidad(id, nuevaCantidad);
      setCargandoId(null);

      setCantidadesEditadas((prev) => {
        const copia = { ...prev };
        delete copia[id];
        return copia;
      });
    }
  };

  const cancelarEdicion = (id) => {
    setCantidadesEditadas((prev) => {
      const copia = { ...prev };
      delete copia[id];
      return copia;
    });
  };

  const totalCarrito = carrito.reduce((acc, item) => {
    const qty = cantidadesEditadas[item.id] !== undefined ? cantidadesEditadas[item.id] : item.cantidad || 1;
    return acc + obtenerPrecio(item) * qty;
  }, 0);

  const manejarIrAPagar = () => {
    const token = localStorage.getItem('authToken_purrfect');

    if (!token || !usuario) {
      alert('Debes iniciar sesión o registrarte para realizar la compra.');
      navigate('/iniciar-sesion');
      return;
    }

    const dir = usuario.shipping_address;
    const tieneDireccion =
      dir &&
      (typeof dir === 'string'
        ? dir.trim().length > 0
        : dir.direccion && dir.direccion.trim().length > 0);

    if (!tieneDireccion) {
      alert('No detectamos una dirección de envío en tu perfil. Completa tu dirección antes de pagar.');
      return;
    }

    navigate('/checkout');
  };

  return (
    <main className="container py-5">
      <h1 className="fw-bold text-dark mb-4">Carrito de Compras</h1>

      {carrito.length === 0 ? (
        <div className="card border-0 shadow-sm p-5 text-center bg-white">
          <i className="bi bi-cart-x fs-1 text-muted mb-3"></i>
          <h4 className="fw-bold text-secondary mb-3">Tu carrito está vacío</h4>
          <p className="text-muted mb-4">
            Aún no has agregado productos a tu carrito de compras.
          </p>
          <div>
            <Link to="/productos" className="btn btn-primary px-4 fw-bold">
              Ver Catálogo de Productos
            </Link>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light fs-6 fw-bold border-bottom">
                <tr>
                  <th scope="col" className="ps-4 py-3" style={{ width: '120px' }}>Imagen</th>
                  <th scope="col" className="py-3">Nombre</th>
                  <th scope="col" className="py-3 text-center">Precio</th>
                  <th scope="col" className="py-3 text-center" style={{ width: '160px' }}>Cantidad</th>
                  <th scope="col" className="py-3 text-center">Subtotal</th>
                  <th scope="col" className="py-3 text-end pe-4" style={{ width: '200px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {carrito.map((item) => {
                  const precio = obtenerPrecio(item);
                  const cantidadMostrada = cantidadesEditadas[item.id] !== undefined ? cantidadesEditadas[item.id] : item.cantidad || 1;
                  const estaEditando = cantidadesEditadas[item.id] !== undefined && cantidadesEditadas[item.id] !== item.cantidad;
                  const subtotal = precio * cantidadMostrada;

                  return (
                    <tr key={item.id} className="border-bottom">
                      <td className="ps-4 py-3">
                        <img
                          src={obtenerImagenUrl(item)}
                          alt={item.name || 'Producto'}
                          className="rounded object-fit-cover"
                          style={{ width: '70px', height: '70px' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/100x100?text=PurrfectStore';
                          }}
                        />
                      </td>
                      <td className="py-3 fw-semibold text-dark">{item.name || item.nombre}</td>
                      <td className="py-3 text-center fw-medium">${precio.toLocaleString('es-CL')}</td>
                      <td className="py-3 text-center">
                        <div className="d-inline-flex align-items-center border rounded bg-light">
                          <button
                            className="btn btn-sm btn-light border-0 px-2 fw-bold"
                            onClick={() => cambiarCantidadLocal(item.id, -1, item.cantidad || 1)}
                            type="button"
                          >
                            -
                          </button>
                          <span className="px-3 fw-bold text-dark">{cantidadMostrada}</span>
                          <button
                            className="btn btn-sm btn-light border-0 px-2 fw-bold"
                            onClick={() => cambiarCantidadLocal(item.id, 1, item.cantidad || 1)}
                            type="button"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-3 text-center fw-bold text-dark">
                        ${subtotal.toLocaleString('es-CL')}
                      </td>
                      <td className="py-3 text-end pe-4">
                        {estaEditando ? (
                          <div className="d-flex justify-content-end gap-2">
                            <button
                              className="btn btn-success btn-sm px-3 fw-bold"
                              onClick={() => guardarEdicion(item.id)}
                              disabled={cargandoId === item.id}
                            >
                              {cargandoId === item.id ? '...' : 'Agregar'}
                            </button>
                            <button
                              className="btn btn-secondary btn-sm px-2 fw-medium"
                              onClick={() => cancelarEdicion(item.id)}
                              disabled={cargandoId === item.id}
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn btn-danger btn-sm px-3 fw-medium"
                            onClick={() => onEliminarProducto(item.id)}
                          >
                            Eliminar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="bg-light p-3 px-4 d-flex justify-content-end align-items-center border-top">
            <div className="fs-5 fw-bold text-dark me-3">Total</div>
            <div className="fs-4 fw-bolder text-dark">
              ${totalCarrito.toLocaleString('es-CL')}
            </div>
          </div>

          <div className="p-4 d-flex justify-content-end align-items-center bg-white">
            <button
              onClick={manejarIrAPagar}
              className="btn btn-success btn-lg px-4 py-2 fw-bold shadow-sm"
              style={{ backgroundColor: '#198754', borderColor: '#198754' }}
            >
              Ir a pagar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}