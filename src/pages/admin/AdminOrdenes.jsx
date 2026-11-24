import React, { useState } from 'react';

export default function AdminOrdenes({ ordenesAdmin, cargando, onRecargar }) {
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-secondary mb-0">Historial de Órdenes y Boletas</h2>
        <button
          className="btn btn-outline-primary btn-sm"
          onClick={onRecargar}
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