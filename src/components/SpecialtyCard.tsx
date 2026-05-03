"use client";

interface SpecialtyCardProps {
  icon: string;
  label: string;
  description?: string;
  waitTime?: string;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
}

/**
 * Tarjeta de especialidad médica — Tactilidad Extrema (Neo-Brutalismo).
 */
export function SpecialtyCard({
  icon,
  label,
  description,
  waitTime,
  onClick,
  disabled,
  selected,
}: SpecialtyCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={`Especialidad: ${label}${waitTime ? `, espera estimada ${waitTime}` : ""}`}
      className={[
        // Base — bloque físico
        "relative flex flex-col items-start gap-4 p-8 text-left",
        "min-h-[220px] w-full rounded-2xl",
        "transition-all duration-75 cursor-pointer",
        // En light y dark usamos borde grueso y sombra sólida
        "border-4 border-border",
        // Estados
        disabled
          ? "opacity-30 bg-surface shadow-none cursor-not-allowed translate-y-0"
          : selected
            ? "bg-accent text-accent-fg shadow-none translate-x-[6px] translate-y-[6px]" // Físicamente hundido al seleccionar
            : "bg-surface text-primary shadow-surface active:shadow-active active:translate-x-[6px] active:translate-y-[6px]",
        "focus-visible:ring-4 focus-visible:ring-accent outline-none",
        "select-none",
      ].join(" ")}
      style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
    >
      {/* Ícono gigante */}
      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-5xl border-4 ${selected ? 'bg-white text-accent border-transparent' : 'bg-background border-border'}`}>
        {icon}
      </div>

      {/* Textos Masivos */}
      <div className="flex-1 mt-2">
        <h3 className={`text-4xl font-extrabold leading-tight tracking-tight uppercase ${selected ? 'text-accent-fg' : 'text-primary'}`}>
          {label}
        </h3>
        {description && (
          <p className={`text-xl mt-3 font-bold ${selected ? 'text-accent-fg/90' : 'text-muted'}`}>
            {description}
          </p>
        )}
      </div>

      {/* Badge de tiempo de espera, muy visible */}
      {waitTime && (
        <div className={`mt-4 px-6 py-3 text-xl rounded-2xl border-4 font-extrabold tracking-widest uppercase ${selected ? 'bg-white text-accent border-transparent' : 'bg-accent text-accent-fg border-border'}`}>
          ⏱ {waitTime}
        </div>
      )}

      {/* Flecha grande y cruda */}
      <div className={`absolute right-8 top-1/2 -translate-y-1/2 text-5xl font-bold ${selected ? 'text-accent-fg' : 'text-muted'}`} aria-hidden>
        →
      </div>
    </button>
  );
}
