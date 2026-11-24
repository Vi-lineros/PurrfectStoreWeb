import React from 'react';

export default function AdminMetricas({ metricas, cargando, errorCarga, onRecargar }) {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-secondary mb-0">Dashboard de Control</h2>
        <button
          className="btn btn-outline-primary btn-sm"
          onClick={onRecargar}
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
  );
}