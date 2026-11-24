import React, { useState, useRef } from 'react';
import { XANO_ECOMMERCE_URL } from '../../config/xano';

export default function AdminProductos({ productosAdmin, cargando, onRecargar }) {
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const [modoEdicion, setModoEdicion] = useState(false);
  const [formProd, setFormProd] = useState({
    id: null,
    name: '',
    description: '',
    price: '',
    stock: '',
    brand: '',
    category: 'Alimentos',
    nuevasImagenes: [],
    imagenesExistentes: []
  });

  const fileInputRef = useRef(null);

  const obtenerUrlImagen = (img) => {
    if (!img) return '';
    if (typeof img === 'string') return img;
    if (img.url) return img.url;
    if (img.path) {
      if (img.path.startsWith('http')) return img.path;
      try {
        const urlBase = new URL(XANO_ECOMMERCE_URL).origin;
        return `${urlBase}${img.path}`;
      } catch (e) {
        return img.path;
      }
    }
    return '';
  };

  const subirImagenXano = async (file) => {
    const formData = new FormData();
    formData.append('content', file);

    const token = localStorage.getItem('authToken_purrfect');
    const res = await fetch(`${XANO_ECOMMERCE_URL}/upload/image`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });

    if (!res.ok) {
      throw new Error('Error al subir la imagen.');
    }

    const data = await res.json();
    return data;
  };

  const handleAgregarArchivos = (e) => {
    const archivosSeleccionados = Array.from(e.target.files);
    if (archivosSeleccionados.length > 0) {
      setFormProd((prev) => ({
        ...prev,
        nuevasImagenes: [...prev.nuevasImagenes, ...archivosSeleccionados]
      }));
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleQuitarImagenExistente = (index) => {
    setFormProd((prev) => ({
      ...prev,
      imagenesExistentes: prev.imagenesExistentes.filter((_, i) => i !== index)
    }));
  };

  const handleQuitarNuevaImagen = (index) => {
    setFormProd((prev) => ({
      ...prev,
      nuevasImagenes: prev.nuevasImagenes.filter((_, i) => i !== index)
    }));
  };

  const handleGuardarProducto = async (e) => {
    e.preventDefault();
    setSubiendo(true);
    setMensaje('');

    try {
      let arregloImagenesFinal = [...formProd.imagenesExistentes];

      if (formProd.nuevasImagenes.length > 0) {
        for (const file of formProd.nuevasImagenes) {
          const resultadoSubida = await subirImagenXano(file);
          const objetoSubido = Array.isArray(resultadoSubida) ? resultadoSubida[0] : resultadoSubida;
          if (objetoSubido) {
            arregloImagenesFinal.push(objetoSubido);
          }
        }
      }

      const payload = {
        name: formProd.name,
        description: formProd.description,
        price: Number(formProd.price),
        stock: Number(formProd.stock),
        brand: formProd.brand,
        category: formProd.category,
        image: arregloImagenesFinal
      };

      const token = localStorage.getItem('authToken_purrfect');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      if (modoEdicion && formProd.id) {
        const res = await fetch(`${XANO_ECOMMERCE_URL}/product/${formProd.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('No se pudo actualizar el producto.');
        setMensaje('Producto modificado con éxito.');
      } else {
        const res = await fetch(`${XANO_ECOMMERCE_URL}/product`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('No se pudo crear el producto.');
        setMensaje('Producto agregado con éxito.');
      }

      limpiarFormulario();
      await onRecargar();

    } catch (err) {
      setMensaje(err.message || 'Ocurrió un error al procesar el producto.');
    } finally {
      setSubiendo(false);
      setTimeout(() => setMensaje(''), 4000);
    }
  };

  const handleIniciarEdicion = (prod) => {
    setModoEdicion(true);

    let imgs = [];
    if (Array.isArray(prod.image)) {
      imgs = prod.image;
    } else if (prod.image) {
      imgs = [prod.image];
    }

    setFormProd({
      id: prod.id,
      name: prod.name || prod.nombre || '',
      description: prod.description || prod.descripcion || '',
      price: prod.price || prod.precio || '',
      stock: prod.stock ?? 0,
      brand: prod.brand || prod.marca || '',
      category: prod.category || prod.categoria || 'Alimentos',
      nuevasImagenes: [],
      imagenesExistentes: imgs
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminarProducto = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken_purrfect');
      const res = await fetch(`${XANO_ECOMMERCE_URL}/product/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (!res.ok) throw new Error('Error al eliminar el producto.');

      setMensaje('Producto eliminado correctamente.');
      await onRecargar();
    } catch (err) {
      setMensaje('No se pudo eliminar el producto.');
    } finally {
      setTimeout(() => setMensaje(''), 3000);
    }
  };

  const limpiarFormulario = () => {
    setModoEdicion(false);
    setFormProd({
      id: null,
      name: '',
      description: '',
      price: '',
      stock: '',
      brand: '',
      category: 'Alimentos',
      nuevasImagenes: [],
      imagenesExistentes: []
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-secondary mb-0">Gestión de Productos (CRUD)</h2>
        <button
          className="btn btn-outline-primary btn-sm"
          onClick={onRecargar}
          disabled={cargando}
        >
          {cargando ? 'Cargando...' : 'Recargar Datos'}
        </button>
      </div>

      {mensaje && <div className="alert alert-info py-2">{mensaje}</div>}

      <div className="card shadow-sm mb-4 p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">{modoEdicion ? 'Modificar Producto' : 'Agregar Nuevo Producto'}</h5>
          {modoEdicion && (
            <button className="btn btn-sm btn-outline-secondary" onClick={limpiarFormulario}>
              Cancelar Edición
            </button>
          )}
        </div>

        <form onSubmit={handleGuardarProducto} className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Nombre del Producto</label>
            <input
              type="text"
              className="form-control"
              value={formProd.name}
              onChange={(e) => setFormProd({ ...formProd, name: e.target.value })}
              placeholder="Ej. Rascador Grande"
              required
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Categoría</label>
            <select
              className="form-select"
              value={formProd.category}
              onChange={(e) => setFormProd({ ...formProd, category: e.target.value })}
            >
              <option value="Alimentos">Alimentos</option>
              <option value="Accesorios decorativos">Accesorios decorativos</option>
              <option value="Higiene y Arenas">Higiene y Arenas</option>
              <option value="Comodidad">Comodidad</option>
              <option value="Juguetes">Juguetes</option>
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">Marca</label>
            <input
              type="text"
              className="form-control"
              value={formProd.brand}
              onChange={(e) => setFormProd({ ...formProd, brand: e.target.value })}
              placeholder="Ej. Purina / Whiskas"
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Precio ($)</label>
            <input
              type="number"
              className="form-control"
              value={formProd.price}
              onChange={(e) => setFormProd({ ...formProd, price: e.target.value })}
              placeholder="9990"
              required
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Stock</label>
            <input
              type="number"
              className="form-control"
              value={formProd.stock}
              onChange={(e) => setFormProd({ ...formProd, stock: e.target.value })}
              placeholder="10"
              required
            />
          </div>

          <div className="col-md-10">
            <label className="form-label">Descripción</label>
            <input
              type="text"
              className="form-control"
              value={formProd.description}
              onChange={(e) => setFormProd({ ...formProd, description: e.target.value })}
              placeholder="Descripción del producto"
            />
          </div>

          <div className="col-12">
            <label className="form-label fw-bold d-block">Imágenes del Producto</label>
            
            <input
              ref={fileInputRef}
              type="file"
              className="d-none"
              accept="image/*"
              multiple
              onChange={handleAgregarArchivos}
            />

            <button
              type="button"
              className="btn btn-outline-secondary mb-2"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
            >
              Seleccionar archivos
            </button>

            <div className="d-flex flex-wrap gap-3 mt-2">
              {formProd.imagenesExistentes.map((img, idx) => (
                <div
                  key={`exist-${idx}`}
                  className="border rounded p-2 bg-white shadow-sm text-center d-flex flex-column align-items-center"
                  style={{ width: '120px' }}
                >
                  <img
                    src={obtenerUrlImagen(img)}
                    alt={`Imagen ${idx + 1}`}
                    className="rounded mb-2"
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    className="btn btn-danger btn-sm w-100 py-1"
                    style={{ fontSize: '12px' }}
                    onClick={() => handleQuitarImagenExistente(idx)}
                  >
                    Quitar
                  </button>
                </div>
              ))}

              {formProd.nuevasImagenes.map((file, idx) => (
                <div
                  key={`new-${idx}`}
                  className="border rounded p-2 bg-white shadow-sm text-center d-flex flex-column align-items-center"
                  style={{ width: '120px' }}
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Nueva ${idx + 1}`}
                    className="rounded mb-2"
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    className="btn btn-danger btn-sm w-100 py-1"
                    style={{ fontSize: '12px' }}
                    onClick={() => handleQuitarNuevaImagen(idx)}
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="col-12 text-end mt-4">
            <button type="submit" className="btn btn-success px-4" disabled={subiendo}>
              {subiendo ? 'Guardando...' : (modoEdicion ? 'Actualizar Producto' : 'Guardar Producto')}
            </button>
          </div>
        </form>
      </div>

      <div className="card shadow-sm p-3">
        <h5 className="mb-3">Catálogo Actual</h5>
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosAdmin.map((prod) => (
                <tr key={prod.id}>
                  <td>#{prod.id}</td>
                  <td className="fw-bold">{prod.name || prod.nombre}</td>
                  <td>
                    <span className="badge bg-secondary">
                      {prod.category || prod.categoria || 'Sin Cat.'}
                    </span>
                  </td>
                  <td>${Number(prod.price || prod.precio || 0).toLocaleString('es-CL')}</td>
                  <td>{prod.stock ?? 0}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => handleIniciarEdicion(prod)}
                      >
                        Modificar
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleEliminarProducto(prod.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}