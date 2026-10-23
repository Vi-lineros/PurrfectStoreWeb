import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { XANO_AUTH_URL, XANO_ECOMMERCE_URL } from '../config/xano';

export default function Registro({ onRegistroExitoso }) {
  const [formData, setFormData] = useState({
    name: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    ciudad: 'Santiago',
    region: 'Región Metropolitana de Santiago',
    comuna: 'Cerrillos',
    direccion: '',
  });

  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const manejarCambio = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    const payload = {
      name: formData.name,
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      shipping_address: {
        ciudad: formData.ciudad,
        region: formData.region,
        comuna: formData.comuna,
        direccion: formData.direccion,
      },
    };

    try {
      const resUser = await fetch(`${XANO_AUTH_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const dataUser = await resUser.json();

      if (!resUser.ok) {
        setError(dataUser.message || 'Error al crear la cuenta. Revisa los datos.');
        setCargando(false);
        return;
      }

      const usuarioCreado = dataUser.user;
      const token = dataUser.authToken;

      if (usuarioCreado && usuarioCreado.id) {
        try {
          await fetch(`${XANO_ECOMMERCE_URL}/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: usuarioCreado.id,
              status: 'en proceso',
              total: 0,
              product_id: [],
            }),
          });
        } catch (cartErr) {
          console.warn('Atención al inicializar el carrito automático:', cartErr);
        }
      }

      onRegistroExitoso(usuarioCreado, token);
      alert('¡Cuenta creada e inicializada con éxito!');
      navigate('/');
    } catch (err) {
      setError('Error de conexión al procesar el registro.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="container py-5">
      <div className="card shadow-sm border-0 rounded-3 overflow-hidden bg-white">
        <div className="row g-0">
          
          <div className="col-md-5 d-none d-md-block bg-light">
            <img
              src="/img/authimage.jpg"
              alt="Registro PurrfectStore"
              className="w-100 h-100 object-fit-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/600x400?text=PurrfectStore';
              }}
            />
          </div>

          <div className="col-md-7 p-4 p-lg-5">
            <h3 className="fw-bold text-dark mb-1">Registro de nuevo usuario</h3>
            <p className="text-muted small mb-4">Ingresa tus datos personales</p>

            {error && (
              <div className="alert alert-danger py-2 small mb-3" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={manejarSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label text-secondary small fw-medium">Nombre usuario*</label>
                  <input type="text" name="name" required className="form-control" placeholder="ej: vishoxd" value={formData.name} onChange={manejarCambio} />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-secondary small fw-medium">Teléfono*</label>
                  <input type="text" name="phone" required className="form-control" placeholder="+56912345678" value={formData.phone} onChange={manejarCambio} />
                </div>

                <div className="col-md-6">
                  <label className="form-label text-secondary small fw-medium">Nombre*</label>
                  <input type="text" name="first_name" required className="form-control" value={formData.first_name} onChange={manejarCambio} />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-secondary small fw-medium">Apellidos*</label>
                  <input type="text" name="last_name" required className="form-control" value={formData.last_name} onChange={manejarCambio} />
                </div>

                <div className="col-md-6">
                  <label className="form-label text-secondary small fw-medium">Correo*</label>
                  <input type="email" name="email" required className="form-control" value={formData.email} onChange={manejarCambio} />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-secondary small fw-medium">Contraseña*</label>
                  <input type="password" name="password" required className="form-control" value={formData.password} onChange={manejarCambio} />
                </div>
              </div>

              <hr className="my-4" />

              <h5 className="fw-bold text-dark mb-1">Dirección de entrega</h5>
              <p className="text-muted small mb-3">Ingrese dirección de forma detallada</p>

              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label className="form-label text-secondary small fw-medium">Ciudad*</label>
                  <input type="text" name="ciudad" required className="form-control" value={formData.ciudad} onChange={manejarCambio} />
                </div>
                <div className="col-md-4">
                  <label className="form-label text-secondary small fw-medium">Región*</label>
                  <select name="region" className="form-select" value={formData.region} onChange={manejarCambio}>
                    <option value="Región Metropolitana de Santiago">Región Metropolitana</option>
                    <option value="Región de Valparaíso">Región de Valparaíso</option>
                    <option value="Región del Bío-Bío">Región del Bío-Bío</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label text-secondary small fw-medium">Comuna*</label>
                  <select name="comuna" className="form-select" value={formData.comuna} onChange={manejarCambio}>
                    <option value="Cerrillos">Cerrillos</option>
                    <option value="Maipú">Maipú</option>
                    <option value="Providencia">Providencia</option>
                    <option value="Santiago">Santiago</option>
                    <option value="Las Condes">Las Condes</option>
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label text-secondary small fw-medium">Dirección*</label>
                  <textarea name="direccion" required className="form-control" rows="3" placeholder="Calle, número e indicaciones" value={formData.direccion} onChange={manejarCambio}></textarea>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-4">
                <Link to="/iniciar-sesion" className="small text-primary">
                  ¿Ya tienes cuenta? Inicia sesión
                </Link>
                <button type="submit" className="btn btn-primary px-5 fw-bold shadow-sm" disabled={cargando}>
                  {cargando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </main>
  );
}