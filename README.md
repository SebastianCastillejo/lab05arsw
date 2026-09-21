# Lab – React Client for Blueprints (Redux + Axios + JWT)

> Basado en el cliente HTML/JS del repo de referencia, este laboratorio moderniza el _frontend_ con **React + Vite**, **Redux Toolkit**, **Axios** (con interceptores y JWT), **React Router** y pruebas con **Vitest + Testing Library**.

## Objetivos de aprendizaje

- Diseñar una SPA en React aplicando **componetización** y **Redux (reducers/slices)**.
- Consumir APIs REST de Blueprints con **Axios** y manejar **estados de carga/errores**.
- Integrar **autenticación JWT** con interceptores y rutas protegidas.
- Aplicar buenas prácticas: estructura de carpetas, `.env`, linters, testing, CI.

## Requisitos previos

- Tener corriendo el backend de Blueprints de los **Labs 3 y 4** (APIs + seguridad).
- Node.js 18+ y npm.

Ver la especificación de glosario clave, consulta las [Definiciones del laboratorio](./DEFINICIONES.md).

## Endpoints esperados (ajústalos si tu backend quedo diferente)

- `GET /api/blueprints` → lista general o catálogo para derivar autores.
- `GET /api/blueprints/{author}`
- `GET /api/blueprints/{author}/{name}`
- `POST /api/blueprints` (requiere JWT)
- `POST /api/auth/login` → `{ token }`

Configura la URL base en `.env`.

## Cómo arrancar

```bash
npm install
cp .env.example .env
# edita .env con la URL del backend
npm run dev
```

Abre `http://localhost:5173`

## Variables de entorno

Crea un archivo `.env` en la raíz:

```variable
VITE_API_BASE_URL=http://localhost:8080/api
```

> **Tip:** en producción usa variables seguras o un _reverse proxy_.

## Estructura

```carpetas
blueprints-react-lab/
├─ src/
│  ├─ components/
│  ├─ features/blueprints/blueprintsSlice.js
│  ├─ pages/
│  ├─ services/apiClient.js   # axios + interceptores JWT
│  ├─ store/index.js          # Redux Toolkit
│  ├─ App.jsx, main.jsx, styles.css
├─ tests/
├─ .github/workflows/ci.yml
├─ index.html, package.json, vite.config.js, README.md
```

## 📌 Requerimientos del laboratorio

## 1. Canvas (lienzo)

- Agregar un lienzo (Canvas) a la página.

![alt text](image.png)

En la página principal agregamos el lienzo dentro de la tarjeta "Current blueprint", Ahí se van a dibujar los planos cuando el usuario abra uno de la lista.

- Incluir un componente `BlueprintCanvas` con un identificador propio.

![alt text](image-1.png)

Este es el componente BlueprintCanvas, que se encarga de mostrar el lienzo. Le agregamos un identificador propio llamado blueprint-canvas, que ya viene puesto por defecto. Así el lienzo tiene un nombre único para reconocerlo.

![alt text](image-2.png)

Aquí el identificador se le pone al lienzo de verdad id={id}. Esta parte también dibuja las líneas que unen los puntos del plano y marca cada punto con un círculo amarillo.

![alt text](image-3.png)

Cuando usamos el componente en la página, le pasamos el identificador blueprint-canvas. Así queda claro qué lienzo es el que se está usando.

- Definir dimensiones adecuadas para que no ocupe toda la pantalla pero permita dibujar los planos.

![alt text](image-4.png)

Dejamos definido que el lienzo mide 520 de ancho por 360 de alto si no se le indica otro tamaño. Es un tamaño que deja buen espacio para dibujar sin ocupar toda la pantalla.

![alt text](image-5.png)

Aquí se le aplican al lienzo el ancho y el alto, junto con un poco de estilo: fondo oscuro, borde y esquinas redondeadas. El límite maxWidth hace que no crezca más de 520, y si la pantalla es pequeña se ajusta solo.

![alt text](image-6.png)

En la página le indicamos al lienzo el tamaño de 520×360. Así se ve bien dentro de la tarjeta, acompañado de la tabla de planos al lado.

## 2. Listar los planos de un autor

- Permitir ingresar el nombre de un autor y consultar sus planos desde el backend (o mock).

![alt text](image-7.png)

Aquí está el cuadro donde se escribe el nombre del autor y el botón Get blueprints para buscar sus planos. También funciona presionando Enter.

![alt text](image-8.png)

Esto es lo que pasa al presionar el botón: se toma el nombre que escribió el usuario, se quitan los espacios de sobra y se piden los planos de ese autor.

![alt text](image-9.png)

Esta parte se encarga de ir a buscar los planos del autor y devolverlos para mostrarlos en la página.

![alt text](image-10.png)

