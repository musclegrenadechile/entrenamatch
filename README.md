# EntrenaMatch — El match del movimiento

**EntrenaMatch** es una plataforma para conectar con personas que entrenan cerca de ti y construir tu equipo de entrenamiento, en cualquier parte del mundo.

La app tiene un enfoque fuerte en **Chile** para su lanzamiento inicial, pero está diseñada para ser completamente global.

## Nueva dirección del proyecto

- Nombre: **EntrenaMatch**
- Solo para **mayores de 18 años**
- Enfoque en **entrenamiento y actividades deportivas** (no es una app de citas románticas)
- Ubicación por GPS real + cálculo de distancia
- Lanzamiento inicial en Chile, pero con perfiles de todo el mundo

## Características principales

- Swipe fluido estilo matching (arrastre + botones)
- Ubicación por GPS + distancia real en km entre usuarios
- Filtros avanzados: edad, distancia, tipo de entrenamiento, disponibilidad
- Chat después del match
- 18+ enforcement estricto
- Términos de Servicio, Política de Privacidad y Directrices de Comunidad
- Perfiles de Chile (Santiago, Viña, Valparaíso, Concepción...) + varios países

## Demo Público

Puedes probar la aplicación directamente aquí (versión pública de prueba):

**→ [Probar EntrenaMatch en GitHub Pages](https://musclegrenadechile.github.io/entrenamatch/)**

**Notas importantes de la versión pública:**
- Google Sign-In está **deshabilitado** temporalmente.
- Usa email + contraseña para crear una cuenta de prueba.
- Todos los datos se guardan solo en tu navegador (se pierden al limpiar caché o usar modo incógnito).
- Ideal para probar swipe, squads, sesiones, chat grupal y reseñas.

## Cómo ejecutar localmente

```bash
cd fitvina
npm install
npm run dev
```

Abre http://localhost:5173

Se recomienda abrirla en tamaño móvil (DevTools → Responsive).

## Aspectos Legales importantes (incluidos en la app)

- Verificación explícita de ser mayor de 18 años
- Consentimiento claro para compartir ubicación
- Aviso de que es una plataforma para **entrenamiento y deporte**, no para citas románticas
- Políticas de privacidad y términos de uso completos
- Directrices de comunidad (respeto, seguridad, encuentros en lugares públicos)

## Stack técnico

- React + TypeScript + Vite
- Tailwind CSS + Framer Motion
- Todo funciona offline (localStorage) — ideal para demo

---

**EntrenaMatch** — Entrena con alguien cerca. En cualquier parte del mundo.

Hecho con ❤️ para la comunidad fitness hispanohablante.

---

## Despliegue en GitHub Pages (versión pública)

Esta app está configurada para desplegarse fácilmente en GitHub Pages.

### Pasos para desplegar:

1. Asegúrate de tener el remote correcto:
   ```bash
   git remote -v
   ```

2. Compila la aplicación:
   ```bash
   npm run build
   ```

3. Sube la carpeta `dist` a la rama `gh-pages` (o usa GitHub Actions).

La configuración de `vite.config.ts` ya incluye:
```ts
base: '/entrenamatch/',
```

Una vez desplegado, la app estará disponible en:
`https://musclegrenadechile.github.io/entrenamatch/`

> **Nota**: Para un demo público real, se recomienda usar Firebase Hosting o Vercel en el futuro (mejor rendimiento y soporte de funciones serverless).
