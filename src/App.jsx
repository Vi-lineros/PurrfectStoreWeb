import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Productos from './pages/Productos';
import DetalleProducto from './pages/DetalleProducto';
import Carrito from './pages/Carrito';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Nosotros from './pages/Nosotros';
import Contacto from './pages/Contacto';

// Importación de la vista de Administración
import AdminDashboard from './pages/admin/AdminDashboard';

import { XANO_ECOMMERCE_URL } from './config/xano';

// Componente interno para gestionar la visibilidad del Navbar/Footer público
function AppContent({
  carrito,
  carritoId,
  usuario,
  setUsuario,
  iniciarSesion,
  cerrarSesion,
  agregarAlCarrito,
  actualizarCantidadProducto,
  eliminarProducto,
  calcularTotalCarrito,
  completarPedidoAprobado,
  completarPedidoRechazado,
}) {
  const location = useLocation();
  const esRutaAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Oculta el Navbar público si estamos en /admin */}
      {!esRutaAdmin && (
        <Navbar
          carritoTotal={calcularTotalCarrito()}
          usuario={usuario}
          onCerrarSesion={cerrarSesion}
        />
      )}

      <div className="flex-grow-1">
        <Routes>
          {/* --- RUTAS PÚBLICAS --- */}
          <Route path="/" element={<Home onAgregarAlCarrito={agregarAlCarrito} />} />
          <Route path="/productos" element={<Productos onAgregarAlCarrito={agregarAlCarrito} />} />
          <Route path="/categorias" element={<Productos onAgregarAlCarrito={agregarAlCarrito} />} />
          <Route path="/producto/:id" element={<DetalleProducto onAgregarAlCarrito={agregarAlCarrito} />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/contacto" element={<Contacto usuario={usuario} />} />
          <Route
            path="/carrito"
            element={
              <Carrito
                carrito={carrito}
                usuario={usuario}
                onActualizarCantidad={actualizarCantidadProducto}
                onEliminarProducto={eliminarProducto}
              />
            }
          />
          <Route
            path="/checkout"
            element={
              <Checkout
                carrito={carrito}
                carritoId={carritoId}
                usuario={usuario}
                onCompletarPedido={completarPedidoAprobado}
                onRechazarPedido={completarPedidoRechazado}
                onActualizarUsuario={setUsuario}
              />
            }
          />
          <Route
            path="/iniciar-sesion"
            element={usuario ? <Navigate to="/" /> : <Login onLoginExitoso={iniciarSesion} />}
          />
          <Route
            path="/crear-sesion"
            element={usuario ? <Navigate to="/" /> : <Registro onRegistroExitoso={iniciarSesion} />}
          />

          {/* --- RUTA DE ADMINISTRACIÓN (Acceso directo por URL) --- */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* --- RUTA 404 POR DEFECTO --- */}
          <Route
            path="*"
            element={
              <div className="container text-center py-5">
                <h2 className="text-muted">404 - Página No Encontrada</h2>
              </div>
            }
          />
        </Routes>
      </div>

      {/* Oculta el Footer público si estamos en /admin */}
      {!esRutaAdmin && <Footer />}
    </div>
  );
}

