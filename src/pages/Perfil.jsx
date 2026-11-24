import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { XANO_ECOMMERCE_URL } from '../config/xano';

export default function Perfil({ usuario, onActualizarUsuario }) {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [comuna, setComuna] = useState('');
  const [region, setRegion] = useState('Región Metropolitana');

  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    if (!usuario) {
      navigate('/login');
      return;
    }

    setNombre(usuario.name || usuario.nombre || '');
    setTelefono(usuario.phone || usuario.telefono || '');

    const envio = usuario.shipping_address;
    if (envio && typeof envio === 'object') {
      setDireccion(envio.direccion || '');
      setComuna(envio.comuna || '');
      setRegion(envio.region || 'Región Metropolitana');
    } else if (typeof envio === 'string') {
      setDireccion(envio);
    }
  }, [usuario, navigate]);

  if (!usuario) return null;

  const esAdmin =
    (usuario.role || usuario.rol || '').toLowerCase() === 'admin';

  const handleGuardarPerfil = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      const token = localStorage.getItem('authToken_purrfect');
      const payload = {
        name: nombre.trim(),
        phone: telefono.trim(),
        shipping_address: {
          direccion: direccion.trim(),
          comuna: comuna.trim(),
          region: region.trim()
        }
      };

      const res = await fetch(`${XANO_ECOMMERCE_URL}/user/${usuario.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('No se pudieron actualizar los datos en el servidor.');
      }

      const dataActualizada = await res.json();

      const usuarioFinal = {
        ...usuario,
        ...dataActualizada,
        ...payload
      };

      localStorage.setItem('usuario_purrfect', JSON.stringify(usuarioFinal));
      if (onActualizarUsuario) {
        onActualizarUsuario(usuarioFinal);
      }

      setMensaje({
        tipo: 'success',
        texto: '¡Datos de perfil y dirección guardados correctamente!'
      });
    } catch (err) {
      setMensaje({
        tipo: 'danger',
        texto: err.message || 'Ocurrió un error al guardar tu perfil.'
      });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center py-3">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-person-circle fs-4"></i>
                <h4 className="mb-0">Mi Perfil</h4>
              </div>
              <span className={`badge ${esAdmin ? 'bg-warning text-dark' : 'bg-primary'}`}>
                {esAdmin ? 'Administrador' : 'Cliente'}
              </span>
            </div>

            <div className="card-body p-4">
              {mensaje.texto && (
                <div className={`alert alert-${mensaje.tipo} alert-dismissible fade show`} role="alert">
                  {mensaje.texto}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setMensaje({ tipo: '', texto: '' })}
                  ></button>
                </div>
              )}

              <p className="text-muted small mb-4">
                Completa o actualiza tu información personal y dirección de despacho para agilizar tus compras en PurrfectStore.
              </p>

              <form onSubmit={handleGuardarPerfil} className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label fw-bold">Nombre Completo</label>
                  <input
                    type="text"
                    className="form-control"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Camila Soto"
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-bold">Correo Electrónico</label>
                  <input
                    type="email"
                    className="form-control bg-light"
                    value={usuario.email || ''}
                    disabled
                    readOnly
                  />
                  <small className="text-muted">Vinculado a tu cuenta de acceso.</small>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-bold">Teléfono de Contacto</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Ej. +56 9 8765 4321"
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-bold">Región</label>
                  <select
                    className="form-select"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                  >
                    <option value="Región Metropolitana">Región Metropolitana</option>
                    <option value="Valparaíso">Valparaíso</option>
                    <option value="Biobío">Biobío</option>
                    <option value="Coquimbo">Coquimbo</option>
                    <option value="O'Higgins">O'Higgins</option>
                    <option value="Maule">Maule</option>
                    <option value="La Araucanía">La Araucanía</option>
                    <option value="Los Lagos">Los Lagos</option>
                  </select>
                </div>

                <div className="col-12 col-md-8">
                  <label className="form-label fw-bold">Dirección de Envío (Calle y Número)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Ej. Av. Esquina Blanca 501, Depto 402"
                    required
                  />
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label fw-bold">Comuna</label>
                  <input
                    type="text"
                    className="form-control"
                    value={comuna}
                    onChange={(e) => setComuna(e.target.value)}
                    placeholder="Ej. Maipú"
                    required
                  />
                </div>

                <div className="col-12 d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                  <Link to="/productos" className="btn btn-outline-secondary">
                    Volver a la tienda
                  </Link>

                  <button type="submit" className="btn btn-primary px-4" disabled={guardando}>
                    {guardando ? 'Guardando cambios...' : 'Guardar Perfil'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}