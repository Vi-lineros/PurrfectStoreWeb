import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import ProductCard from '../components/ProductCard';
import { productosIniciales } from '../data/productos';
import { obtenerProductos } from '../services/productosService';

export default function Home({ onAgregarAlCarrito }) {
  const [productos, setProductos] = useState(productosIniciales);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarDatos = async () => {
      const listaObtenida = await obtenerProductos();
      setProductos(listaObtenida);
      setCargando(false);
    };
    cargarDatos();
  }, []);

  const irACategoria = (nombreCategoria) => {
    navigate(`/categorias?cat=${encodeURIComponent(nombreCategoria)}`);
  };

  return (
    <main>
      <section className="mb-5">
        <div id="carouselHome" className="carousel slide" data-bs-ride="carousel">
          <div className="carousel-indicators">
            <button
              type="button"
              data-bs-target="#carouselHome"
              data-bs-slide-to="0"
              className="active"
              aria-current="true"
            ></button>
            <button type="button" data-bs-target="#carouselHome" data-bs-slide-to="1"></button>
            <button type="button" data-bs-target="#carouselHome" data-bs-slide-to="2"></button>
          </div>

          <div className="carousel-inner">
            <div
              className="carousel-item active position-relative"
              style={{ height: '420px', cursor: 'pointer' }}
              onClick={() => irACategoria('Alimentos')}
            >
              <img
                src="/img/slideimage1.jpg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/1200x420?text=Alimentos+Favoritos';
                }}
                className="d-block w-100 h-100 object-fit-cover"
                alt="Alimentos para gatos"
              />
              <div
                className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-end align-items-center text-white pb-4 text-center"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)' }}
              >
                <h2 className="fw-bold fs-1 mb-1">Alimentos favoritos</h2>
                <p className="fs-5 mb-0 text-light">
                  Encuentra aquí la mejor nutrición para tu gato.
                </p>
              </div>
            </div>

            <div
              className="carousel-item position-relative"
              style={{ height: '420px', cursor: 'pointer' }}
              onClick={() => irACategoria('Higiene y Arenas')}
            >
              <img
                src="/img/slideimage2.jpg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/1200x420?text=Higiene+y+Arenas';
                }}
                className="d-block w-100 h-100 object-fit-cover"
                alt="Arenas e higiene"
              />
              <div
                className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-end align-items-center text-white pb-4 text-center"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)' }}
              >
                <h2 className="fw-bold fs-1 mb-1">Higiene y Arenas</h2>
                <p className="fs-5 mb-0 text-light">
                  Las opciones de higiene sanitaria de alta calidad.
                </p>
              </div>
            </div>

            <div
              className="carousel-item position-relative"
              style={{ height: '420px', cursor: 'pointer' }}
              onClick={() => irACategoria('Juguetes')}
            >
              <img
                src="/img/slideimage3.jpg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/1200x420?text=Juguetes+para+gatos';
                }}
                className="d-block w-100 h-100 object-fit-cover"
                alt="Juguetes felinos"
              />
              <div
                className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-end align-items-center text-white pb-4 text-center"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)' }}
              >
                <h2 className="fw-bold fs-1 mb-1">Juguetes para gatos</h2>
                <p className="fs-5 mb-0 text-light">
                  Diversión asegurada para mantener activo a tu felino.
                </p>
              </div>
            </div>
          </div>

          <button className="carousel-control-prev" type="button" data-bs-target="#carouselHome" data-bs-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#carouselHome" data-bs-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
          </button>
        </div>
      </section>

      <section className="container mb-5">
        <h2 className="text-center fw-bold mb-4 text-uppercase text-white" style={{ fontSize: '1.8rem' }}>
          CATEGORÍAS DESTACADAS
        </h2>
        
        <div className="row row-cols-1 row-cols-md-3 g-4">
          <div className="col">
            <button
              onClick={() => irACategoria('Alimentos')}
              className="card h-100 text-center border-0 bg-light p-4 shadow-sm w-100 btn text-start"
            >
              <div className="text-center w-100">
                <i className="bi bi-basket3-fill fs-1 text-primary mb-2 d-block"></i>
                <h5 className="fw-bold text-dark mb-1">Alimentos</h5>
                <p className="text-muted small mb-0">Nutrición balanceada seca y húmeda.</p>
              </div>
            </button>
          </div>

          <div className="col">
            <button
              onClick={() => irACategoria('Higiene y Arenas')}
              className="card h-100 text-center border-0 bg-light p-4 shadow-sm w-100 btn text-start"
            >
              <div className="text-center w-100">
                <i className="bi bi-box2-heart-fill fs-1 text-primary mb-2 d-block"></i>
                <h5 className="fw-bold text-dark mb-1">Higiene y Arenas</h5>
                <p className="text-muted small mb-0">Arenas sanitarias y accesorios limpiadores.</p>
              </div>
            </button>
          </div>

          <div className="col">
            <button
              onClick={() => irACategoria('Juguetes')}
              className="card h-100 text-center border-0 bg-light p-4 shadow-sm w-100 btn text-start"
            >
              <div className="text-center w-100">
                <i className="bi bi-controller fs-1 text-primary mb-2 d-block"></i>
                <h5 className="fw-bold text-dark mb-1">Juguetes</h5>
                <p className="text-muted small mb-0">Cañas, ratones con catnip y rascadores.</p>
              </div>
            </button>
          </div>
        </div>

        <div className="text-center mt-4">
          <Link to="/productos" className="btn btn-primary btn-lg fw-bold px-4">
            Ver Catálogo Completo
          </Link>
        </div>
      </section>

      <section id="catalogo" className="container py-4">
        <h2 className="text-center fw-bold mb-4 text-uppercase text-white" style={{ fontSize: '1.8rem' }}>
          PRODUCTOS DESTACADOS
        </h2>

        {cargando ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted">Cargando productos...</p>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-4">
            {productos.slice(0, 4).map((prod) => (
              <ProductCard
                key={prod.id}
                producto={prod}
                onAgregarAlCarrito={onAgregarAlCarrito}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}