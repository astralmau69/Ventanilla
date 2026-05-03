# Plan — Sistema "Ventanilla / Kiosco de Sacado de Fichas" (Touch Web Hospitalario)

## Contexto

El hospital necesita reemplazar la atención de mostrador para sacado de fichas por un kiosco táctil web pensado **específicamente para adultos mayores**. La motivación es triple:

1. **Reducir colas humanas en mostrador** y descongestionar al personal de admisiones.
2. **Dignificar la experiencia del adulto mayor** con una interfaz que no asuma alfabetización digital, evite la presión del tiempo, y sea visualmente clara y acogedora.
3. **Tener una base técnica moderna y desacoplada** que permita conectarse después con los servicios HTTPS que el hospital ya expone, sin reescribir el frontend.

**Resultado esperado del MVP:** un kiosco de pantalla completa donde el paciente ingresa su número de carnet/matrícula, elige especialidad, recibe un ticket impreso en papel térmico, y su número aparece en la pantalla TV de turnos de la sala. Todo el flujo en ≤ 4 toques, en ≤ 60 segundos, con cero distracciones.

**Decisión clave de orden de trabajo (confirmada con el usuario):**
- **Fase A (corto plazo):** Frontend touch web pulido y funcional contra mocks.
- **Fase B (medio plazo):** Backend propio en microservicios, autónomo (fuente de verdad de turnos).
- **Fase C (futuro):** Adapter de integración hacia los servicios HTTPS del hospital.

Esta separación nos permite mostrar valor visible al cliente desde la semana 2-3 (frontend navegable) sin esperar al backend.

---

## Stack Tecnológico Recomendado

| Capa | Tecnología | Razón |
|---|---|---|
| Frontend | **Next.js 15 (App Router) + React 19 + TypeScript** | SSG para arranque instantáneo en kiosco, RSC innecesario aquí (todo es client-side interactivo), pero nos da routing maduro y dev-tools. |
| Estilos | **Tailwind CSS + tokens propios de design system** | Permite imponer escala tipográfica y de touch-targets disciplinada. |
| Animaciones | **GSAP 3 + `@gsap/react` (useGSAP)** | Control fino, timeline-based, sin saltos. Ver Fase 2. |
| Estado | **Zustand** (ligero) + **TanStack Query** para fetch | Evita boilerplate de Redux; el flujo es lineal. |
| Backend | **NestJS + TypeScript** (un repo monorepo Nx o Turborepo) | Decoradores/DI hacen los microservicios mantenibles; comparte tipos con el frontend. |
| Mensajería interna | **NATS** (más simple que RabbitMQ para el caso) | Pub/sub para eventos de turno emitidos a la pantalla TV. |
| Real-time → Pantalla TV | **Socket.IO** sobre el API Gateway | Compatible con cualquier display web. |
| Persistencia | **PostgreSQL 16** (turnos, pacientes cache) + **Redis** (estado de cola en vivo) | PG para auditoría, Redis para el "número actual" con baja latencia. |
| Impresora ticket | **ESC/POS** vía servicio local (`node-escpos` o agente Python) | Hablar directo a la térmica USB del kiosco. |
| Contenedorización | **Docker + Docker Compose** (MVP) → Kubernetes opcional luego | Compose alcanza para 1 hospital. |
| Observabilidad | **Pino** logs + **Grafana Loki** + **Prometheus** | Crítico en hospital (auditoría). |

---

## Fase 1 — Arquitectura del Sistema

### Diagrama conceptual

