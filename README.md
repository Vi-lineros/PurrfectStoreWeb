# Purrfect Store

Tienda web para explorar productos para gatos, ver sus detalles, administrar el
carrito y completar una compra. La interfaz también incluye inicio de sesión,
registro, información de la tienda y contacto.

## Tecnologías

- React
- Vite
- React Router
- Bootstrap y Bootstrap Icons
- Xano para productos, autenticación y carrito

## Requisitos

- Node.js y npm

## Instalación y ejecución

```bash
npm install
npm run dev
```

Vite mostrará en la terminal la dirección local para abrir la aplicación.

## Comandos disponibles

```bash
npm run build    # Genera la versión de producción en dist/
npm run preview  # Previsualiza la versión de producción
npm run lint     # Ejecuta ESLint
```

## Configuración de servicios

Las URL de los servicios de Xano se configuran en `src/config/xano.js`.
Los productos también cuentan con datos locales de respaldo en
`src/data/productos.js`.