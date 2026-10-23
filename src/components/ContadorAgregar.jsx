import React, { useState } from 'react';

export default function ContadorAgregar({ producto, onAgregarAlCarrito }) {
  const [cantidad, setCantidad] = useState(1);

  const decrementar = () => setCantidad((prev) => Math.max(1, prev - 1));
  const incrementar = () => setCantidad((prev) => prev + 1);

  return (
    <div className="d-flex align-items-center gap-2 mt-2 w-100">
      <div className="input-group input-group-sm" style={{ width: '90px' }}>
        <button
          className="btn btn-outline-secondary px-2 fw-bold"
          type="button"
          onClick={decrementar}
        >
          -
        </button>
        <span className="form-control text-center px-1 bg-white fw-bold select-none d-flex align-items-center justify-content-center">
          {cantidad}
        </span>
        <button
          className="btn btn-outline-secondary px-2 fw-bold"
          type="button"
          onClick={incrementar}
        >
          +
        </button>
      </div>

      <button
        className="btn btn-primary btn-sm fw-semibold flex-grow-1 text-nowrap py-1 px-2"
        onClick={() => {
          onAgregarAlCarrito(producto, cantidad);
          setCantidad(1);
        }}
      >
        <i className="bi bi-cart-plus me-1"></i> Agregar
      </button>
    </div>
  );
}