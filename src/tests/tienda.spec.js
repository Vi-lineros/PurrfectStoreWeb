import {
  calcularTotalCarrito,
  normalizarTexto,
  validarCorreo,
  formatearNumeroBoleta,
  validarDireccionEnvio,
  aplicarDescuento,
  filtrarPorCategoria,
  eliminarProductoDelCarrito,
  actualizarCantidadProducto,
  comprobarStockDisponible
} from '../utils/tiendaUtils.js';

describe("Suite de Pruebas Unitarias - PurrfectStore (20 Casos)", function () {

  it("01 [ÉXITO] Debe calcular el total acumulado con precios y cantidades válidas", function () {
    const carrito = [
      { id: 1, name: "Alimento Seco 3kg", price: 15000, cantidad: 2 },
      { id: 2, name: "Arena Bionatura", price: 8000, cantidad: 1 }
    ];
    const resultado = calcularTotalCarrito(carrito);
    expect(resultado).toBe(38000);
  });

  it("02 [ERROR/BORDE] Debe retornar $0 cuando el carrito está vacío o no es un arreglo", function () {
    expect(calcularTotalCarrito([])).toBe(0);
    expect(calcularTotalCarrito(null)).toBe(0);
  });

  it("03 [ÉXITO] Debe transformar textos con mayúsculas y tildes a minúsculas limpias", function () {
    const entrada = "Alimentó FÉLINO Premium";
    const resultado = normalizarTexto(entrada);
    expect(resultado).toBe("alimento felino premium");
  });

  it("04 [ERROR/BORDE] Debe retornar una cadena vacía si se ingresa null, undefined o texto vacío", function () {
    expect(normalizarTexto(null)).toBe("");
    expect(normalizarTexto(undefined)).toBe("");
    expect(normalizarTexto("   ")).toBe("");
  });

  it("05 [ÉXITO] Debe aceptar correos electrónicos con formato estándar correcto", function () {
    const correoValido = "cliente.gato@purrfectstore.cl";
    expect(validarCorreo(correoValido)).toBeTrue();
  });

  it("06 [ERROR/BORDE] Debe rechazar correos que no contengan arroba o dominio válido", function () {
    expect(validarCorreo("correo_sin_arroba.com")).toBeFalse();
    expect(validarCorreo("usuario@dominiosinpunto")).toBeFalse();
  });

  it("07 [ÉXITO] Debe anteponer ceros a la izquierda para completar un formato de 6 dígitos", function () {
    const idBoleta = 89;
    const resultado = formatearNumeroBoleta(idBoleta);
    expect(resultado).toBe("000089");
  });

  it("08 [ERROR/BORDE] Debe retornar '000001' por defecto si el ID recibido es nulo o no numérico", function () {
    expect(formatearNumeroBoleta(null)).toBe("000001");
    expect(formatearNumeroBoleta("texto_invalido")).toBe("000001");
  });

  it("09 [ÉXITO] Debe validar como verdadera una dirección que incluya calle y número", function () {
    const direccionValida = { direccion: "Av. Esquina Blanca 501", comuna: "Maipú" };
    expect(validarDireccionEnvio(direccionValida)).toBeTrue();
  });

  it("10 [ERROR/BORDE] Debe rechazar direcciones vacías o compuestas únicamente por espacios", function () {
    const direccionInvalida = { direccion: "    ", comuna: "Santiago" };
    expect(validarDireccionEnvio(direccionInvalida)).toBeFalse();
    expect(validarDireccionEnvio(null)).toBeFalse();
  });

  it("11 [ÉXITO] Debe aplicar correctamente un 20% de descuento sobre el precio base", function () {
    const precioBase = 20000;
    const descuento = 20;
    const precioFinal = aplicarDescuento(precioBase, descuento);
    expect(precioFinal).toBe(16000);
  });

  it("12 [ERROR/BORDE] Debe devolver el precio original sin cambios si el descuento es cero o negativo", function () {
    const precioBase = 12000;
    expect(aplicarDescuento(precioBase, 0)).toBe(12000);
    expect(aplicarDescuento(precioBase, -15)).toBe(12000);
  });

  it("13 [ÉXITO] Debe filtrar y encontrar los productos pertenecientes a la categoría 'Juguetes'", function () {
    const catalogo = [
      { id: 1, name: "Ratón con Catnip", category: "Juguetes" },
      { id: 2, name: "Comedero Doble", category: "Accesorios" },
      { id: 3, name: "Caña Plumas", category: "Juguetes" }
    ];
    const resultado = filtrarPorCategoria(catalogo, "Juguetes");
    expect(resultado.length).toBe(2);
  });

  it("14 [ERROR/BORDE] Debe retornar un arreglo vacío si la categoría buscada no existe en el catálogo", function () {
    const catalogo = [{ id: 1, name: "Arena Sanitaria", category: "Higiene" }];
    const resultado = filtrarPorCategoria(catalogo, "Ropa Felina Inexistente");
    expect(resultado.length).toBe(0);
  });

  it("15 [ÉXITO] Debe eliminar del carrito el producto coincidente con el ID otorgado", function () {
    const carritoInicial = [
      { id: 10, name: "Rascador Torre" },
      { id: 20, name: "Snack de Salmón" }
    ];
    const carritoActualizado = eliminarProductoDelCarrito(carritoInicial, 10);
    expect(carritoActualizado.length).toBe(1);
    expect(carritoActualizado[0].id).toBe(20);
  });

  it("16 [ERROR/BORDE] Debe mantener la lista sin cambios si el ID a eliminar no se encuentra en el carrito", function () {
    const carritoInicial = [{ id: 10, name: "Rascador Torre" }];
    const carritoActualizado = eliminarProductoDelCarrito(carritoInicial, 999);
    expect(carritoActualizado.length).toBe(1);
  });

  it("17 [ÉXITO] Debe actualizar la cantidad de un producto si el nuevo valor es mayor a cero", function () {
    const carrito = [{ id: 5, name: "Plato Cerámica", cantidad: 1 }];
    const carritoActualizado = actualizarCantidadProducto(carrito, 5, 3);
    expect(carritoActualizado[0].cantidad).toBe(3);
  });

  it("18 [ERROR/BORDE] Debe remover el producto del carrito si la nueva cantidad solicitada es 0 o menor", function () {
    const carrito = [{ id: 5, name: "Plato Cerámica", cantidad: 2 }];
    const carritoActualizado = actualizarCantidadProducto(carrito, 5, 0);
    expect(carritoActualizado.length).toBe(0);
  });

  it("19 [ÉXITO] Debe confirmar que hay stock suficiente cuando la cantidad no supera el límite", function () {
    const producto = { id: 1, name: "Cama Felina", stock: 10 };
    const hayStock = comprobarStockDisponible(producto, 4);
    expect(hayStock).toBeTrue();
  });

  it("20 [ERROR/BORDE] Debe rechazar la compra si la cantidad solicitada supera el stock disponible", function () {
    const producto = { id: 1, name: "Cama Felina", stock: 2 };
    const hayStock = comprobarStockDisponible(producto, 5);
    expect(hayStock).toBeFalse();
  });

});