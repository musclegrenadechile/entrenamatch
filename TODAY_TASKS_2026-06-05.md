# Tareas del día de hoy - EntrenaMatch (2026-06-05)

**Objetivo del día**: Dejar el proyecto más pulido, consistente y listo para subir la build 0.1.85/0.1.86 a Closed testing + tener un plan claro de validación en dispositivo real.

**Versión objetivo al final del día**: 0.1.86-work (o 0.1.85 + sufijo claro)

**Prioridades**:
- P0: Limpieza rápida + consistencia (versiones + lenguaje)
- P1: Builds + documentación actualizada (para poder subir hoy o mañana temprano)
- P2: Preparación de testing real en teléfono + primer paso de modularización

---

## P0 - Limpieza y consistencia (empezar ya)

- [ ] **Centralizar versión**
  - Crear `const APP_VERSION = '0.1.86-work'` (o '0.1.85-partner-logo-deployed') en App.tsx cerca del top.
  - Reemplazar todos los strings hardcodeados viejos:
    - v0.1.37-arena-real
    - 0.1.7-prealpha
    - v0.1.7+
  - Actualizar headers, footers, betaFeedback, avisos y comentarios de versión.

- [ ] **Limpieza de lenguaje residual (tono serio "red de rendimiento")**
  - Cambiar gadget: 'Ritual Exclusivo' → 'Sync Exclusivo' o 'Acciones Elite'
  - Revisar labels visibles:
    - "GALERÍA DE LEYENDAS" → "GALERÍA DE RENDIMIENTO" (o "HIGHLIGHTS DE LA RED")
    - "Eco de un Ritual Legendario" → "Highlight de EntrenaSync" o "Momento de la Red"
    - Actualizar algunos comentarios internos importantes y títulos de ripples donde sea user-facing.
  - Dejar nombres internos (ritualRipples, etc.) con comentario aclaratorio.

- [ ] Verificar que no queden referencias feas en el header del top bar y perfil.

---

## P1 - Versión, Build y Docs (core para distribución)

- [ ] **Bump de versión formal**
  - package.json → "0.1.86-work" (o similar)
  - android/app/build.gradle → versionCode +1 (a 90), versionName "0.1.86-work"
  - Actualizar cualquier otro sitio (si aparece en PRODUCTION_AND_APK.md ejemplos, etc.)

- [ ] **Builds**
  - `npm run build` (web) — verificar éxito.
  - Preparar / ejecutar build de debug APK (para testing en teléfono hoy).
  - (Opcional) Preparar AAB si el entorno JAVA/ANDROID_HOME está listo.

- [ ] **Actualizar documentación clave**
  - CURRENT_ROADMAP_AND_NEXT_STEPS.md:
    - Poner versión actual 0.1.85 / 0.1.86
    - Resumir logros recientes (GymPulse icónico + partners con logos, fix live toggle + explicaciones, storage rules para partners)
    - Actualizar "gaps" y agregar sección "Work today 2026-06-05"
  - PLAY_STORE_ASSETS.md + publish-upload-instructions.txt:
    - Nuevo bloque "What's new" / fix para esta versión centrado en:
      - GymPulse (mapa en tiempo real) ahora con partners/gyms + logos visibles
      - Toggle "Entrenando Ahora" arreglado + explicaciones educativas claras
      - Mejoras en mapa interactivo y Network Power
  - (Opcional rápido) README.md si menciona versiones muy viejas.

---

## P2 - Testing real + Salud a largo plazo

