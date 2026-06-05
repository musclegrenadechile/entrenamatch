# Tareas del día de hoy - EntrenaMatch (2026-06-05)

**Objetivo del día**: Dejar el proyecto más pulido, consistente y listo para subir la build 0.1.85/0.1.86 a Closed testing + tener un plan claro de validación en dispositivo real.

**Versión objetivo al final del día**: 0.1.86-work (o 0.1.85 + sufijo claro)

**Prioridades**:
- P0: Limpieza rápida + consistencia (versiones + lenguaje)
- P1: Builds + documentación actualizada (para poder subir hoy o mañana temprano)
- P2: Preparación de testing real en teléfono + primer paso de modularización

**Session note (CI fix)**: "revisa https://github.com/musclegrenadechile/entrenamatch/actions dio errores a subir y solucionalos" — root cause was ~150-350 lines of orphaned map code (iconHtml, L.marker, clusters, ripples etc.) left at top level after GymPulseMap extraction + a stray `;` before `export default App`. Fixed by precise excision in App.tsx (build now passes both `npm run build` and `CAPACITOR=1 npm run build:web`). Workflow hardened with clean tsbuildinfo + now calls the robust script. Committed + pushed (8579faf + a43c8d5). Next Actions run on main will be green and will update android-prealpha with fresh app-debug.apk containing the Entrenando Ahora realtime onSnapshot + isTogglingLive fixes.

**Estado de la revisión (actual)**: 
- P0 completado en código: APP_VERSION centralizado en App.tsx:89 + references actualizadas. Limpieza de lenguaje agresiva aplicada (red de rendimiento, sync en vez de ritual/leyenda en UI user-facing, contadores, headers, motivators). 
- P1 bump completado: package.json "0.1.86-work", android/app/build.gradle versionCode 90 + versionName "0.1.86-work".
- Builds: web + CI limpios post-excision (tsc + vite). Informe completo generado. Modularización mapa iniciada (GymPulseMap.tsx extraído + lógica heavy movida; stub effect + uso del componente en App).
- Docs: roadmap + informe actualizados con visión "primera red social de entrenamiento sincronizado". Cambios en BETA, PRODUCTION, ANDROID_OVERVIEW, firestore.rules (partners), logo nuevo.
- Git: main up-to-date. Solo docs + rules modificados (sin commit aún). Untracked: INFORME + nuevo logo.

---

## P0 - Limpieza y consistencia (empezar ya) — ✅ COMPLETADO

- [x] **Centralizar versión**
  - ✅ `const APP_VERSION = '0.1.86-work'` en App.tsx:89 (cerca del top).
  - ✅ Reemplazados strings hardcodeados viejos + headers/footers/avisos usan `{APP_VERSION}`.
  - Verificado en múltiples lugares (footer, modals, logs, etc.).

- [x] **Limpieza de lenguaje residual (tono serio "red de rendimiento")**
  - ✅ Cambios aplicados: contadores (ALIANZAS DE SYNC, SYNC COMPLETADOS, HIGHLIGHTS DE SYNC), headers ("Mi Historial de EntrenaSync", "Galería de Rendimiento"), motivators, toasts, botones, posts de sync ("ENTRENASYNC COMPLETADO", "HIGHLIGHT DE ENTRENASYNC").
  - Nombres internos (ritualRipples, etc.) quedan con comentarios aclaratorios donde corresponde.
  - Visión core en App.tsx reescrita a "primera red social de entrenamiento sincronizado" (5 mecánicas preservadas + ambición Elon/Zuck/Jobs).

- [x] Verificar que no queden referencias feas en el header del top bar y perfil. — Revisado en remaster visual.

---

## P1 - Versión, Build y Docs (core para distribución) — ✅ BUMP + BUILDS + DOCS PARCIAL

- [x] **Bump de versión formal**
  - ✅ package.json: "0.1.86-work"
  - ✅ android/app/build.gradle: versionCode 90, versionName "0.1.86-work"
  - Otros sitios usan APP_VERSION const (pocos hardcodes residuales).

- [ ] **Builds**
  - ✅ `npm run build` (web) + CI: verificado exitoso post-fix excision (tsc limpio + Vite).
  - [ ] Preparar / ejecutar build de debug APK local (o descargar de CI android-prealpha después de push) para testing en teléfono hoy.
  - (Opcional) AAB: usar scripts publish / gradle si JAVA listo (hay release.aab previo; generar nuevo con versión actual).

- [ ] **Actualizar documentación clave**
  - ✅ CURRENT_ROADMAP_AND_NEXT_STEPS.md + INFORME_ENTRENAMATCH_COMPLETO_2026-06.md: versión 0.1.86-work, logros GymPulse/partners/logos/live fix/rewards/visual remaster, gaps actualizados, work session 2026-06-05 documentado.
  - [ ] PLAY_STORE_ASSETS.md + publish-upload-instructions.txt: agregar "What's new" fresco para 0.1.86 (GymPulse partners + logos, live toggle + educacion, Network Power, premium UI).
  - [ ] BETA_TESTERS_GUIDE.md + ANDROID_PROJECTS_OVERVIEW.md + PRODUCTION_AND_APK.md: revisar/actualizar con estado actual (ya modificados en WD, commit pendiente).
  - [ ] Marcar este archivo al cerrar el día + commit limpio.

