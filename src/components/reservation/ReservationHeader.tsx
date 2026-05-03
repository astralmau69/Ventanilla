"use client";

const ROMAN = ["I", "II", "III", "IV"] as const;

interface ReservationHeaderProps {
  step: 1 | 2 | 3 | 4;
  title: string;
  subtitle?: string;
  onBack: () => void;
}

function IconBack() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M11 4L6 9L11 14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ReservationHeader({ step, title, subtitle, onBack }: ReservationHeaderProps) {
  return (
    <div className="w-full bg-surface/90 border-b border-border backdrop-blur-sm px-10 py-5 flex-shrink-0">
      <div className="flex items-center justify-between mb-4">
        {/* Botón atrás */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted hover:text-primary transition-colors duration-150 font-ui text-lg tracking-wide uppercase font-bold"
          style={{ touchAction: "manipulation" }}
          aria-label="Volver al paso anterior"
        >
          <IconBack />
          Atrás
        </button>

        {/* Indicador de pasos */}
        <div className="flex items-center gap-3">
          <span className="font-display text-xl italic text-muted">
            Paso {ROMAN[step - 1]} de IV
          </span>
          <div className="flex gap-1.5 items-center">
            {([1, 2, 3, 4] as const).map((n) => (
              <div
                key={n}
                className={[
                  "h-px rounded-full transition-all duration-400",
                  n <= step ? "w-10 bg-accent" : "w-10 bg-border",
                ].join(" ")}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Título del paso */}
      <div>
        <h2 className="font-display text-5xl font-light italic text-primary leading-none tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="font-ui text-lg text-muted mt-1 tracking-wide">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