- [ ] **Checklist de pruebas en dispositivo (crear documento o sección clara)**
  - Comandos exactos para Windows/PowerShell + adb (instalar APK, logcat filtrado, etc.).
  - Flujos clave a validar:
    1. Login real + onboarding
    2. Activar "Entrenando Ahora (EN VIVO)" → aparece en mapa y radar de otros
    3. Subir foto icónica al Muro/Feed (Storage)
    4. EntrenaSync completo con otra cuenta (acciones, vibe, tether, post dual, ripple en mapa)
    5. Ver partners con logo en el mapa + activity badges
    6. Voice notes + daily pulse
    7. Reacciones y comentarios en feed en vivo
  - Instrucciones para reportar (Samsung Members + capturas + chrome://inspect)

- [ ] **Primer paso de modularización (quick win visible)**
  - Crear `src/components/map/GymPulseMap.tsx` (o similar)
  - Mover la lógica grande de renderizado del mapa + ripples + partners + markers (la parte más pesada y más trabajada últimamente).
  - Dejar un stub + props + comentario "work in progress - extraído el 2026-06-05".
  - Esto reduce un poco el monolito y marca el camino.

- [ ] (Nice to have) Revisar si hay warnings o issues pequeños que saltaron en la revisión exhaustiva (ej. algunos useEffect deps, strings en español consistentes).

---

## Cierre del día

- [ ] `git status`
- [ ] Commit limpio: "chore+feat(today): version centralizada, limpieza lenguaje, builds, docs actualizados, prep testing dispositivo + inicio modularización mapa"
- [ ] Push
- [ ] Actualizar este archivo marcando lo completado + notas de qué quedó pendiente para mañana.
- [ ] Actualizar el todo list interno (si aplica).

---

**Notas para hoy**:
- Mantener foco en **P0 y P1 primero** (dan consistencia + permiten subir build hoy).
- El testing en dispositivo es crítico pero depende del usuario físico (yo doy los comandos exactos y guío).
- Podemos hacer varias de las ediciones de código yo directamente con search/replace + builds.
- Si el día da, arrancamos con la extracción del mapa (es el área más fuerte actualmente).

**Comandos útiles rápidos**:
```powershell
# Build web
npm run build

# Chequeo rápido TS
npx tsc --noEmit

# Para build Android debug (después de sync)
# (ver script o: cmd /c "cd /d C:\Users\muscl\fitvina && set CAPACITOR=1 && npm run android:build")
```

---

## Plan de pruebas en dispositivo real (hoy / esta semana)

**Objetivo**: Cerrar el loop de validación en teléfono real (S26 Ultra u otro) antes de subir a Closed.

### Preparación del teléfono (una sola vez)
1. Ajustes > Acerca del teléfono > toca 7 veces "Número de compilación".
2. Activa **Opciones de desarrollador**.
3. En Opciones de desarrollador:
   - Depuración USB = ON
   - "Configuración USB predeterminada" = Transferir archivos (MTP)
4. Conecta el teléfono por USB.
5. Autoriza la computadora (marca "Siempre permitir desde esta computadora").

### Comandos clave en PowerShell / cmd (desde esta carpeta)

```powershell
# 1. Ver dispositivos
cmd /c "C:\Android\platform-tools\adb.exe" devices

# 2. Instalar la última debug APK (reemplaza el nombre real)
cmd /c "C:\Android\platform-tools\adb.exe" install -r EntrenaMatch-debug-....apk

# 3. Ver logs en tiempo real (filtra por lo importante)
cmd /c "C:\Android\platform-tools\adb.exe" logcat -v time | findstr /i "entrenamatch Firebase Storage Capacitor AndroidRuntime"

# 4. (Mientras la app está abierta) Chrome remoto para ver consola JS:
# Abre en Chrome del PC:  chrome://inspect  →  Devices → tu teléfono → inspect del WebView de EntrenaMatch
```

### Flujos clave que hay que validar hoy (en este orden recomendado)

1. **Login + onboarding real**
   - Crear cuenta con email real.
   - Completar onboarding con datos reales + foto (si es APK).

2. **Live + GymPulse (el corazón actual)**
   - Ve a Perfil → activa "Entrenando Ahora (EN VIVO)".
   - Verifica que aparezcas en el mapa (GymPulse) y en el radar de la pestaña Explorar.
   - Desde otro dispositivo/cuenta: comprueba que te veas "cerca" y con el botón de "Entrenar juntos".

3. **Partners + logos en el mapa** (lo nuevo más fuerte)
   - (Solo dev) Activa modo dev (password dev2026map o el botón largo).
   - + Partner → pon nombre, elige tipo, sube logo (archivo o cámara nativa).
   - "Usar centro del mapa" o toca el mapa.
   - Guarda. El logo debe aparecer inmediatamente en el marker dorado con badge PARTNER.
   - Recarga la app / abre en web GH Pages: debe persistir el logo.
   - Edita un partner existente y cambia el logo → debe actualizarse.

4. **EntrenaSync completo (el killer feature)**
   - Desde el radar o mapa, toca "Entrenar juntos — abrir EntrenaSync" con alguien live o un match.
   - Haz varias acciones (emojis).
   - Sube vibe/combos.
   - Termina el sync y verifica:
     - Post automático en ambos muros + feed global.
     - Aparece ripple/onda en el mapa.
     - Se crea bond + sube Network Power.
     - Contadores en perfil se actualizan.

5. **Foto icónica al Muro / Feed**
   - Ve a Perfil → agrega post con foto (cámara o galería).
   - Publica.
   - Verifica que aparezca en tu muro y en el Feed global (con preview grande).
   - Otra cuenta debe poder verlo y reaccionar.

6. **Voice + Daily Pulse**
   - Envía nota de voz a un GymPartner.
   - Completa un Daily Challenge.
   - Verifica streaks y momentum.

7. **Reportes y seguridad**
   - Reporta un perfil ficticio.
   - Bloquea a alguien.
   - Verifica que las reglas de comunidad están linkeadas.

**Cómo reportar bugs rápido (sin PC)**:
- Samsung Members → Enviar comentarios → Informe de error.
- Describe + reproduce el bug mientras grabas el informe.

---

**Próximos pasos después de validar en dispositivo**:
- Subir el AAB 0.1.86 a Closed.
- Invitar a 5-8 testers serios.
- Agregar Crashlytics (si no está).
- Continuar modularizando (mapa primero).

¡Listo para ejecutar el resto del plan! Dime "sigue con el 7" o "haz el plan de modularización del mapa" o "prepara los comandos de build APK para mí".

