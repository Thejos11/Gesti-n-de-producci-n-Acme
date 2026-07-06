# Gestión de Producción ACME

## Propósito
Esta aplicación web está diseñada para apoyar la operación de la planta ACME en la gestión diaria de producción. Permite controlar usuarios, inventarios, materias primas, productos terminados, recetas y procesos de fabricación desde una sola interfaz.

La herramienta está orientada a facilitar la toma de decisiones operativas y mantener un registro centralizado de las actividades más importantes de la planta.

## ¿Qué puede hacer la aplicación?
- Registrar y administrar usuarios del sistema.
- Gestionar productos y materias primas en inventario.
- Crear recetas para productos terminados.
- Simular procesos de producción y consumir materiales según la cantidad solicitada.
- Consultar un listado general de inventarios y recetas.

## Requisitos previos
Para ejecutar esta aplicación necesitas:
- Un navegador moderno como Chrome, Edge o Firefox.
- Conexión a Internet, porque la aplicación usa Firebase Realtime Database para almacenar los datos.
w- Un servidor local simple para abrir los archivos del proyecto.

No se requiere instalar dependencias adicionales, ya que el proyecto está desarrollado con JavaScript vanilla y módulos ES6.

## Preparación del ambiente
Sigue estos pasos antes de abrir la aplicación:

1. Abre la carpeta del proyecto en Visual Studio Code.
2. Ingresa a la carpeta llamada proyecto java.
3. Inicia un servidor local desde esa carpeta.

### Opción de ejecución
Si prefieres Visual Studio Code, puedes abrir el archivo index.html y ejecutar Live Server desde la barra inferior o con el botón de "Go Live".

## Cómo usar la aplicación
### 1. Iniciar sesión o registrarse
Al abrir la aplicación aparecerá la pantalla de acceso.
- Si es la primera vez que ingresas, registra un usuario nuevo.
- Luego inicia sesión con el número de identificación y la contraseña creada.

### 2. Gestionar usuarios
Desde el módulo de Usuarios puedes:
- Registrar nuevos usuarios.
- Editar información existente.
- Eliminar usuarios si es necesario.

### 3. Administrar inventarios
En el módulo de Inventario puedes:
- Registrar materias primas y productos terminados.
- Definir el proveedor, tipo y stock inicial.
- Agregar una receta a un producto terminado cuando aplique.

### 4. Crear recetas
Para un producto terminado, puedes asociarle sus ingredientes y cantidades. Esto permite que la aplicación conozca qué materiales se consumirán cuando se fabrique el producto.

### 5. Generar producción
En el módulo de Producción:
- Selecciona el producto que deseas fabricar.
- Ingresa la cantidad a producir.
- La aplicación calculará los materiales necesarios y actualizará el inventario.

### 6. Consultar reportes
En los módulos de Inventarios y Recetas puedes revisar:
- El estado actual del stock.
- Los productos disponibles.
- La fórmula asociada a cada producto terminado.

## Notas importantes
- La información se guarda en Firebase Realtime Database, por lo que necesitas conexión a Internet para que el sistema funcione correctamente.
- Si la base de datos está vacía, la aplicación intentará cargar productos iniciales por defecto.
- Asegúrate de usar códigos únicos para los productos y usuarios para evitar conflictos.

## Resumen rápido
Si quieres usarla de forma inmediata:
1. Levanta un servidor local.
2. Abre la aplicación en el navegador.
3. Registra tu primer usuario.
4. Comienza a crear productos, recetas y procesos de producción.