Aquí se guarda en qué si está cargando, si ya llegaron los planos o si hubo un error. Así la página sabe qué mensaje mostrar.

![alt text](image-11.png)

Este archivo decide de dónde salen los datos. Si está activado el modo de prueba, usa datos inventados. Si no, los pide al servidor real.

![alt text](image-12.png)

Estos son los datos de prueba. Aquí se buscan los planos del autor y, si no tiene ninguno, se avisa con un mensaje.

![alt text](image-13.png)

En este archivo se activa el modo de prueba poniendo VITE_USE_MOCK en true. Así la aplicación funciona sin tener el servidor prendido.

- Mostrar los resultados en una tabla con las siguientes columnas:
  - Nombre del plano
  - Número de puntos
  - Botón `Open` para abrirlo

  ![alt text](image-14.png)

  Esta es la tabla donde se muestran los planos. Tiene tres columnas: el nombre del plano, cuántos puntos tiene y un botón Open para abrirlo.

  ![alt text](image-15.png)

  Aquí se muestra la tabla en la página. Mientras busca aparece "Cargando...", si hay un error se muestra en rojo y si todo sale bien aparece la tabla con los planos.

  ![alt text](image-16.png)

  Buscando a JohnConnor aparecen sus tres planos, cada uno con su número de puntos y su botón Open. Abajo sale el total de puntos.

  ![alt text](image-17.png)

  Buscando a SarahConnor aparecen sus dos planos, bunker y tower. Así se ve que la tabla cambia según el autor que se escriba.

  ![alt text](image-18.png)

  Si se busca un autor que no existe, como Pepito, aparece un mensaje en rojo avisando que no tiene planos.
  

## 3. Seleccionar un plano y graficarlo

Al hacer clic en el botón `Open`, debe:

- Actualizar un campo de texto con el nombre del plano actual.

![alt text](image-19.png)

Esto es lo que pasa al dar clic en Open. Se toma el autor y el nombre del plano de esa fila y se pide abrir ese plano.

![alt text](image-20.png)

Aquí está el campo de texto que muestra el plano que está abierto, con el autor y el nombre. Si todavía no se ha abierto ninguno dice que no hay plano abierto. Debajo va el lienzo donde se dibuja.

![alt text](image-21.png)

En la tabla cada fila tiene su botón Open, que es el que abre el plano. La fila del plano abierto se resalta para saber cuál se está viendo.

- Obtener los puntos del plano correspondiente.

![alt text](image-22.png)

Esta parte se encarga de pedir el plano usando el autor y el nombre, y así obtener sus puntos.

![alt text](image-23.png)

Aquí se guarda el plano que se abrió junto con sus puntos. También se guarda si está cargando o si hubo un error, para avisarle al usuario.

![alt text](image-24.png)

En los datos de prueba se busca el plano que tenga ese autor y ese nombre. Si no existe se avisa con un mensaje.

- Dibujar consecutivamente los segmentos de recta en el canvas y marcar cada punto.

![alt text](image-25.png)

Esta es la parte que dibuja. Primero une los puntos en orden con líneas rectas, del primero al segundo, del segundo al tercero y así. Después marca cada punto con un círculo amarillo.

![alt text](image-26.png)

Así se ve al abrir el plano house de JohnConnor. El campo de texto muestra el nombre, la fila queda resaltada en la tabla y en el lienzo aparece la casa dibujada con sus puntos marcados.

![alt text](image-27.png)

Aquí se corren las pruebas del lienzo y de abrir un plano, y todas pasan. Se revisa que las líneas se dibujen en orden, que cada punto quede marcado y que al dar Open se muestre el nombre del plano.

## 4. Servicios: `apimock` y `apiclient`

- Implementar dos servicios con la misma interfaz:
  - `apimock`: retorna datos de prueba desde memoria.
  - `apiclient`: consume el API REST real con Axios.
- La interfaz de ambos debe incluir los métodos:
  - `getAll`
  - `getByAuthor`
  - `getByAuthorAndName`
  - `create`

![alt text](image-28.png)

Este es el servicio de prueba. Tiene los planos guardados en memoria y los cuatro métodos que pide el laboratorio, que son traer todos, traer los de un autor, traer uno por autor y nombre, y crear uno nuevo. Si se intenta crear un plano que ya existe avisa con un mensaje.

![alt text](image-29.png)

Este es el servicio que se conecta al servidor real usando Axios. Tiene los mismos cuatro métodos que el de prueba, así que la aplicación los puede usar igual sin importar cuál esté activo.

- Habilitar el cambio entre `apimock` y `apiclient` con una sola línea de código:
  - Definir un módulo `blueprintsService.js` que importe uno u otro según una variable en `.env`.
  - Ejemplo en `.env` (Vite):

```env
VITE_USE_MOCK=true
```

