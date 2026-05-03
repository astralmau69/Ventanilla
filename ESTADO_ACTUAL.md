# Estado actual del proyecto — Kiosco Hospitalario Táctil

**Fecha:** 2 de mayo 2026  
**Fase:** POC Frontend (Sprint 0 + Sprint 1 completos)

---

## ¿Qué es este proyecto?

Un sistema web táctil de **sacado de fichas hospitalarias** diseñado específicamente para adultos mayores. El paciente toca la pantalla, ingresa su número de carnet, elige su especialidad y recibe su ticket impreso en papel térmico. Todo el flujo en ≤ 4 toques, en ≤ 60 segundos, sin distracciones.

---

## Stack tecnológico instalado y funcionando

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js | 15.5.15 |
| UI | React | 19.0.0 |
| Lenguaje | TypeScript | 5.7.x |
| Estilos | Tailwind CSS | 3.4.x |
| Animaciones | GSAP + @gsap/react | 3.12.x / 2.1.x |
| Tipografía | Atkinson Hyperlegible | vía next/font |
| Runtime | Node.js | 24.x |

---

## Estructura de archivos creada

```
D:/Cossmil/Touchpad/
├── src/
│   ├── app/
│   │   ├── layout.tsx          ← Root layout con fuente Atkinson + viewport kiosco
│   │   ├── page.tsx            ← Entry point → monta <KioskApp>
│   │   └── globals.css         ← Tailwind base + .screen + .echo-ring
│   │
│   ├── components/
│   │   ├── KioskApp.tsx        ← Orquestador de estado y transiciones GSAP
│   │   ├── EchoButton.tsx      ← Botón accesible con animación de eco táctil
│   │   ├── NumericKeypad.tsx   ← Teclado numérico de 12 teclas (88-120 px touch)
│   │   └── screens/
│   │       ├── WelcomeScreen.tsx   ← Pantalla P0: Bienvenida
│   │       └── CarnetScreen.tsx    ← Pantalla P1: Ingreso de carnet
│   │
│   └── hooks/
│       ├── useEchoTouch.ts         ← Animación 2: pulso de eco al tocar
│       └── useScreenTransition.ts  ← Animación 1: curtain reveal con stagger
│
├── tailwind.config.ts          ← Tokens: colores, tipografía, touch targets
├── next.config.ts
├── tsconfig.json
├── package.json
└── .claude/launch.json         ← Dev server para preview
```

---

## Lo que funciona HOY

### Pantalla P0 — Bienvenida
- Saludo dinámico según hora local ("Buenos días / Buenas tardes / Buenas noches")
- Botón CTA gigante ("Toque aquí para comenzar") — 767 px de ancho
- Texto de ayuda en la parte inferior
- Botón de accesibilidad "Aa" permanente en esquina
- Reloj en tiempo real (sin segundos, se actualiza c/30s)
- Animación de entrada: elementos aparecen con stagger de 100 ms

### Pantalla P1 — Ingreso de carnet
- 6 slots visuales de dígitos (80×80 px, border activo al completar)
- Teclado numérico completo: 1-9 + ⌫ (borrar) + 0 + OK
- El botón OK se habilita solo al completar los 6 dígitos
- Botón "Volver" siempre visible en esquina superior izquierda
- Sin posibilidad de ingresar letras (teclado numérico puro)

### Animación 1 — Transición de pantallas (curtain reveal)
- P0 → P1: la bienvenida se desliza a -8% con fade out
- P1 aparece deslizándose desde +8% con fade in (~550 ms)
- Los elementos de P1 aparecen en stagger de 80 ms cada uno
- Guarda al usuario la percepción de "avancé a otro paso"
- Duración total: ~800 ms (el doble del estándar para adultos mayores)

### Animación 2 — Eco táctil (feedback de toque)
- Al tocar cualquier botón: se hunde levemente (scale 0.97) y rebota suave
- Un anillo expansivo sale del botón y desaparece (escala 0.85 → 1.55)
- Confirmación visual clara incluso con reflejos en pantalla o cataratas leves
- No usa el ripple agresivo de Material Design

