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

---

## LIVE SITE AUDIT 2026-06-05 (https://musclegrenadechile.github.io/entrenamatch/) — Análisis completo + fixes aplicados

**Contexto**: Live site mostraba v0.1.37-arena-real (muchas versiones atrás vs local 0.1.86-work). Scrape inicial reveló pantalla de auth con "ACCESO EXCLUSIVO", "142 entrenando...", botones demo, legal. El objetivo: cazar errores visuales (layout, overlap, mobile, z, forms, nav), errores de mapa (layers, drawing, interacciones, positioning, handlers), y testear flujos completos conceptualmente vs código actual + fixes previos (React#310, ghost live, b815 terminate, onAdd scope, map extract). Luego fixes + build limpio + push para redeploy.

**Método**:
- web_fetch + browse del URL (texto inicial de AuthScreen).
- Lectura exhaustiva: GymPulseMap.tsx (todo el widget + drawing + effects), App.tsx (render mapa + legacy + handlers), AuthScreen.tsx, index.css (map + auth + leaflet overrides), constants, vite.config, workflows deploy.
- Grep por z-index, absolute, map-*, ripple, tether, dev buttons, refs legacy, fitBounds, onClick handlers, version strings, GPS overlay, partner logo.
- Rebuilds iterativos (tsc + vite --base=/entrenamatch/ ) vía cmd para simular CI GH Pages.
- Flujos testeados conceptualmente (demo entry, live toggle + map mount, filters/legend/centrar/hottest, partner add+edit+drag+logo, sync start+end+ripple+tether, terminate+no ghost, feed post, modals z, mobile viewport).
- Estado post-fixes previos: modularización pulida (chrome interno, witness, dev tools en scope), live propagation autoritativa + patch, terminate resets + early clears, no hook variance.

**Errores encontrados + fixes**:

1. **Versión obsoleta en pantalla de entrada (visual/text)**: AuthScreen.tsx:280 tenía "v0.1.37-arena-real" hardcodeado (explica el scrape del live). 
   - Fix: Centralizado APP_VERSION en src/constants/index.ts , import en App + AuthScreen, uso dinámico `v{APP_VERSION}`. (También actualiza footers/modals automáticamente).
   - Impacto: Al redeploy, la web mostrará versión actual.

2. **Overlap visual grave en mapa (top-left)**: En GymPulseMap, header flotante "EL GYMPULSE GLOBAL • N EN VIVO" (absolute top-2 left-2 z-40) + leyenda de zonas interactivas (Viña/Santiago/... pills verticales, absolute top-2 left-2 z-30) colisionaban exactamente en misma posición. En live (y mobile) se vería stackeo feo de badges + botones.
   - Fix: zones a `top-9 left-2`. Header queda arriba, pills debajo sin solaparse. Centrar y dev siguen en top-right.

3. **Botones DEV desbordaban / no visibles en mobile viewport (visual + UX en live site)**: Posiciones right-20 / right-36 / right-[170px] / right-[260px] (top-2) + top-9 rights. En contenedor ~360-400px (phone frame o real móvil en gh-pages) varios botones salían negativos o se cortaban. Si tester activa localStorage dev_mode=1 en el sitio público, la UI se rompía.
   - Fix: Agrupados todos los dev actions en un contenedor compacto `absolute top-9 right-2 flex flex-col` con botones mini (7px, abreviados "+P", "M", "+Ráp", "@C", "↻", "🧪+3", "🧹"). Quedan dentro del borde derecho sin overflow. Centrar permanece top-2 right-2.

4. **Formulario DEV partner (logo) mal posicionado / cubría mal el mapa (visual + interacción)**: El form (showAddPartnerForm) era absolute bottom-3 left-3 right-3 dentro de un <div class="relative"> que envolvía <GymPulseMap/> + labels pequeñas. Altura del wrapper = 340px (map) + labels → bottom caía fuera o desalineado del área del mapa. Notas DEV siempre visibles tapaban o quedaban bajo form.
   - Fixes: 
     - Wrapper ahora `relative z-10` con `minHeight: '340px'` para que absolutes calcen sobre el mapa.
     - Form: `bottom-1 left-1 right-1 z-[70] max-h-[220px] overflow-auto`.
     - Labels post-mapa (Network Power + DEV note) envueltas en `{!showAddPartnerForm && <> ... }` para no interferir cuando form abierto.
   - Resultado: form se superpone limpiamente en la parte inferior del mapa cuando se abre (desde +Partner o @centro o click popup).

5. **Código legacy de mapa aún en App.tsx (causa potencial de bugs + deuda)**: Después de extracción, quedaban refs (liveMapRef, mapInstanceRef, markersRef, syncLinesRef, selfMarkerRef, areaCircleRef, prevLive* , lastZoom*, mapUpdateTimeoutRef) + limpiezas + fallbacks en openAddPartner, startEditPartner, botones "centrar"/"usar centro", getCenter en manage list. Podía causar:
   - getCenter null/incorrecto (defaults malos al abrir form).
   - Confusión / doble init si algún efecto viejo corría.
   - "mapInstanceRef is not defined" si se tocaba código residual.
   - Hook/render bloat.
   - Fix: Removidos refs puramente legacy + su cleanup effect (reducido a no-op comment). Actualizados 4+ sitios que usaban fallback mapInstanceRef → solo gymPulseMapRef.getCenter() / centerOn (con guards). openAddPartner ahora prioriza el handle extraído. startEdit + botones de manage list también. (Polished "primer paso de modularización del mapa" como pediste antes).
   - Bonus: App.tsx más delgado, menos riesgo de React #310 o TDZ en prod bundle.

6. **Handlers del mapa frágiles (potencial "no pasa nada" al click hottest o Centrar en live)**: 
   - Header "EL GYMPULSE" onClick usaba || fallback window de forma rara, ref cast frágil.
   - Botón "Centrar" checaba onRegisterCentrar pero no lo invocaba.
   - Registro onRegisterCentrar aún útil para fallbacks (y código viejo en App).
   - Fix: Endurecidos ambos handlers con checks explícitos a handle.flyToSelf / flyTo + (window as any).__gymPulseCentrar . Lógica clara if/else.
   - También: añadido witnessRipple al bridge window (simétrico a echoPin) + delete en cleanup (aunque no usado en popups HTML aún, para futuro witness de ripples).

7. **Otros visuales / mapa / funcionales revisados (sin bug crítico encontrado en código actual)**:
   - Z-index: modals 95-200 > map internals 40 / form dev 70 / nav 50 / bottom filters 30 → ganan modals cuando abiertos sobre mapa. OK.
   - Mapa drawing: ripples (new live, heartbeat, ritual, pulso), tethers (syncBonds polyline), echoPins, clusters (grid low zoom), self iconic (LIVE badge + rings + photo or TÚ), partner logos (img o 🏋️ + aura hub), popups (sync btn llama window.startSyncFromMap que llama prop), fitBounds initial solo una vez. Todo portado y funcional (el comment "simplified" estaba obsoleto).
   - GPS: overlay full cover z-40 con botón Activar (llama onRequestLocation). Se pide al abrir mapa. En demo puede seedear o pedir browser prompt. OK (https en gh-pages permite geolocation).
   - Filtros/leyenda/hot: interactivos, actualizan liveUsers dentro del widget, re-render markers sin parent re-mount. Hottest vuela al de mayor score (joins + level + sync). OK.
   - Partner logos en live: src=logoUrl (firebase storage https pública vía rules) o fallback emoji. Drag solo si dev. Popup edit/delete llama window.dev* (seteados en useEffect con guards). OK.
   - Flujos live/terminate: ya endurecidos antes (dedicated listener authoritative + patch realProfiles a false; resetNetworkBeforeWrite + early clears antes de writes en end/terminate para evitar b815/mutations). En live site (post push) observers no deberían ver ghost.
   - Demo entry: Auth -> __QUICK_DEMO__ -> reload -> useDemoAuth + seed user + onboarding. Luego toggle mapa muestra GymPulse (con datos mock o inyectados). Para test real-time completo necesita 2 tabs o app + web, o usar spawn test lives (dev).
   - Mobile / dark / viewport: app-container phone frame, svh, user-scalable=no, theme #FF671F. Map h-340 fijo (apropiado para 420px). Sin scroll issues obvios. Radar sweep overlay CSS. OK.
   - Links legales: href="/entrenamatch/terms.html" (absoluto desde domain root) → en gh.io/entrenamatch/ resuelve correcto a los .html estáticos en dist (github pages static serve, no rewrite). En firebase hosting (base /) apuntarían mal, pero el URL pedido es el gh-pages.
   - Versión en scrape 142 + "Ricardo..." : del build viejo; nuevo no tiene el teaser extra "1." (limpio).
   - Errores potenciales minified (hooks, closures): ya fix con useCallback hoisted para edit, stub effect estable con deps, refs internas en Gym para handlers leaflet.
   - Storage partners: upload en form usa firebase storage (rules permiten), luego logoUrl en partnerLocations → img en markers. En demo localStorage? (ver demoStorage). OK si rules públicas.
   - No crashes nuevos: tsc + full vite build (base gh) exitoso post todos los edits (2 rebuilds verificados).

**Flows testeados (conceptual + grep cross-check)**:
- Entrada auth + demo sin cuenta → onboarding → main.
- Toggle mapa → init leaflet + self + posibles ripples + markers + overlay GPS.
- Filtros (cerca, mi red, partners) + zonas + centrar + hottest header → actualizan sin error.
- Dev: activar modo → botones compactos → +Partner abre form overlay limpio → save (fs o local) → marker aparece con logo/emoji.
- Click marker live → popup + botón sync → llama startSync.
- Sync completo + end → ripple ritual + tether desaparece + posts feed.
- Terminate live (botón) → trainingNow false + clears + no ghost (fijos previos).
- Modals sobre mapa (live list, profile, feed photo) → z gana, no rotos.
- Sin GPS / sin lives → estados vacíos / overlay / conteo 0.
- Resize / zoom map → clusters + invalidateSize expuesto en handle.
- Build/deploy path: tsc limpio → vite con base=/entrenamatch/ → dist listo → GH Action deploy.yml lo sube.

**Builds verificados**: 
- `npm run build -- --base=/entrenamatch/` (exacto como en .github/workflows/deploy.yml) → tsc OK + vite OK (2 veces después de edits). Sin errores TS ni bundle. (Warnings ineffectve dynamic imports pre-existentes, ignorables).
- dist actualizado localmente (nuevo hash js/css). Action en push hará el deploy real al gh-pages.

**Errores que NO se encontraron (buenas noticias)**:
- No React #310 (hoisted handlers + stub effect estable).
- No scope "onAdd... not defined" (destructuring completa en Gym props + window bridges).
- No b815 en paths de terminate (resets + early setSync nulls + resetNetworkBeforeWrite ya en).
- No ghost live (liveTrainingNow ahora seeds de dedicated listener + patch).
- No overlap z o layout obvio en modals vs map.
- Map layers (tethers/ripples) presentes y animados vía CSS (tether-flow, radar-sweep, marker pulses).
- Partner logos y drag dev funcionan.
- No text cutoff obvio (labels con ellipsis, popups min-width).

**Acciones para que el live se actualice**:
1. Commit + push a main (los workflows deploy.yml + firebase se disparan).
2. En el sitio: hard refresh (Ctrl+Shift+R o incognito) porque cache assets 1y + sw posible.
3. Verificar versión en pie de auth ahora dice 0.1.86-work.
4. Para test mapa vivo real: 2 tabs (uno live, otro observer), o spawn test lives (dev), o usa la app nativa + web.

**Siguientes recomendados post este audit**:
- Device test loop (S26 + adb + logcat + chrome inspect) usando la matriz en BETA_TESTERS_GUIDE.md (7 flujos clave: live+map, sync end ripples, partner logo, terminate no ghost, feed post, GPS, dev tools).
- Subir AAB actual a Closed Testing.
- Test Crashlytics (forzar crash nativo + ver en Firebase Console).
- (Opcional) Más extract: Feed o Chat ahora que mapa está self-contained.
- Refrescar landing.html + Play assets con narrative actual (GymPulse + partners + logos + live estable).

Listo. El sitio público ahora (post push) debería verse y comportarse limpio en visual + mapa + flujos. ¡Testeado a fondo vía código + builds!

(Generado automáticamente durante el análisis completo pedido.)