```
┌───────────────────────────────────────────────────────────────────────┐
│                         HARDWARE EN HOSPITAL                          │
│                                                                       │
│   ┌──────────────┐       ┌──────────────┐       ┌──────────────────┐ │
│   │ KIOSCO TÁCTIL │       │  PANTALLA TV │       │  IMPRESORA       │ │
│   │ (Chromium     │       │  DE TURNOS   │       │  TÉRMICA ESC/POS │ │
│   │  fullscreen)  │       │  (Chromium)  │       │  (USB)           │ │
│   └──────┬───────┘       └──────▲───────┘       └────────▲─────────┘ │
│          │ HTTPS/WSS            │ WSS                    │ USB        │
└──────────┼──────────────────────┼────────────────────────┼────────────┘
           │                      │                        │
           ▼                      │                        │
┌───────────────────────────────────────────────────────────────────────┐
│                      EDGE SERVER DEL HOSPITAL                         │
│                       (Docker Compose)                                │
│                                                                       │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │              API GATEWAY (NestJS + Socket.IO)                │   │
│   │   - REST /api/v1/*    - WSS /turnos     - Rate limiting     │   │
│   └──────┬──────────────┬──────────────┬───────────────┬────────┘   │
│          │              │              │               │             │
│   ┌──────▼─────┐ ┌─────▼──────┐ ┌────▼────────┐ ┌───▼──────────┐  │
│   │ ms-pacientes│ │ ms-turnos  │ │ ms-pantalla │ │ ms-impresion │  │
│   │             │ │ (cola)     │ │ (display)   │ │ (ESC/POS)    │  │
│   │ Lookup por  │ │ Generar    │ │ Push        │ │ Encolar y    │  │
│   │ nº carnet   │ │ ticket,    │ │ "siguiente" │ │ enviar a     │  │
│   │             │ │ avanzar    │ │ vía WSS     │ │ térmica      │  │
│   └──────┬──────┘ └─────┬──────┘ └─────┬───────┘ └──────────────┘  │
│          │              │              │                            │
│          │              ▼              │                            │
│          │     ┌────────────────┐      │                            │
│          │     │ NATS event bus │◄─────┘  (turno.creado,            │
│          │     └────────┬───────┘          turno.llamado)            │
│          │              │                                            │
│   ┌──────▼──────────────▼───────┐    ┌──────────────────────────┐  │
│   │     PostgreSQL 16            │    │        Redis             │  │
│   │  pacientes_cache, turnos,    │    │ cola:especialidad:N      │  │
│   │  especialidades, auditoria   │    │ turno_actual:especialidad │  │
│   └──────────────┬───────────────┘    └──────────────────────────┘  │
│                  │                                                   │
│   ┌──────────────▼──────────────────────────────────────────────┐   │
│   │   ms-integracion-hospital  (FASE C — stub al inicio)        │   │
│   │   Cliente HTTPS hacia los servicios del hospital.            │   │
│   │   Sincroniza pacientes y reporta turnos consumidos.          │   │
│   └────────────────────────────┬─────────────────────────────────┘   │
└────────────────────────────────┼─────────────────────────────────────┘
                                 │ HTTPS (mTLS, en VLAN del hospital)
                                 ▼
                    ┌─────────────────────────┐
                    │  SERVICIOS HTTPS        │
                    │  DEL HOSPITAL (HIS)     │
                    └─────────────────────────┘
```

### Responsabilidades por microservicio

- **API Gateway:** único punto de entrada para el kiosco y la pantalla TV. Maneja WebSocket, rate-limiting, y traduce REST público → llamadas internas. Lleva trazas y métricas.
- **ms-pacientes:** dado un nº de carnet/matrícula, devuelve datos básicos (nombre, edad, si requiere atención prioritaria). Inicialmente lee de `pacientes_cache` en PG; en Fase C hará passthrough a `ms-integracion-hospital`.
- **ms-turnos:** corazón del sistema. Genera el siguiente número correlativo por especialidad/día, persiste en PG, publica `turno.creado` en NATS, actualiza Redis.
- **ms-pantalla-display:** suscriptor de NATS; mantiene el WebSocket con la(s) pantalla(s) TV de sala. Empuja eventos `turno.llamado` con número + especialidad + box de atención.
- **ms-impresion:** consume eventos `turno.creado`, formatea el ticket ESC/POS y lo envía a la cola de la térmica local. Reintentos con backoff. Si la impresora falla, marca el turno como `print_pending` y notifica al gateway para mostrar mensaje de respaldo en pantalla.
- **ms-integracion-hospital (Fase C):** adapter aislado. El resto del sistema NO lo conoce directamente — solo `ms-pacientes` lo invoca tras un fallback. Esto permite construir todo sin él.

### Comunicación frontend ↔ backend

- **Llamadas síncronas** (REST JSON): `GET /pacientes/:carnet`, `GET /especialidades`, `POST /turnos`.
- **Asíncronas** (WSS): solo desde la **pantalla TV** y opcionalmente desde el kiosco para mostrar "tu turno se imprimió correctamente".
- **Contrato:** se define con **OpenAPI 3.1** generado desde NestJS y consumido en el frontend con `openapi-typescript` para tipos compartidos.

