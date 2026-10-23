import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function obtenerListaImagenes(producto) {
  if (!producto) return ['https://via.placeholder.com/400x300?text=PurrfectStore'];

  const rawImage = producto.image || producto.imagen || producto.images || producto.imagenes;
  if (!rawImage) return ['https://via.placeholder.com/400x300?text=PurrfectStore'];

  if (Array.isArray(rawImage) && rawImage.length > 0) {
    const urls = rawImage
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item?.url) return item.url;
        if (item?.path) return `https://x8ki-letl-twmt.n7.xano.io${item.path}`;
        return null;
      })
      .filter(Boolean);

    if (urls.length > 0) return urls;
  }

  if (typeof rawImage === 'object') {
    if (rawImage?.url) return [rawImage.url];
    if (rawImage?.path) return [`https://x8ki-letl-twmt.n7.xano.io${rawImage.path}`];
  }

  if (typeof rawImage === 'string' && rawImage.trim() !== '') {
    return [rawImage];
  }

  return ['https://via.placeholder.com/400x300?text=PurrfectStore'];
}

export default function ProductCard({ producto }) {
  const imagenes = obtenerListaImagenes(producto);
  const [indiceImagen, setIndiceImagen] = useState(0);

  useEffect(() => {
    if (imagenes.length <= 1) return;
    const intervalo = setInterval(() => {
      setIndiceImagen((prev) => (prev + 1) % imagenes.length);
    }, 5000);
    return () => clearInterval(intervalo);
  }, [imagenes]);

  const nombre = producto.name || producto.nombre || 'Producto sin nombre';
  const precio = producto.price ?? producto.precio_nuevo ?? producto.precio ?? 0;
  const categoria = producto.category || producto.categoria || 'Gatos';

  const descripcionBruta = producto.description || producto.descripcion || '';
  const descripcionCorta =
    descripcionBruta.length > 120
      ? descripcionBruta.substring(0, 120) + '...'
      : descripcionBruta;

  return (
    <div className="col">
      <div className="card h-100 shadow-sm border-0 position-relative">
        <div style={{ height: '220px', overflow: 'hidden', backgroundColor: '#f8f9fa' }}>
          <img
            src={imagenes[indiceImagen]}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/400x300?text=Sin+Imagen';
            }}
            className="card-img-top w-100 h-100 object-fit-cover"
            alt={nombre}
          />
        </div>

        <div className="card-body d-flex flex-column">
          <span className="badge bg-light text-dark align-self-start mb-2 border text-capitalize">
            {categoria}
          </span>
          <h6 className="card-title fw-bold text-truncate text-dark">
            {nombre}
          </h6>
          <p className="card-text text-muted small flex-grow-1">
            {descripcionCorta}
          </p>

          <div className="d-flex flex-column my-2">
            <span className="fs-5 fw-bold text-primary">
              ${precio ? precio.toLocaleString('es-CL') : '0'}
            </span>
          </div>

          <div className="d-grid mt-auto">
            <Link to={`/producto/${producto.id}`} className="btn btn-outline-dark btn-sm">
              Ver detalle
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}