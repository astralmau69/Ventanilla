"use client";

import { EchoButton } from "./EchoButton";

interface NumericKeypadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onConfirm: () => void;
  canConfirm: boolean;
}

const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

export function NumericKeypad({ onDigit, onBackspace, onConfirm, canConfirm }: NumericKeypadProps) {
  return (
    <div className="grid grid-cols-3 gap-4" role="group" aria-label="Teclado numérico">
      {digits.map((d) => (
        <EchoButton key={d} variant="key" data-stagger aria-label={`Número ${d}`} onClick={() => onDigit(d)}>
          {d}
        </EchoButton>
      ))}
      <EchoButton variant="keyAction" data-stagger aria-label="Borrar" onClick={onBackspace}>⌫</EchoButton>
      <EchoButton variant="key"       data-stagger aria-label="Número 0" onClick={() => onDigit("0")}>0</EchoButton>
      <EchoButton variant="keyAction" data-stagger aria-label="Confirmar" disabled={!canConfirm} onClick={onConfirm}
        className={!canConfirm ? "opacity-40 cursor-not-allowed" : ""}>OK</EchoButton>
    </div>
  );
}
