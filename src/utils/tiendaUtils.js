export function calcularTotalCarrito(items) {
  if (!Array.isArray(items) || items.length === 0) return 0;
  return items.reduce((acumulado, item) => {
    const precioUnitario = Number(item.price || item.precio_nuevo || item.precio || 0);
    const cantidad = Number(item.cantidad || 1);
    return acumulado + precioUnitario * cantidad;
  }, 0);
}

export function normalizarTexto(texto) {
  if (!texto) return '';
  return texto
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function validarCorreo(email) {
  if (!email) return false;
  const formatoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return formatoValido.test(email);
}

export function formatearNumeroBoleta(id) {
  if (!id || isNaN(id)) return '000001';
  return String(id).padStart(6, '0');
}

export function validarDireccionEnvio(direccionObj) {
  if (!direccionObj) return false;
  if (typeof direccionObj === 'string') {
    return direccionObj.trim().length > 0;
  }
  return Boolean(
    direccionObj.direccion && direccionObj.direccion.trim().length > 0
  );
}

export function aplicarDescuento(precio, porcentajeDescuento) {
  if (precio <= 0) return 0;
  if (!porcentajeDescuento || porcentajeDescuento <= 0) return precio;
  const montoDescuento = (precio * porcentajeDescuento) / 100;
  return precio - montoDescuento;
}

export function filtrarPorCategoria(catalogo, categoriaBuscada) {
  if (!Array.isArray(catalogo)) return [];
  const catNormalizada = normalizarTexto(categoriaBuscada);
  return catalogo.filter((prod) =>
    normalizarTexto(prod.category || prod.categoria).includes(catNormalizada)
  );
}

export function eliminarProductoDelCarrito(carrito, idAEliminar) {
  if (!Array.isArray(carrito)) return [];
  return carrito.filter((item) => item.id !== idAEliminar);
}

export function actualizarCantidadProducto(carrito, idProducto, nuevaCantidad) {
  if (!Array.isArray(carrito)) return [];
  if (nuevaCantidad <= 0) {
    return eliminarProductoDelCarrito(carrito, idProducto);
  }
  return carrito.map((item) =>
    item.id === idProducto ? { ...item, cantidad: nuevaCantidad } : item
  );
}

export function comprobarStockDisponible(producto, cantidadDeseada) {
  if (!producto || typeof producto.stock !== 'number') return false;
  return cantidadDeseada > 0 && cantidadDeseada <= producto.stock;
}