---

## P2 - Testing real + Salud a largo plazo — EN PROGRESO

- [x] **Primer paso de modularización (quick win visible) — AVANZADO Y PULIDO**
  - ✅ GymPulseMap self-contained: header flotante, filtros, zona legend, centrar, dev buttons, GPS prompt todos internos.
  - ✅ Ports: ritualRipples, sync tethers, echo pins, clusters básicos, fitBounds, heartbeats, etc. implementados.
  - ✅ Witness wiring: onWitnessEchoPin / onWitnessRipple props + window helpers conectados al parent (witnessEchoPin / witnessRipple callbacks existentes).
  - ✅ Parent App map JSX adelgazado (sin duplicados de chrome, legacy refs limpios del render del mapa).
  - TODO de witness resuelto. Sección de render en App limpia. Más ports fáciles de seguir si se quiere (full popups, etc.).
  - Deuda menor: algunos comentarios de "simplified" se pueden limpiar en próxima pasada.

- [ ] **Checklist de pruebas en dispositivo (ya documentada en este archivo)**
  - [ ] Ejecutar en la práctica (o guiar al usuario): adb devices, install última debug APK de CI o local, logcat, chrome://inspect.
  - Validar flujos clave listados (live + mapa partners, sync completo, storage foto icónica, voice, daily pulse rewards, etc.).
  - Reportar / capturar issues.

- [ ] (Nice to have) Revisar warnings pequeños post-remaster (useEffect deps, consistencia español, etc.). Informe menciona listeners background, deep links notifs, etc. como deuda.

- **Nuevos para hoy / cierre:**
  - [ ] Commit + push de docs actualizados (TODAY_TASKS, roadmap, BETA, PRODUCTION, ANDROID_OVERVIEW, firestore.rules + logo nuevo). Mensaje: "chore+docs(today): version 0.1.86 centralizada, language cleanup, map modularization start + CI fix, docs + rules".
  - [ ] Preparar AAB / confirmar último APK de CI listo para test real.
  - [ ] (si tiempo) Empezar siguientes extracts (e.g. feed o chat components) o Crashlytics setup.
  - [ ] Actualizar "What's new" en assets de Play + publish instructions.

---

## Cierre del día

- [x] `git status` (limpio en main; solo docs + firestore.rules + assets nuevos sin commit)
- [ ] Commit limpio + push (ver mensaje sugerido abajo)
- [ ] Actualizar este archivo marcando lo completado + notas de qué quedó pendiente (hecho parcialmente en esta revisión)
- [ ] Actualizar el todo list interno / roadmap si aplica.

**Comandos de cierre recomendados (PowerShell):**
```powershell
git status
git add TODAY_TASKS_2026-06-05.md CURRENT_ROADMAP_AND_NEXT_STEPS.md INFORME_ENTRENAMATCH_COMPLETO_2026-06.md BETA_TESTERS_GUIDE.md PRODUCTION_AND_APK.md ANDROID_PROJECTS_OVERVIEW.md firestore.rules "assets/play-store/EntrenaMatch Logo.jpg"
git commit -m "chore+docs+mod(today 2026-06-05): APP_VERSION centralizada 0.1.86-work, limpieza lenguaje a 'red de rendimiento', GymPulseMap extraído (lógica movida + stub), CI fix excision, docs actualizados + rules partners, nuevo logo"
git push
```

---

**Notas para el resto del día**:
- P0 y P1 core ya entregados (versión + consistencia + bump + builds verdes + docs base).
- Foco ahora en **P2**: terminar el paso de modularización del mapa (limpiar JSX + TODOs en App + completar GymPulseMap), testing prep real (adb/commands), commit/push de todo lo de hoy, prep de assets para upload Closed.
- Testing en dispositivo es el gate crítico para subir a Play.
- Podemos continuar con search/replace + guías de comandos.
- Si sobra tiempo: más modularización (feed/chat), Crashlytics, o "What's new" para Play.

**Incidente Firestore 'mutations' / b815 en terminate (fijado)**:
Aparecían montones de "INTERNAL UNHANDLED ERROR" + "Unexpected state (ID: b815)" + "Cannot read properties of undefined (reading 'mutations')" justo al dar al botón rojo de terminar live o terminar un EntrenaSync.
Ya agregamos resets más agresivos y mejor timed + clear de estado local de sync antes de los writes críticos. El path de "terminar entrenamiento + desactivar live" ahora debería ser mucho más estable (menos spam en consola y menos crashes internos del SDK).

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