### Design System
- **Paleta:** `#FAFAF7` fondo hueso · `#0A2540` azul hospital · `#F5A623` ámbar CTA
- **Tipografía:** Atkinson Hyperlegible (diseñada por Braille Institute para baja visión)
  - Cuerpo: 32px · Botones: 36px · Subtítulos: 48px · Títulos: 72px
- **Touch targets:** min 88px, ideal 120px, separación 16-24px entre botones
- **Accesibilidad:** `prefers-reduced-motion` respetado, sin tap-highlight, `user-select: none`

---

## Métricas de build

| Métrica | Valor |
|---|---|
| Build de producción | ✅ exitoso |
| TypeScript errors | 0 |
| Tamaño de página principal | 30.7 kB |
| First Load JS | 133 kB |
| Console errors | 0 |

---

## Lo que FALTA por construir

### Sprint 2 — Frontend completo con mocks (próximo)
- [ ] Pantalla P2: Elegir especialidad (grilla de botones con stagger)
- [ ] Pantalla P3: Confirmación / éxito (Animación 3: número de ficha revelado)
- [ ] Estados de error amables (carnet no encontrado, sin conexión, impresora sin papel)
- [ ] Timeout de inactividad (90 s) con modal calmado "¿Sigue ahí?"
- [ ] Modo alto contraste y "letra más grande"
- [ ] MSW (Mock Service Worker) para simular respuestas del backend
- [ ] Tests E2E con Playwright en modo touch

### Sprint 3 — Animación 3 + errores
- [ ] Animación de revelación del número de ficha (dígitos caen, check se dibuja, ticket SVG sale)
- [ ] Pantallas de error con "Llamar a personal" como acción principal

### Sprints 4-7 — Backend + despliegue (Fase B)
- [ ] **ms-pacientes** — lookup por nº de carnet (NestJS + Prisma + PostgreSQL)
- [ ] **ms-turnos** — generación de correlativo diario por especialidad + Redis
- [ ] **API Gateway** — REST + Socket.IO para pantalla TV
- [ ] **ms-pantalla-display** — WebSocket hacia pantalla TV de sala
- [ ] **ms-impresion** — ESC/POS hacia impresora térmica Epson TM-T20
- [ ] Docker Compose de producción en edge server del hospital
- [ ] Chromium modo kiosco (fullscreen, sin UI del navegador)
- [ ] Watchdog systemd

### Fase C — Integración HIS (futuro)
- [ ] **ms-integracion-hospital** — cliente HTTPS hacia los servicios del hospital
- [ ] Sincronización bidireccional de pacientes
- [ ] mTLS hacia servicios del hospital

---

## Cómo correr el proyecto ahora

```bash
cd D:/Cossmil/Touchpad

# Instalar (ya hecho, por referencia)
npm install

# Dev server
npm run dev        # → http://localhost:3217

# Typecheck
npm run typecheck

# Build producción
npm run build
```

---

## Decisiones de arquitectura tomadas

1. **Frontend primero** — se puede mostrar al cliente una demo navegable sin backend, desde la semana 1.
2. **Backend autónomo** — no depende del HIS del hospital para funcionar. La integración con los servicios HTTPS del hospital es un adapter aislado (Fase C).
3. **Una sola app React por kiosco** — no Next.js page-to-page navigation para las 4 pantallas; el estado vive en `KioskApp.tsx` para que GSAP pueda animar entre pantallas con ambas montadas simultáneamente.
4. **html font-size = 16px** — Tailwind usa rem. La escala tipográfica grande se aplica solo en body (32px) y vía clases utilitarias (`text-h1`, `text-button`...), no en el root.
5. **Eco táctil vs ripple** — ripple de Material Design demasiado rápido para adulto mayor; reemplazado por pulso de eco más lento y visible.