- `VITE_USE_MOCK=true` usa el mock.
- `VITE_USE_MOCK=false` usa el API real.


![alt text](image-30.png)

Este archivo es el que decide cuál servicio usar. Con una sola línea revisa la variable VITE_USE_MOCK y según su valor usa los datos de prueba o el servidor real.

![alt text](image-31.png)

En el archivo .env se pone VITE_USE_MOCK en true para usar los datos de prueba.

![alt text](image-32.png)

Con VITE_USE_MOCK en true, al buscar a JohnConnor aparecen sus planos porque salen de los datos de prueba.

![alt text](image-33.png)

Aquí se cambió VITE_USE_MOCK a false para que la aplicación use el servidor real.

![alt text](image-34.png)

Con VITE_USE_MOCK en false, al buscar a JohnConnor sale un error porque el servidor no está prendido. Esto demuestra que la aplicación ahora sí intenta conectarse al servidor real.

![alt text](image-35.png)

Aquí se corren las pruebas de los servicios y todas pasan. Se revisa que los dos servicios tengan los mismos métodos, que el de prueba funcione bien, que el real llame a las direcciones correctas y que se use uno u otro según la variable del .env.

## 5. Interfaz con React

- El nombre del plano actual debe mostrarse en el DOM como parte del estado global (Redux).
- Evitar manipular directamente el DOM; usar componentes y props/estado.

## 6. Estilos

- Agregar estilos para mejorar la presentación.
- Se puede usar Bootstrap u otro framework CSS.
- Ajustar la tabla, botones y tarjetas para acercarse al mock de referencia.

## 7. Pruebas unitarias

- Agregar pruebas con Vitest + Testing Library para validar:
  - Render del canvas.
  - Envío de formularios.
  - Interacciones básicas con Redux (por ejemplo: dispatch de `fetchByAuthor`).

---

### Notas rápidas y recomendaciones

- Para el canvas en tests con jsdom: agregar un mock de `HTMLCanvasElement.prototype.getContext` en `tests/setup.js`.
- Para usar `@testing-library/jest-dom` con Vitest: en `tests/setup.js` importar `import '@testing-library/jest-dom'` y asegurarse de que Vitest provea el global `expect` (configurar `vitest.config.js` con la opción `test: { globals: true, setupFiles: './tests/setup.js' }`).
- Para la conmutación de servicios en Vite, usar `import.meta.env.VITE_USE_MOCK` para leer la variable en tiempo de ejecución.

## 📌 Recomendaciones y actividades sugeridas para el exito del laboratorio

1. **Redux avanzado**
   - [ ] Agrega estados `loading/error` por _thunk_ y muéstralos en la UI.
   - [ ] Implementa _memo selectors_ para derivar el top-5 de blueprints por cantidad de puntos.
2. **Rutas protegidas**
   - [ ] Crea un componente `<PrivateRoute>` y protege la creación/edición.
3. **CRUD completo**
   - [ ] Implementa `PUT /api/blueprints/{author}/{name}` y `DELETE ...` en el slice y en la UI.
   - [ ] Optimistic updates (revertir si falla).
4. **Dibujo interactivo**
   - [ ] Reemplaza el `svg` por un lienzo donde el usuario haga _click_ para agregar puntos.
   - [ ] Botón “Guardar” que envíe el blueprint.
5. **Errores y _Retry_**
   - [ ] Si `GET` falla, muestra un banner y un botón **Reintentar** que dispare el thunk.
6. **Testing**
   - [ ] Pruebas de `blueprintsSlice` (reducers puros).
   - [ ] Pruebas de componentes con Testing Library (render, interacción).
7. **CI/Lint/Format**
   - [ ] Activa **GitHub Actions** (workflow incluido) → lint + test + build.
8. **Docker (opcional)**
   - [ ] Crea `Dockerfile` (+ `compose`) para front + backend.

## Criterios de evaluación

- Funcionalidad y cobertura de casos (30%)
- Calidad de código y arquitectura (Redux, componentes, servicios) (25%)
- Manejo de estado, errores, UX (15%)
- Pruebas automatizadas (15%)
- Seguridad (JWT/Interceptores/Rutas protegidas) (10%)
- CI/Lint/Format (5%)

## Scripts

- `npm run dev` – servidor de desarrollo Vite
- `npm run build` – build de producción
- `npm run preview` – previsualizar build
- `npm run lint` – ESLint
- `npm run format` – Prettier
- `npm test` – Vitest

---

### Extensiones propuestas del reto

- **Redux Toolkit Query** para _caching_ de requests.
- **MSW** para _mocks_ sin backend.
- **Dark mode** y diseño responsive.

> Este proyecto es un punto de partida para que tus estudiantes evolucionen el cliente clásico de Blueprints a una SPA moderna con prácticas de la industria.