### Seguridad

- mTLS entre el edge server y los servicios del hospital.
- El kiosco NO maneja datos sensibles persistidos: cada sesión se borra al imprimir/cancelar.
- Auditoría inmutable de cada generación de turno en tabla `auditoria` (append-only).
- VLAN segregada para el kiosco; sin acceso a internet salvo NTP y actualizaciones controladas.

---

## Fase 2 — Guía de UX/UI y Estrategia GSAP

### Principios de diseño para tercera edad en pantalla táctil

Basado en WCAG 2.2 AAA, NIA (National Institute on Aging) guidelines, y heurísticas de Nielsen aplicadas a kiosco hospitalario:

1. **Touch targets gigantes.** Mínimo **88×88 px** (recomendación Apple HIG para mayores), ideal **120×120 px**. Separación entre targets ≥ 24 px.
2. **Tipografía generosa y legible.** Cuerpo base **28-32 px**, títulos **48-72 px**. Familia humanista sans-serif (Inter, IBM Plex Sans, Atkinson Hyperlegible — esta última diseñada por Braille Institute para baja visión). **Sin** itálicas, sin pesos < 500.
3. **Contraste WCAG AAA** (≥ 7:1 texto normal). Paleta sugerida: blanco hueso `#FAFAF7` sobre azul hospital profundo `#0A2540`, con acento cálido ámbar `#F5A623` para CTAs.
4. **Una sola tarea por pantalla.** Nunca dos decisiones simultáneas. Botón "Atrás" siempre visible, mismo tamaño y posición.
5. **Sin presión temporal.** Nada de countdowns visibles. Si hay timeout de inactividad (90 s), aparece un modal calmado: *"¿Sigue ahí? Toque para continuar"* — sin barras animadas de urgencia.
6. **Feedback inmediato y multimodal.** Cada toque produce: (a) cambio visual del botón, (b) un "bloop" de audio sutil opcional, (c) nunca se queda la pantalla "muda" más de 200 ms.
7. **Lenguaje claro y respetuoso.** Tuteo evitado en el contexto cultural andino — usar "usted". Evitar tecnicismos: "Ficha" en vez de "Ticket", "Especialidad" en vez de "Servicio".
8. **Iconografía + texto siempre juntos.** Nunca ícono solo. Íconos grandes (64-96 px), estilo lineal con grosor ≥ 2.5 px.
9. **Modo alto contraste y "letra más grande"** disponibles desde un botón de accesibilidad permanente en esquina inferior derecha.
10. **Prevención de errores > validación de errores.** Teclado numérico para el carnet sin letras posibles, formato auto-aplicado.

### Wireframe de flujo (4 pantallas)

```
P0 BIENVENIDA              P1 INGRESO CARNET         P2 ELEGIR ESPECIALIDAD     P3 CONFIRMACIÓN
┌────────────────┐         ┌────────────────┐        ┌────────────────┐         ┌────────────────┐
│  Buenos días   │         │ Ingrese su     │        │ Hola, JUAN     │         │   ✓ Listo      │
│                │         │ número de      │        │ ¿Qué consulta  │         │                │
│  Toque para    │         │ carnet         │        │  necesita?     │         │  Su ficha es:  │
│  comenzar      │         │                │        │                │         │                │
│   👆 [GRANDE]  │  ───►   │ [_ _ _ _ _ _]  │  ───►  │ [Med General]  │  ───►   │     A-024      │
│                │         │                │        │ [Cardiología]  │         │                │
│                │         │ [1][2][3]      │        │ [Pediatría]    │         │ Espere su      │
│                │         │ [4][5][6]      │        │ [Otros]        │         │ turno en sala  │
│                │         │ [7][8][9]      │        │                │         │                │
│                │         │ [⌫][0][OK]     │        │                │         │ 🖨 Imprimiendo │
└────────────────┘         └────────────────┘        └────────────────┘         └────────────────┘
```

### Estrategia GSAP — 3 animaciones concretas

GSAP se integrará con `@gsap/react` y el hook `useGSAP` (mejor manejo de cleanup en React 19). Todas las animaciones respetan `prefers-reduced-motion`.

#### Animación 1 — Transición entre pantallas (curtain reveal con stagger)