export default function App() {
  const [carrito, setCarrito] = useState([]);
  const [carritoId, setCarritoId] = useState(null);
  const [usuario, setUsuario] = useState(null);

  const obtenerUserId = (usr) => {
    if (!usr) return null;
    return usr.id || usr.user_id || usr.user?.id || null;
  };

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario_purrfect');
    const tokenGuardado = localStorage.getItem('authToken_purrfect');

    if (usuarioGuardado && tokenGuardado) {
      try {
        setUsuario(JSON.parse(usuarioGuardado));
      } catch (err) {
        console.error('Error al restaurar sesión del usuario:', err);
      }
    }
  }, []);

  useEffect(() => {
    const userId = obtenerUserId(usuario);

    if (userId) {
      obtenerOCrearCarritoActivo(userId);
    } else {
      setCarrito([]);
      setCarritoId(null);
    }
  }, [usuario]);

  const obtenerOCrearCarritoActivo = async (userId) => {
    if (!userId) return null;

    const token = localStorage.getItem('authToken_purrfect');
    const encabezados = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
      const respuesta = await fetch(`${XANO_ECOMMERCE_URL}/cart`, { headers: encabezados });
      const listaCarritos = await respuesta.json();

      let cartActivo = null;

      if (respuesta.ok && Array.isArray(listaCarritos)) {
        cartActivo = listaCarritos.find(
          (c) => String(c.user_id) === String(userId) && c.status === 'en proceso'
        );
      }

      if (!cartActivo) {
        const respuestaNueva = await fetch(`${XANO_ECOMMERCE_URL}/cart`, {
          method: 'POST',
          headers: encabezados,
          body: JSON.stringify({
            user_id: Number(userId),
            status: 'en proceso',
            total: 0,
            product_id: [],
          }),
        });

        if (respuestaNueva.ok) {
          cartActivo = await respuestaNueva.json();
        }
      }

      if (cartActivo && cartActivo.id) {
        setCarritoId(cartActivo.id);

        if (Array.isArray(cartActivo.product_id)) {
          const itemsFormateados = cartActivo.product_id.map((elemento) => ({
            ...(elemento.product_details || {}),
            id: elemento.product_id || elemento.product_details?.id,
            cantidad: elemento.quantity || 1,
          }));
          setCarrito(itemsFormateados);
        } else {
          setCarrito([]);
        }
        return cartActivo.id;
      }
    } catch (err) {
      console.error('Error al sincronizar el carrito con Xano:', err);
    }
    return null;
  };

  const sincronizarXano = async (idCart, nuevosProductos) => {
    if (!idCart) return false;

    const token = localStorage.getItem('authToken_purrfect');

    const totalCalculado = nuevosProductos.reduce((acumulado, prod) => {
      const precioItem = Number(prod.price ?? prod.precio_nuevo ?? prod.precio ?? 0);
      return acumulado + precioItem * (prod.cantidad || 1);
    }, 0);

    const arregloProductosPayload = nuevosProductos.map((prod) => ({
      quantity: prod.cantidad || 1,
      product_id: prod.id,
      product_details: {
        id: prod.id,
        name: prod.name || prod.nombre || '',
        image: prod.image || [],
        price: Number(prod.price ?? prod.precio_nuevo ?? prod.precio ?? 0),
        stock: prod.stock ?? 0,
        description: prod.description || '',
      },
    }));

    try {
      const respuesta = await fetch(`${XANO_ECOMMERCE_URL}/cart/${idCart}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          total: totalCalculado,
          product_id: arregloProductosPayload,
        }),
      });
      return respuesta.ok;
    } catch (err) {
      console.error('Error al actualizar el carrito en Xano:', err);
      return false;
    }
  };

  const completarPedidoAprobado = async () => {
    const userId = obtenerUserId(usuario);
    if (!carritoId || !userId) return false;

    const token = localStorage.getItem('authToken_purrfect');
    const encabezados = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
      const resPatch = await fetch(`${XANO_ECOMMERCE_URL}/cart/${carritoId}`, {
        method: 'PATCH',
        headers: encabezados,
        body: JSON.stringify({ status: 'aprobado' }),
      });

      if (!resPatch.ok) return false;

      const resNuevo = await fetch(`${XANO_ECOMMERCE_URL}/cart`, {
        method: 'POST',
        headers: encabezados,
        body: JSON.stringify({
          user_id: Number(userId),
          status: 'en proceso',
          total: 0,
          product_id: [],
        }),
      });

      if (resNuevo.ok) {
        const nuevoCart = await resNuevo.json();
        setCarritoId(nuevoCart.id);
        setCarrito([]);
        return true;
      }
    } catch (err) {
      console.error('Error al finalizar el pedido en Xano:', err);
    }
    return false;
  };

  const completarPedidoRechazado = async () => {
    const userId = obtenerUserId(usuario);
    if (!carritoId || !userId) return false;

    const token = localStorage.getItem('authToken_purrfect');
    const encabezados = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
      const resPatch = await fetch(`${XANO_ECOMMERCE_URL}/cart/${carritoId}`, {
        method: 'PATCH',
        headers: encabezados,
        body: JSON.stringify({ status: 'rechazado' }),
      });

      if (!resPatch.ok) return false;

      const resNuevo = await fetch(`${XANO_ECOMMERCE_URL}/cart`, {
        method: 'POST',
        headers: encabezados,
        body: JSON.stringify({
          user_id: Number(userId),
          status: 'en proceso',
          total: 0,
          product_id: [],
        }),
      });

      if (resNuevo.ok) {
        const nuevoCart = await resNuevo.json();
        setCarritoId(nuevoCart.id);
        setCarrito([]);
        return true;
      }
    } catch (err) {
      console.error('Error al rechazar compra en Xano:', err);
    }
    return false;
  };

  const iniciarSesion = (datosUsuario, token) => {
    localStorage.setItem('authToken_purrfect', token);
    localStorage.setItem('usuario_purrfect', JSON.stringify(datosUsuario));
    setUsuario(datosUsuario);
  };

  const cerrarSesion = () => {
    localStorage.removeItem('authToken_purrfect');
    localStorage.removeItem('usuario_purrfect');
    setUsuario(null);
    setCarrito([]);
    setCarritoId(null);
  };

  const agregarAlCarrito = async (producto, cantidadAAgregar = 1) => {
    const token = localStorage.getItem('authToken_purrfect');
    const userId = obtenerUserId(usuario);

    if (!token || !userId) {
      alert('Debes registrarte o iniciar sesión para agregar productos al carrito.');
      return false;
    }

    let idCartActual = carritoId || (await obtenerOCrearCarritoActivo(userId));

    if (!idCartActual) {
      alert('Error de conexión al sincronizar el carrito.');
      return false;
    }

    const existeProducto = carrito.find((item) => item.id === producto.id);
    let nuevoCarrito = [];

    if (existeProducto) {
      nuevoCarrito = carrito.map((item) =>
        item.id === producto.id
          ? { ...item, cantidad: (item.cantidad || 1) + cantidadAAgregar }
          : item
      );
    } else {
      nuevoCarrito = [...carrito, { ...producto, cantidad: cantidadAAgregar }];
    }

    setCarrito(nuevoCarrito);
    return await sincronizarXano(idCartActual, nuevoCarrito);
  };

  const actualizarCantidadProducto = async (idProducto, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      return eliminarProducto(idProducto);
    }

    const userId = obtenerUserId(usuario);
    let idCartActual = carritoId || (await obtenerOCrearCarritoActivo(userId));

    const nuevoCarrito = carrito.map((item) =>
      item.id === idProducto ? { ...item, cantidad: nuevaCantidad } : item
    );

    setCarrito(nuevoCarrito);
    return await sincronizarXano(idCartActual, nuevoCarrito);
  };

  const eliminarProducto = async (idProducto) => {
    const userId = obtenerUserId(usuario);
    let idCartActual = carritoId || (await obtenerOCrearCarritoActivo(userId));

    const nuevoCarrito = carrito.filter((item) => item.id !== idProducto);
    setCarrito(nuevoCarrito);
    return await sincronizarXano(idCartActual, nuevoCarrito);
  };

  const calcularTotalCarrito = () => {
    return carrito.reduce((acumulado, item) => {
      const precioUnitario = Number(item.price ?? item.precio_nuevo ?? item.precio ?? 0);
      return acumulado + precioUnitario * (item.cantidad || 1);
    }, 0);
  };

  return (
    <Router>
      <AppContent
        carrito={carrito}
        carritoId={carritoId}
        usuario={usuario}
        setUsuario={setUsuario}
        iniciarSesion={iniciarSesion}
        cerrarSesion={cerrarSesion}
        agregarAlCarrito={agregarAlCarrito}
        actualizarCantidadProducto={actualizarCantidadProducto}
        eliminarProducto={eliminarProducto}
        calcularTotalCarrito={calcularTotalCarrito}
        completarPedidoAprobado={completarPedidoAprobado}
        completarPedidoRechazado={completarPedidoRechazado}
      />
    </Router>
  );
}