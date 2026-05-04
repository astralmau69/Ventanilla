/**
 * printTicket — imprime la ficha directamente en la impresora térmica.
 *
 * En Chromium kiosco con la flag --kiosk-printing el diálogo de impresora
 * se salta automáticamente y envía el trabajo a la impresora por defecto.
 * En desarrollo sí aparece el diálogo del navegador (comportamiento esperado).
 *
 * El ticket está optimizado para papel térmico de 80 mm (576 px útiles).
 */

export interface TicketData {
  fichaNumero: string;          // "A-042"
  pacienteNombre: string;
  pacienteCarnet: string;
  regional: string;
  especialidad: string;
  medico: string;               // título + nombre
  consultorio: string;
  fechaCita: string;            // texto formateado, ej. "lunes, 6 de mayo 2026"
  horaCita: string;             // "08:30"
  fechaEmision: string;         // "03/05/2026 14:22"
}

export function printTicket(data: TicketData): void {
  const html = buildTicketHTML(data);

  const iframe = document.createElement("iframe");
  iframe.style.cssText =
    "position:absolute;width:0;height:0;border:none;visibility:hidden;";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument!;
  doc.open();
  doc.write(html);
  doc.close();

  // Esperar a que cargue el contenido antes de imprimir
  iframe.onload = () => {
    iframe.contentWindow?.print();
    // Limpiar el iframe después de que el trabajo se despache
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 2000);
  };

  // Fallback por si onload no dispara (algunos navegadores)
  setTimeout(() => {
    if (iframe.isConnected) {
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (iframe.isConnected) document.body.removeChild(iframe);
      }, 2000);
    }
  }, 400);
}

/** Genera el número de ficha: "A-" + correlativo 3 dígitos (mock) */
export function generarNumeroFicha(): string {
  // En producción este número viene de ms-turnos (Redis INCR diario por especialidad)
  const n = Math.floor(Math.random() * 150) + 1;
  return `A-${String(n).padStart(3, "0")}`;
}

/* ── HTML del ticket — optimizado para 80 mm (impresora térmica) ── */
function buildTicketHTML(d: TicketData): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Ficha Médica ${d.fichaNumero}</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 4mm 3mm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 11pt;
      color: #000;
      background: #fff;
      width: 74mm;
    }

    /* ── Cabecera ── */
    .header {
      text-align: center;
      border-bottom: 1px dashed #000;
      padding-bottom: 6px;
      margin-bottom: 8px;
    }
    .header .hospital {
      font-size: 13pt;
      font-weight: bold;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .header .subtitle {
      font-size: 9pt;
      margin-top: 2px;
    }

    /* ── Número de ficha ── */
    .ticket-number {
      text-align: center;
      margin: 8px 0;
      padding: 6px 0;
      border: 2px solid #000;
    }
    .ticket-number .label {
      font-size: 9pt;
      text-transform: uppercase;
      letter-spacing: 0.15em;
    }
    .ticket-number .number {
      font-size: 42pt;
      font-weight: bold;
      line-height: 1.1;
      letter-spacing: 0.05em;
    }

    /* ── Sección de datos ── */
    .section {
      margin: 6px 0;
      border-bottom: 1px dotted #888;
      padding-bottom: 5px;
    }
    .section:last-of-type { border-bottom: none; }

    .row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 4px;
      margin-bottom: 3px;
    }
    .row-col {
      margin-bottom: 4px;
    }
    .row-col .field-label {
      margin-bottom: 1px;
    }
    .field-label {
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #555;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .field-value {
      font-size: 11pt;
      font-weight: bold;
      text-align: right;
      word-break: break-word;
    }
    .field-value-full {
      font-size: 11pt;
      font-weight: bold;
    }

    /* ── Fecha y hora de cita ── */
    .cita-block {
      text-align: center;
      margin: 6px 0;
      padding: 5px;
      border: 1px solid #000;
    }
    .cita-block .cita-label {
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      margin-bottom: 2px;
    }
    .cita-block .cita-fecha {
      font-size: 12pt;
      font-weight: bold;
    }
    .cita-block .cita-hora {
      font-size: 16pt;
      font-weight: bold;
      letter-spacing: 0.08em;
    }

    /* ── Pie ── */
    .footer {
      text-align: center;
      margin-top: 8px;
      padding-top: 5px;
      border-top: 1px dashed #000;
      font-size: 8.5pt;
      line-height: 1.5;
    }
    .footer .aviso {
      font-weight: bold;
      text-transform: uppercase;
      font-size: 9pt;
    }
    .emision {
      font-size: 7.5pt;
      color: #777;
      margin-top: 5px;
    }
  </style>
</head>
<body>
  <!-- Cabecera -->
  <div class="header">
    <div class="hospital">Centro de Salud</div>
    <div class="subtitle">Sistema de Turnos Médicos</div>
  </div>

  <!-- Número de ficha (protagonista) -->
  <div class="ticket-number">
    <div class="label">Su número de atención</div>
    <div class="number">${d.fichaNumero}</div>
  </div>

  <!-- Datos del paciente -->
  <div class="section">
    <div class="row-col">
      <div class="field-label">Paciente</div>
      <div class="field-value-full">${d.pacienteNombre}</div>
    </div>
    <div class="row">
      <div class="field-label">C.I.</div>
      <div class="field-value">${d.pacienteCarnet}</div>
    </div>
  </div>

  <!-- Datos de la cita -->
  <div class="section">
    <div class="row">
      <div class="field-label">Regional</div>
      <div class="field-value">${d.regional}</div>
    </div>
    <div class="row-col">
      <div class="field-label">Especialidad</div>
      <div class="field-value-full">${d.especialidad}</div>
    </div>
    <div class="row-col">
      <div class="field-label">Médico</div>
      <div class="field-value-full">${d.medico}</div>
    </div>
    <div class="row">
      <div class="field-label">Consultorio</div>
      <div class="field-value">${d.consultorio}</div>
    </div>
  </div>

  <!-- Fecha y hora de la cita -->
  <div class="cita-block">
    <div class="cita-label">Fecha y hora de su cita</div>
    <div class="cita-fecha">${d.fechaCita}</div>
    <div class="cita-hora">${d.horaCita}</div>
  </div>

  <!-- Pie -->
  <div class="footer">
    <div class="aviso">Preséntese 10 min antes</div>
    <div>Traiga este comprobante y su C.I.</div>
    <div>ante el personal de admisión</div>
    <div class="emision">Emitido: ${d.fechaEmision}</div>
  </div>
</body>
</html>`;
}