**Objetivo UX:** que el adulto mayor perciba claramente "cambié de paso", sin que el cambio sea brusco. El cerebro envejecido procesa transiciones más lento; necesitamos ~600-800 ms (vs 200-300 ms estándar).

```ts
// Al pasar de P1 → P2
const tl = gsap.timeline({ defaults: { ease: "power3.inOut" } });
tl.to(".screen-current", { xPercent: -8, opacity: 0, duration: 0.45 })
  .from(".screen-next",    { xPercent: 8,  opacity: 0, duration: 0.55 }, "-=0.2")
  .from(".screen-next [data-stagger]", {
      y: 24, opacity: 0, duration: 0.5, stagger: 0.08, ease: "power2.out"
  }, "-=0.3");
```

#### Animación 2 — Feedback táctil tipo "pulso de eco"

**Objetivo UX:** confirmar inmediatamente que el toque fue registrado. Reemplazamos el ripple Material Design con un **pulso de eco**: el botón se hunde levemente y emite un anillo expansivo suave.

```ts
const onTouch = (btn: HTMLElement) => {
  gsap.timeline()
    .to(btn, { scale: 0.97, duration: 0.12, ease: "power2.out" })
    .to(btn, { scale: 1.00, duration: 0.35, ease: "elastic.out(1, 0.6)" })
    .fromTo(btn.querySelector(".echo-ring"),
       { scale: 0.8, opacity: 0.6 },
       { scale: 1.6, opacity: 0, duration: 0.7, ease: "power2.out" },
       0
    );
};
```

#### Animación 3 — Revelación del número de ficha + "ticket sale de la impresora"

**Objetivo UX:** el momento culminante. El paciente debe sentir éxito y saber qué hacer después.

```ts
const tl = gsap.timeline();
tl.from(".ticket-number", { scale: 0.7, opacity: 0, duration: 0.6, ease: "back.out(1.4)" })
  .from(".ticket-number .digit", {
      y: -20, opacity: 0, duration: 0.4, stagger: 0.12, ease: "power2.out"
  }, "-=0.3")
  .from(".success-check path", {
      drawSVG: "0%", duration: 0.6, ease: "power2.inOut"
  }, "-=0.2")
  .from(".ticket-svg", {
      y: -120, opacity: 0, duration: 0.9, ease: "power3.out"
  }, "+=0.1")
  .to(".ticket-svg", {
      y: 0, rotateZ: -2, duration: 0.4, ease: "sine.inOut", yoyo: true, repeat: 1
  });
```

### Paleta y tokens

```ts
export const tokens = {
  color: {
    bg:        "#FAFAF7",
    text:      "#0A2540",
    primary:   "#0A2540",
    accent:    "#F5A623",
    success:   "#1F7A4D",
    danger:    "#C0392B",
    surface:   "#FFFFFF",
    surfaceAlt:"#EEF2F7",
  },
  font: {
    family: "'Atkinson Hyperlegible', 'Inter', system-ui, sans-serif",
    size: { body: "32px", h1: "72px", h2: "48px", button: "36px" },
  },
  touch: { min: "88px", ideal: "120px", gap: "24px" },
  radius: "20px",
  motion: { duration: { fast: 0.25, base: 0.5, slow: 0.8 } },
};
```

---

## Fase 3 — Roadmap de Desarrollo (Sprints)

8 sprints de 1 semana cada uno (≈ 2 meses al MVP desplegado). Cada sprint termina con demo navegable.

### Sprint 0 — Cimientos (Semana 1)
- Monorepo con **Turborepo**: `apps/kiosk-web`, `apps/display-tv`, `services/api-gateway`, `services/ms-turnos`, `services/ms-pacientes`, `services/ms-impresion`, `packages/ui`, `packages/contracts`.
- ESLint + Prettier + Husky + commitlint.
- Docker Compose base con Postgres, Redis, NATS arrancando localmente.
- CI en GitHub Actions: lint + typecheck + build.
- Documentación inicial (`README.md`, `ARCHITECTURE.md`).

### Sprint 1 — Design System y prototipo navegable (Semana 2)
- `packages/ui`: tokens, primitivos (`Button`, `NumericKeypad`, `ScreenFrame`, `BackButton`, `EchoRing`).
- Storybook con todas las variantes y test de accesibilidad (axe-core).
- Setup de GSAP + helper `useScreenTransition`.
- **Demo**: pantallas estáticas con la paleta y tipografía finales.

