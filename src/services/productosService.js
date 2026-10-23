import { XANO_ECOMMERCE_URL } from '../config/xano';
import { productosIniciales } from '../data/productos';

let productosCache = null;

export async function obtenerProductos() {
  if (productosCache && productosCache.length > 0) {
    return productosCache;
  }

  try {
    const respuesta = await fetch(`${XANO_ECOMMERCE_URL}/product`);
    
    if (respuesta.ok) {
      const datosServidor = await respuesta.json();
      
      if (Array.isArray(datosServidor) && datosServidor.length > 0) {
        productosCache = datosServidor;
        return productosCache;
      }
    }
  } catch (error) {
    console.warn('Error al conectar con Xano, utilizando datos locales de respaldo:', error);
  }

  productosCache = productosIniciales;
  return productosCache;
}