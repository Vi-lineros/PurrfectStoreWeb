# PurrfectStore - E-commerce Felino (SPA)

PurrfectStore es una Single Page Application (SPA) e-commerce moderna orientada al cuidado integral felino. El proyecto está construido en React 19 y Vite, estilizado con Bootstrap 5, e integrado a microservicios REST en Xano para la autenticación JWT, persistencia de carritos y gestión del catálogo. Incluye un panel administrativo privado (`/admin`) y una suite de 18 pruebas unitarias ejecutadas mediante Karma y Jasmine.

---

## Tabla de Contenidos
- [Características Principales](#características-principales)
- [Arquitectura del Proyecto](#arquitectura-del-proyecto)
- [Tecnologías y Librerías Utilizadas](#tecnologías-y-librerías-utilizadas)
- [Módulos y Funciones Clave](#módulos-y-funciones-clave)
- [Suite de Pruebas Unitarias (Karma & Jasmine)](#suite-de-pruebas-unitarias-karma--jasmine)
- [Instalación y Configuración Local](#instalación-y-configuración-local)

---

## Características Principales

### Experiencia del Cliente (Público)
* **Portada Interactiva (`Home.jsx`):** Carrusel deslizante de promociones por categoría y tarjetas de productos destacados ordenados numéricamente por ID (`a.id - b.id`).
* **Catálogo Dinámico (`Productos.jsx`):** Filtro inteligente mediante parámetros de URL (`?cat=...` y `?search=...`), con soporte para ordenamiento por ID, precio (menor/mayor) y nombre (A-Z / Z-A).
* **Ficha de Producto (`DetalleProducto.jsx`):** Galería con miniatura interactiva, visualizador de stock en tiempo real y selector con control de cantidad.
* **Carrito Persistente (`Carrito.jsx`):** Sincronización en tiempo real contra el endpoint `/cart` de Xano (estado `"en proceso"`), con edición rápida de cantidades y cálculo automático de subtotales.
* **Pasarela de Checkout & Boleta (`Checkout.jsx`):** Actualización de la dirección de despacho (`PATCH /user/:id`), temporizador de simulación bancaria con opción de prueba de error y generación de boletas formateadas (`#00000X`).
* **Autenticación e Identidad (`Login.jsx` & `Registro.jsx`):** Gestión de tokens JWT guardados en `localStorage`, inicialización automática del carrito tras el alta y validación de correo.

### Panel Administrativo (`/admin`)
* **Dashboard de Control (`AdminDashboard.jsx`):** Módulo privado que calcula en tiempo real métricas de compras totales, inventario registrado, stock acumulado, usuarios globales y conteo de cuentas baneadas.
* **CRUD de Productos & Carga Múltiple de Imágenes:** Formulario para agregar y editar productos con subida de imágenes binarias vía `FormData` (`POST /upload/image`), previsualización de archivos y eliminación individual.
* **Historial de Órdenes:** Tabla de transacciones con filtro de pedidos completados/rechazados y modal desplegable para la inspección detallada de ítems.
* **Optimización de Tráfico (`cacheRef`):** Sistema de memoria caché con TTL (Time-To-Live) para prevenir bloqueos por límite de tasa (*Rate Limiting - HTTP 429*) en Xano.

---

## Arquitectura del Proyecto

```text
purrfect-store/
├── public/
│   └── img/                       # Assets estáticos (imágenes de la tienda y diapositivas)
├── src/
│   ├── components/                # Componentes reutilizables de UI
│   │   ├── ContadorAgregar.jsx    # Control de incremento/decremento (+/-)
│   │   ├── Footer.jsx             # Pie de página con mapa interactivo Duoc UC
│   │   ├── Navbar.jsx             # Barra superior con buscador y acceso directo al carrito
│   │   └── ProductCard.jsx        # Tarjeta de producto con carrusel de imágenes automático
│   ├── config/
│   │   └── xano.js                # Constantes globales para endpoints Auth y E-commerce
│   ├── data/
│   │   └── productos.js           # Dataset estático inicial (fallback local)
│   ├── pages/                     # Vistas principales de la aplicación
│   │   ├── admin/
│   │   │   └── AdminDashboard.jsx # Panel privado de gestión CRUD y métricas
│   │   ├── Carrito.jsx            # Gestión e inspección de artículos seleccionados
│   │   ├── Checkout.jsx           # Pasarela de pago, simulación y emisión de boleta
│   │   ├── Contacto.jsx           # Formulario de soporte al cliente con restricción de sesión
│   │   ├── DetalleProducto.jsx    # Ficha técnica e imágenes de producto individual
│   │   ├── Home.jsx               # Portada principal con carrusel y categorías
│   │   ├── Login.jsx              # Inicio de sesión con autenticación JWT
│   │   ├── Nosotros.jsx           # Historia institucional y perfiles del equipo
│   │   ├── Productos.jsx          # Catálogo con filtrado y ordenamiento dinámico
│   │   └── Registro.jsx           # Alta de nuevos usuarios con dirección de despacho
│   ├── services/
│   │   └── productosService.js    # Servicio de consumo REST con caché local y fallback
│   ├── tests/
│   │   └── tienda.spec.js         # Suite de 18 pruebas unitarias (Jasmine)
│   ├── utils/
│   │   └── tiendaUtils.js         # Módulo de funciones puras de lógica de negocio
│   ├── App.css
│   ├── App.jsx                    # Enrutador principal, manejo global del estado y Xano sync
│   ├── index.css                  # Estilos globales y diseño con imagen de fondo fija
│   └── main.jsx                   # Punto de entrada React 19
├── eslint.config.js
├── index.html
├── karma.conf.cjs                 # Configuración de ejecutor de pruebas Karma
├── package.json
└── vite.config.js
```
## Tecnologías y Librerías Utilizadas
### Core & Frameworks
* React 19 (react, react-dom): Construcción de la interfaz basada en componentes funcionales, Hooks (useState, useEffect, useRef) y arquitectura reactiva.

* Vite: Herramienta de compilación ultrarrápida y servidor de desarrollo HMR.

* React Router DOM v7 (react-router-dom): Manejo de rutas declarativas en cliente, parámetros de URL (useSearchParams, useParams) y navegación SPA.

---

### UI & Diseño Responsivo
* Bootstrap v5.3: Grilla fluida, tablas, modales y utilidades CSS responsivas.

* Bootstrap Icons: Iconografía vectorial integrada.

---

### Backend & Servicios Cloud
* Xano (No-Code/API Engine):

* XANO_AUTH_URL: Endpoint de autenticación JWT (/auth/signup, /auth/login).

* XANO_ECOMMERCE_URL: Endpoints de la base de datos REST (/product, /cart, /user, /upload/image).

---

### Testing & Calidad de Código
* Karma v6.4: Test Runner para ejecución de pruebas en entornos de navegadores reales/headless.

* Jasmine v5.1 / Jasmine-Core v7.0: Framework BDD para aserciones y estructuración de suites (describe, it, expect).

* Karma Chrome Launcher & Jasmine HTML Reporter: Ejecución automatizada y reporte visual interactivo en navegador.

---

## Módulos y Funciones Clave
### 1. Funciones Puras de Lógica de Negocio (src/utils/tiendaUtils.js)
* calcularTotalCarrito(items): Calcula el monto total acumulado considerando precio unitario y cantidad.

* normalizarTexto(texto): Convierte cadenas a minúsculas y elimina tildes mediante descomposición Unicode (NFD).

* validarCorreo(email): Valida la estructura de correo electrónico mediante expresiones regulares.

* formatearNumeroBoleta(id): Transforma IDs enteros en cadenas de 6 dígitos rellenas con ceros a la izquierda (#00000X).

* validarDireccionEnvio(direccionObj): Verifica que la dirección de despacho contenga calle y número no vacíos.

* filtrarPorCategoria(catalogo, categoria): Filtra productos por coincidencias de categoría normalizada.

* eliminarProductoDelCarrito(carrito, id): Retorna una nueva lista excluyendo el producto especificado.

* actualizarCantidadProducto(carrito, id, nuevaCantidad): Modifica unidades o remueve el ítem si la cantidad es <= 0.

* comprobarStockDisponible(producto, cantidad): Evalúa si la cantidad solicitada no supera el inventario físico disponible.

---

### 2. Capa de Servicios con Fallback (src/services/productosService.js)
obtenerProductos(): Intenta consumir el catálogo desde Xano REST API. En caso de timeout o falla de red, rescata y entrega de forma transparente la estructura local productosIniciales.

## Suite de Pruebas Unitarias (Karma & Jasmine)
La aplicación cuenta con 18 casos de prueba unitarios en src/tests/tienda.spec.js que evalúan la estabilidad de la lógica de negocio frente a datos válidos y escenarios de error.

## Ejecución de Pruebas
Para ejecutar la suite en el entorno local, corre el siguiente comando en tu consola:

- npm test

## Resumen de los 18 Casos
* [01-02] Totales de Carrito: Validación de sumas exactas y retorno seguro de $0 ante entradas nulas/vacías.

* [03-04] Normalización: Limpieza de mayúsculas/acentos y manejo seguro de valores undefined.

* [05-06] Sintaxis de Correo: Validación de direcciones válidas y rechazo de sintaxis sin @ o dominio.

* [07-08] Boletas Formateadas: Generación de formatos #00000X e inserción del valor por defecto "000001" ante fallas de ID.

* [09-10] Dirección de Envío: Verificación de campos obligatorios de entrega y rechazo de cadenas vacías.

* [11-12] Filtro por Categorías: Retorno de productos en categorías existentes y arreglo vacío ante búsquedas sin coincidencias.

* [13-14] Mutación del Carrito: Remoción efectiva por ID e inmutabilidad si el ID a eliminar no existe.

* [15-16] Control de Cantidades: Actualización de unidades e inserción automática de remoción al ingresar cantidad 0.

* [17-18] Validación de Inventario: Aprobación de compra dentro del margen y bloqueo cuando la solicitud supera el stock.

## Instalación y Configuración Local
### Requisitos Previos
* Node.js: v18.0.0 o superior

* npm: v9.0.0 o superior

### Pasos de Instalación
Clonar el repositorio en la terminal de tu ordenador:
* https://github.com/Vi-lineros/purrfectStoreWeb.git

Instalar dependencias en la raiz del proyecto:
* npm install

Iniciar el servidor de desarrollo en la raiz del proyecto
* npm run dev

### abrir el navegador en http://localhost:5173

## Tests de pruebas unitarios
Para ejecutar los test usa el siguiente comando en la terminal:
* npm test