### Sprint 2 — Frontend del flujo completo con mocks (Semana 3)
- 4 pantallas implementadas con datos mock (MSW interceptando fetch).
- Animación 1 (transiciones), Animación 2 (eco táctil) integradas.
- Detección de inactividad y modal calmado.
- Modo alto contraste y "letra más grande" funcionales.
- **Demo al cliente**: kiosko navegable end-to-end sin backend real.

### Sprint 3 — Animación de éxito + estados de error amables (Semana 4)
- Animación 3 (ticket reveal).
- Pantallas de error: carnet no encontrado, sin conexión, impresora sin papel — todas con misma calidez visual y acciones claras ("Llamar a personal", botón grande).
- Tests E2E con Playwright en modo touch.

### Sprint 4 — Backend núcleo: ms-turnos y ms-pacientes (Semana 5)
- NestJS + Prisma. Esquema PG: `pacientes_cache`, `especialidades`, `turnos`, `auditoria`.
- Endpoints REST con OpenAPI 3.1 autogenerado.
- `ms-pacientes` con datos seed (sin integración HIS aún).
- `ms-turnos`: lógica de correlativo diario por especialidad, transaccional.
- Tests unitarios + de integración con testcontainers.

### Sprint 5 — API Gateway + WebSocket pantalla TV (Semana 6)
- Gateway NestJS con `@nestjs/microservices` para hablar con los ms internos.
- Socket.IO namespace `/turnos`.
- App `display-tv`: pantalla pasiva fullscreen que muestra "Turno actual A-024 → Box 3", llamado por voz con `SpeechSynthesis` web.
- Integración frontend kiosco ↔ gateway (eliminar mocks).
- **Demo al cliente**: flujo real con número correlativo y pantalla TV reaccionando.

### Sprint 6 — ms-impresion (impresora térmica) (Semana 7)
- Servicio Node con `node-thermal-printer` o agente Python `python-escpos` (decisión según hardware homologado).
- Cola con reintentos (Bull/BullMQ sobre Redis).
- Diseño del ticket: logo hospital, nº ficha enorme, especialidad, hora estimada, código QR opcional.
- Manejo de fallos: si la impresora muere, kiosko muestra mensaje de respaldo.
- Pruebas con impresora física (idealmente Epson TM-T20 o equivalente).

### Sprint 7 — Hardening, modo kiosco y despliegue piloto (Semana 8)
- Configuración Chromium kiosk mode + autostart.
- Watchdog systemd que reinicia el navegador si se cuelga.
- Backups automáticos de Postgres.
- Métricas Prometheus + dashboard Grafana (turnos/hora, tiempo medio de uso, errores de impresión).
- Documentación de operación para el personal de TI del hospital.
- **Despliegue piloto** en una sola sala, observación de uso real.

### Sprints 8+ (Fase C, fuera del MVP) — Integración HIS
- `ms-integracion-hospital`: cliente HTTPS contra los servicios del hospital.
- Sincronización bidireccional de pacientes y turnos consumidos.
- Cambio transparente: el resto del sistema no se entera.

---

## Consideraciones de Hardware y Despliegue en modo Kiosco

### Hardware recomendado por kiosco
- **All-in-one industrial táctil 21.5"** capacitivo (multi-touch) con vidrio antimicrobial. Marcas: Elo, Advantech, HP RP9.
- **Soporte de pie ergonómico ajustable** (ruedas si la sala lo permite). Altura de pantalla pensada para usuarios sentados en silla de ruedas también (centro de pantalla ≈ 1.20 m).
- **Impresora térmica Epson TM-T20III** (USB) o equivalente con auto-cutter.
- **UPS pequeña** (650 VA) — corte de luz no debe perder un turno en proceso.
- Sin teclado/mouse físico expuestos.

### Software del kiosco
- **Ubuntu 22.04 LTS Desktop** mínimo, o **Debian 12**.
- **Chromium en modo kiosk** vía systemd user service:
  ```
  chromium --kiosk --noerrdialogs --disable-pinch --overscroll-history-navigation=0 \
           --disable-features=TranslateUI --check-for-update-interval=31536000 \
           --autoplay-policy=no-user-gesture-required --app=https://kiosko.local
  ```
