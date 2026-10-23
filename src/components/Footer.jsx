import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-dark text-light mt-5">
      <div className="w-100" style={{ height: '300px' }}>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d795.8652023171296!2d-70.6151711566251!3d-33.4328796238235!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662c586497835ad%3A0xa929ba68e1ac6051!2sDuoc%20UC%20Casa%20Central!5e1!3m2!1ses!2scl!4v1722850059541!5m2!1ses!2scl"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          title="Ubicación Duoc UC"
        ></iframe>
      </div>

      <div className="py-3 text-center">
        <p className="mb-0 text-secondary small">
          &copy; 2026 PurrfectStore &mdash; Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}