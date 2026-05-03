"use client";

import { useCallback } from "react";

interface AlphanumericKeypadProps {
  onKey: (char: string) => void;
  onBackspace: () => void;
  onConfirm: () => void;
  canConfirm: boolean;
}

const ROW_NUMS = ["1","2","3","4","5","6","7","8","9","0"];
const ROW_Q    = ["Q","W","E","R","T","Y","U","I","O","P"];
const ROW_A    = ["A","S","D","F","G","H","J","K","L"];
const ROW_Z    = ["Z","X","C","V","B","N","M"];

interface KeyProps {
  label: string;
  onPress: () => void;
  ariaLabel?: string;
}

function Key({ label, onPress, ariaLabel }: KeyProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel ?? label}
      onPointerDown={onPress}
      className="kiosk-key flex-1 font-ui uppercase"
      style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
    >
      {label}
    </button>
  );
}

/* ─── Ícono de retroceso SVG ─── */
function IconBackspace() {
  return (
    <svg width="30" height="24" viewBox="0 0 30 24" fill="none" aria-hidden>
      <path
        d="M10 12H26M10 12L16 6M10 12L16 18"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d="M4 12L8 6H26V18H8L4 12Z"
        stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"
      />
    </svg>
  );
}

export function AlphanumericKeypad({
  onKey,
  onBackspace,
  onConfirm,
  canConfirm,
}: AlphanumericKeypadProps) {
  const handleKey = useCallback((k: string) => () => onKey(k), [onKey]);

  return (
    <div
      className="flex flex-col gap-3 w-full max-w-4xl"
      role="group"
      aria-label="Teclado alfanumérico"
    >
      {/* Fila 1–0 */}
      <div className="flex gap-3">
        {ROW_NUMS.map((k) => (
          <Key key={k} label={k} onPress={handleKey(k)} />
        ))}
      </div>

      {/* Fila Q–P */}
      <div className="flex gap-3">
        {ROW_Q.map((k) => (
          <Key key={k} label={k} onPress={handleKey(k)} />
        ))}
      </div>

      {/* Fila A–L + ⌫ */}
      <div className="flex gap-3">
        {ROW_A.map((k) => (
          <Key key={k} label={k} onPress={handleKey(k)} />
        ))}
        <button
          type="button"
          aria-label="Borrar último carácter"
          onPointerDown={onBackspace}
          className="kiosk-key flex-[1.5] font-ui"
          style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
        >
          <IconBackspace />
        </button>
      </div>

      {/* Fila Z–M + OK */}
      <div className="flex gap-3">
        <div className="flex-[0.75]" />
        {ROW_Z.map((k) => (
          <Key key={k} label={k} onPress={handleKey(k)} />
        ))}

        <button
          type="button"
          aria-label="Confirmar carnet"
          disabled={!canConfirm}
          onPointerDown={canConfirm ? onConfirm : undefined}
          className={[
            "kiosk-key flex-[2.25] font-ui uppercase tracking-[0.12em] text-2xl",
            canConfirm
              ? "!bg-accent !text-accent-fg !border-transparent !shadow-card hover:!opacity-95"
              : "!bg-surface !text-border !border-border !shadow-none !opacity-40 !cursor-not-allowed !pointer-events-none",
          ].join(" ")}
          style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
        >
          Confirmar
        </button>
        <div className="flex-[0.75]" />
      </div>
    </div>
  );
}