- **Desactivar gestos del SO** (Alt+Tab, Ctrl+Alt+T, etc.) con `xdotool` o `/etc/xdg/openbox/rc.xml`.
- **Cron de reinicio diario a las 4:00 AM** para limpieza de memoria.
- **Watchdog systemd** que mata y reinicia chromium si el proceso supera X RAM o no responde a healthcheck.

### Despliegue del backend
- **Edge server** (Intel NUC o servidor 1U) en sala de TI del hospital, en VLAN separada del kiosco.
- **Docker Compose** orquestando: gateway, microservicios, Postgres, Redis, NATS, Loki, Prometheus, Grafana.
- **TLS interno** con certificados emitidos por una mini-CA del hospital o Let's Encrypt si hay DNS interno resolvible.
- **Backups** de Postgres con `pg_dump` cada 6h, retención 30 días, copia rotada a NAS del hospital.
- **mTLS** hacia los servicios HTTPS del hospital cuando llegue Fase C.

### Accesibilidad física complementaria
- **Cartel A3 en la pared** detrás del kiosco con pictogramas grandes del flujo (3 pasos).
- **Botón físico de "Llamar a personal"** debajo del kiosco — opcional pero muy valorado por adultos mayores.
- Iluminación ambiental no directa sobre la pantalla (evitar reflejos).

---

## Verificación End-to-End del MVP

1. **Lighthouse del kiosko** en Chromium: Performance ≥ 90, Accessibility = 100, sin errores en consola.
2. **Test E2E Playwright**: simula los 4 toques (Bienvenida → 6 dígitos → especialidad → confirmación) y valida que aparece el número en pantalla en < 60 s.
3. **Test de usuario real**: 5 personas mayores de 65 años intentan sacar una ficha sin instrucciones previas. Métrica: ≥ 4 de 5 lo logran sin ayuda en primer intento.
4. **Test de carga**: 60 turnos generados en 5 minutos contra `ms-turnos` con `k6`, sin errores ni colisión de correlativos.
5. **Test de resiliencia**:
   - Apagar la impresora → el sistema sigue generando turnos y muestra mensaje claro de respaldo.
   - Cortar la red al edge server → la pantalla TV mantiene último estado y reconecta solo cuando vuelve.
   - `kill -9` al contenedor de `ms-turnos` → Docker lo reinicia y no se pierde el último número correlativo (gracias a Redis + PG).
6. **Auditoría**: `SELECT count(*), max(creado_en) FROM auditoria` cuadra con número de tickets impresos del día.
7. **Inspección manual** de la animación 3 grabada en cámara lenta: sin parpadeos, easings suaves, duración total ≤ 2 s.

---

## Archivos críticos a crear (orden sugerido)

| Sprint | Ruta | Propósito |
|---|---|---|
| 0 | `package.json` (root), `turbo.json`, `docker-compose.yml` | Cimientos monorepo |
| 1 | `packages/ui/src/tokens.ts` | Design system |
| 1 | `packages/ui/src/components/Button.tsx`, `NumericKeypad.tsx` | Primitivos accesibles |
| 1 | `packages/ui/src/hooks/useScreenTransition.ts` | Animación 1 GSAP |
| 1 | `packages/ui/src/hooks/useEchoTouch.ts` | Animación 2 GSAP |
| 2 | `apps/kiosk-web/src/app/(flow)/page.tsx` y subrutas | Las 4 pantallas |
| 2 | `apps/kiosk-web/src/lib/idleTimer.ts` | Timeout amable |
| 3 | `apps/kiosk-web/src/components/SuccessReveal.tsx` | Animación 3 |
| 4 | `services/ms-turnos/src/turnos.service.ts` | Lógica de correlativo |
| 4 | `packages/contracts/openapi.yaml` | Contrato compartido |
| 5 | `services/api-gateway/src/turnos.gateway.ts` | Socket.IO |
| 5 | `apps/display-tv/src/app/page.tsx` | Pantalla TV |
| 6 | `services/ms-impresion/src/printer.service.ts` | ESC/POS |
| 7 | `infra/kiosk-os/chromium-kiosk.service` | Modo kiosco |
| 7 | `infra/edge-server/docker-compose.prod.yml` | Despliegue |
