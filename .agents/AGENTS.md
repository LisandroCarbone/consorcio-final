# Reglas de Diseño y Estilo para el Proyecto (Consorcio App)

Estas reglas deben respetarse siempre que se realicen modificaciones visuales, de UI o estructurales en la aplicación.

## 1. Diseño y Estructura de Pantallas (Layout)
* **Páginas a Pantalla Completa**: Las grillas y vistas principales deben ocupar todo el ancho disponible de la pantalla (`w-full` o contenedores amplios sin restricciones del tipo `max-w-5xl` o `max-w-6xl` a menos que sea explícitamente requerido).
* **Distribución de Columnas (Grilla Principal a la Izquierda)**:
  * En pantallas de dos o más columnas (ej. `grid-cols-1 lg:grid-cols-3`), la **grilla o tabla principal de datos** siempre debe ubicarse en el **lado izquierdo** (ocupando la mayor parte del espacio, ej: `lg:col-span-2`).
  * Los **paneles complementarios, secundarios o formularios de creación** siempre deben ubicarse en el **lado derecho** (ocupando el espacio restante, ej: `lg:col-span-1`).
  * En vistas móviles, la grilla o tabla principal se renderiza arriba y los formularios o paneles complementarios abajo.

## 2. Tablas y Grillas
* **Clasificación y Orden**: Las tablas principales deben contar con ordenamiento interactivo (`sortBy`) en columnas clave (por ejemplo, Unidad y Propietario en la cuenta corriente).
* **Acciones en Grillas**: Las acciones secundarias o de gestión de la grilla (editar, eliminar, ver detalles) deben ubicarse como la última columna sobre el lado derecho de la grilla.

## 3. Sistema de Colores (Diseño Dinámico)
* **Colores Semánticos**: No utilizar colores hexadecimales estáticos para elementos de marca en componentes inline.
* Utilizar la paleta `brand` de Tailwind (`bg-brand-600`, `text-brand-100`, etc.), la cual está mapeada a las variables CSS de tema en `globals.css` (`--brand-100`, `--brand-600`, etc.). Esto permite cambiar la apariencia de toda la aplicación dinámicamente al alternar temas o configurar colores desde el Front.
