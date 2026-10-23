import React from 'react';

export default function Nosotros() {
  return (
    <main className="container py-5">
      <div className="card border-0 shadow-sm overflow-hidden bg-white mx-auto" style={{ maxWidth: '900px' }}>
        
        <img
          src="/img/aboutusimage.jpg"
          alt="Banner PurrfectStore"
          className="w-100 object-fit-cover"
          style={{ height: '280px' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/900x280?text=PurrfectStore+Banner';
          }}
        />

        <div className="card-body p-4 p-md-5">
          <h2 className="fw-bold text-dark text-center mb-4">Historia de PurrfectStore</h2>

          <div className="mb-4">
            <h4 className="fw-bold text-dark fs-5">Origen de la Tienda</h4>
            <p className="text-secondary lh-base">
              PurrfectStore nació con el objetivo de establecer un espacio digital exclusivamente dedicado al bienestar y cuidado integral de los felinos.
            </p>
          </div>

          <div className="mb-4">
            <h4 className="fw-bold text-dark fs-5">Especialización y Comunidad</h4>
            <p className="text-secondary lh-base">
              Evaluamos minuciosamente cada artículo de nuestro catálogo, asegurando estándares elevados de calidad en nutrición, higiene y accesorios.
            </p>
          </div>

          <div className="mb-4">
            <h4 className="fw-bold text-dark fs-5">Misión</h4>
            <p className="text-secondary lh-base">
              Proveer una experiencia de compra confiable y eficiente mediante la oferta de productos de calidad garantizada para gatos.
            </p>
          </div>

          <div className="mb-4">
            <h4 className="fw-bold text-dark fs-5">Visión</h4>
            <p className="text-secondary lh-base">
              Ser la plataforma e-commerce líder en el sector felino a nivel nacional, reconocida por la excelencia en la atención al cliente.
            </p>
          </div>

          <hr className="my-5" />

          <div className="row justify-content-center g-4 text-center">
            
            <div className="col-md-5 col-lg-4">
              <div className="d-flex flex-column align-items-center">
                <img
                  src="/img/profileimage1.jpg"
                  alt="Vicente Lineros"
                  className="rounded-circle object-fit-cover mb-3 shadow-sm"
                  style={{ width: '130px', height: '130px' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/130x130?text=Vicente';
                  }}
                />
                <h5 className="fw-bold text-dark mb-1">Vicente Lineros</h5>
                <span className="fw-semibold text-primary small mb-1">Desarrollador Lead / Fullstack</span>
                <p className="text-muted small mb-3">
                  Estudiante de Ingeniería en Informática en Duoc UC.
                </p>
                <div className="d-flex gap-2">
                  <a
                    href="https://github.com/Vi-lineros"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-dark btn-sm d-flex align-items-center justify-content-center"
                    style={{ width: '36px', height: '36px' }}
                    title="GitHub"
                  >
                    <i className="bi bi-github"></i>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/vicente-lineros-cabezas"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm d-flex align-items-center justify-content-center"
                    style={{ width: '36px', height: '36px', backgroundColor: '#0a66c2', borderColor: '#0a66c2' }}
                    title="LinkedIn"
                  >
                    <i className="bi bi-linkedin"></i>
                  </a>
                </div>
              </div>
            </div>

            <div className="col-md-5 col-lg-4">
              <div className="d-flex flex-column align-items-center">
                <img
                  src="/img/profileimage2.jpg"
                  alt="Paula Bellora"
                  className="rounded-circle object-fit-cover mb-3 shadow-sm"
                  style={{ width: '130px', height: '130px' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/130x130?text=Paula';
                  }}
                />
                <h5 className="fw-bold text-dark mb-1">Paula Bellora</h5>
                <span className="fw-semibold text-primary small mb-1">Diseñadora UI/UX & Frontend</span>
                <p className="text-muted small mb-3">
                  Estudiante de Ingeniería en Informática en Duoc UC.
                </p>
                <div className="d-flex gap-2">
                  <a
                    href="https://www.github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-dark btn-sm d-flex align-items-center justify-content-center"
                    style={{ width: '36px', height: '36px' }}
                    title="GitHub"
                  >
                    <i className="bi bi-github"></i>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/paula-bellora"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm d-flex align-items-center justify-content-center"
                    style={{ width: '36px', height: '36px', backgroundColor: '#0a66c2', borderColor: '#0a66c2' }}
                    title="LinkedIn"
                  >
                    <i className="bi bi-linkedin"></i>
                  </a>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </main>
  );
}