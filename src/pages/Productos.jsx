import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productosIniciales } from '../data/productos';
import { obtenerProductos } from '../services/productosService';

const normalizar = (texto) => {
  if (!texto) return '';
  return texto
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

export default function Productos({ onAgregarAlCarrito }) {
  const [searchParams] = useSearchParams();
  const categoriaActiva = searchParams.get('cat') || 'Catálogo completo';
  const terminoBusquedaURL = searchParams.get('search') || '';

  const [productos, setProductos] = useState(productosIniciales);
  const [cargando, setCargando] = useState(true);
  const [orden, setOrden] = useState('relevancia');

  useEffect(() => {
    const cargarLista = async () => {
      const datos = await obtenerProductos();
      setProductos(datos);
      setCargando(false);
    };
    cargarLista();
  }, []);

  const productosFiltrados = productos.filter((prod) => {
    const catProducto = normalizar(prod.category || prod.categoria);
    const nombreProducto = normalizar(prod.name || prod.nombre);
    const descProducto = normalizar(prod.description || prod.descripcion);
    
    const catBuscada = normalizar(categoriaActiva);
    const textoBuscado = normalizar(terminoBusquedaURL);

    const coincideCategoria =
      categoriaActiva === 'Catálogo completo' ||
      catProducto.includes(catBuscada) ||
      catBuscada.includes(catProducto);

    const coincideBusqueda =
      textoBuscado === '' ||
      nombreProducto.includes(textoBuscado) ||
      descProducto.includes(textoBuscado);

    return coincideCategoria && coincideBusqueda;
  });

  const productosOrdenados = [...productosFiltrados].sort((a, b) => {
    const precioA = Number(a.price ?? a.precio_nuevo ?? a.precio ?? 0);
    const precioB = Number(b.price ?? b.precio_nuevo ?? b.precio ?? 0);
    const nombreA = (a.name || a.nombre || '').toLowerCase();
    const nombreB = (b.name || b.nombre || '').toLowerCase();

    if (orden === 'precio-menor') return precioA - precioB;
    if (orden === 'precio-mayor') return precioB - precioA;
    if (orden === 'nombre-az') return nombreA.localeCompare(nombreB);
    if (orden === 'nombre-za') return nombreB.localeCompare(nombreA);
    return 0;
  });

  return (
    <main className="container py-5">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-3">
        <div>
          <h1 className="fw-bold mb-1 text-muted" style={{ fontSize: '2.2rem' }}>
            {categoriaActiva}
          </h1>
          <p className="text-muted mb-0 fs-6">
            {productosOrdenados.length} producto(s) encontrado(s)
          </p>
        </div>

        <div style={{ minWidth: '220px' }}>
          <select
            className="form-select bg-white border-secondary-subtle"
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
          >
            <option value="relevancia">Ordenar por: Relevancia</option>
            <option value="precio-menor">Precio: Menor a Mayor</option>
            <option value="precio-mayor">Precio: Mayor a Menor</option>
            <option value="nombre-az">Nombre: A - Z</option>
            <option value="nombre-za">Nombre: Z - A</option>
          </select>
        </div>
      </div>

      {cargando ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3 text-muted">Cargando catálogo...</p>
        </div>
      ) : productosOrdenados.length === 0 ? (
        <div className="text-center py-5 bg-white rounded shadow-sm border p-4">
          <i className="bi bi-search fs-1 text-muted mb-3 d-block"></i>
          <h4 className="fw-bold text-dark">No se encontraron productos</h4>
          <p className="text-muted mb-0">
            No hay coincidencias para la categoría "{categoriaActiva}"
            {terminoBusquedaURL && ` ni para "${terminoBusquedaURL}"`}.
          </p>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {productosOrdenados.map((prod) => (
            <ProductCard
              key={prod.id}
              producto={prod}
              onAgregarAlCarrito={onAgregarAlCarrito}
            />
          ))}
        </div>
      )}
    </main>
  );
}