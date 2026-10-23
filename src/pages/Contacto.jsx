import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Contacto({ usuario = null }) {
  const [asunto, setAsunto] = useState('');
  const [tipo, setTipo] = useState('Consulta general');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensajeEnviado, setMensajeEnviado] = useState(false);

  const manejarEnvio = (e) => {
    e.preventDefault();
    if (!asunto.trim() || !mensaje.trim()) return;

    setCargando(true);

    setTimeout(() => {
      setCargando(false);
      setMensajeEnviado(true);
      setAsunto('');
      setMensaje('');

      setTimeout(() => {
        setMensajeEnviado(false);
      }, 5000);
    }, 1000);
  };

  return (
    <main className="container py-5">
      <div className="row g-4 justify-content-center">
        
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm p-4 bg-white rounded-4">
            <h3 className="fw-bold text-dark mb-1">Contacto y Feedback</h3>
            <p className="text-muted small mb-4">
              Envíanos tus dudas, sugerencias o comentarios sobre nuestros servicios felinos.
            </p>

            {mensajeEnviado && (
              <div className="alert alert-success d-flex align-items-center mb-4" role="alert">
                <i className="bi bi-check-circle-fill me-2 fs-5"></i>
                <div>
                  <strong>Mensaje enviado con éxito.</strong> Agradecemos tus comentarios, te responderemos a la brevedad.
                </div>
              </div>
            )}

            {!usuario ? (
              <div className="bg-light p-4 rounded-3 text-center my-3 border">
                <i className="bi bi-lock-fill fs-2 text-secondary mb-2 d-block"></i>
                <h5 className="fw-bold text-dark mb-2">Inicia sesión para enviar un mensaje</h5>
                <p className="text-muted small mb-3">
                  Para poder enviar una consulta o feedback necesitas contar con una cuenta registrada.
                </p>
                <div className="d-flex justify-content-center gap-2">
                  <Link to="/iniciar-sesion" className="btn btn-outline-primary fw-semibold px-3">
                    Iniciar sesión
                  </Link>
                  <Link to="/crear-sesion" className="btn btn-primary fw-semibold px-3">
                    Crear cuenta
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={manejarEnvio}>
                <div className="mb-3">
                  <label className="form-label fw-semibold small mb-1">Correo electrónico registrado</label>
                  <input
                    type="email"
                    className="form-control bg-light"
                    value={usuario.email || ''}
                    readOnly
                    disabled
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small mb-1">Tipo de mensaje</label>
                  <select
                    className="form-select"
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                  >
                    <option value="Consulta general">Consulta general</option>
                    <option value="Feedback / Sugerencia">Feedback / Sugerencia</option>
                    <option value="Soporte de pedido">Soporte sobre un pedido</option>
                    <option value="Reclamo">Reclamo</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small mb-1">Asunto*</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej. Duda sobre despacho o calidad de producto"
                    value={asunto}
                    onChange={(e) => setAsunto(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold small mb-1">Mensaje*</label>
                  <textarea
                    className="form-control"
                    rows="5"
                    placeholder="Escribe aquí tu mensaje o comentarios..."
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={cargando}
                  className="btn btn-primary w-100 fw-bold py-2 shadow-sm"
                >
                  {cargando ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Enviando mensaje...
                    </>
                  ) : (
                    'Enviar mensaje'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card border-0 shadow-sm p-4 bg-white rounded-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <h4 className="fw-bold text-dark mb-3">Atención al Cliente</h4>
              <p className="text-muted small mb-4">
                Puedes comunicarte con nosotros directamente a través de nuestros canales oficiales de soporte.
              </p>

              <div className="mb-3 d-flex align-items-start gap-3">
                <div className="text-primary p-2 rounded-circle">
                  <i className="bi bi-telephone-fill fs-5"></i>
                </div>
                <div>
                  <h6 className="fw-bold text-dark mb-0">Servicio Telefónico</h6>
                  <span className="text-muted small">+56 2 2987 6543</span>
                </div>
              </div>

              <div className="mb-3 d-flex align-items-start gap-3">
                <div className="text-primary p-2 rounded-circle">
                  <i className="bi bi-envelope-fill fs-5"></i>
                </div>
                <div>
                  <h6 className="fw-bold text-dark mb-0">Correo de Soporte</h6>
                  <span className="text-muted small">contacto@purrfectstore.cl</span>
                </div>
              </div>

              <div className="mb-4 d-flex align-items-start gap-3">
                <div className="text-primary p-2 rounded-circle">
                  <i className="bi bi-clock-fill fs-5"></i>
                </div>
                <div>
                  <h6 className="fw-bold text-dark mb-0">Horario de Atención</h6>
                  <span className="text-muted small">Lunes a Viernes: 09:00 - 18:00 hrs</span>
                </div>
              </div>
            </div>

            <div className="border-top pt-4 mt-3">
              <h6 className="fw-bold text-dark mb-3">Redes Sociales</h6>
              <div className="d-flex gap-2">
                <a
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-dark btn-sm d-flex align-items-center gap-2 px-3 rounded-pill"
                >
                  <i className="bi bi-instagram"></i>
                  <span>Instagram</span>
                </a>
                <a
                  href="https://www.facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-dark btn-sm d-flex align-items-center gap-2 px-3 rounded-pill"
                >
                  <i className="bi bi-facebook"></i>
                  <span>Facebook</span>
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}