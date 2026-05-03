"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "ghost" | "surface" | "key" | "keyAction" | "gold" | "danger";

interface EchoButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  /* CTA principal — navy con marfil */
  primary:
    "bg-accent text-accent-fg border border-transparent rounded-2xl font-bold " +
    "shadow-card active:scale-[0.97] active:shadow-sm",

  /* Secundario — superficie crema con borde arena */
  surface:
    "bg-surface text-primary border border-border rounded-2xl font-bold " +
    "shadow-sm active:scale-[0.97] active:shadow-xs active:bg-background",

  /* Ghost sutil — sin fondo */
  ghost:
    "bg-transparent text-muted border border-transparent rounded-2xl font-bold " +
    "hover:border-border hover:text-primary active:bg-surface active:scale-[0.97]",

  /* Tecla de teclado */
  key:
    "bg-surface text-primary border border-border rounded-2xl font-bold " +
    "flex items-center justify-center min-w-touch min-h-touch text-3xl " +
    "shadow-xs active:bg-accent active:text-accent-fg active:border-accent active:scale-[0.95] active:shadow-md",

  /* Tecla de acción (Borrar / OK) */
  keyAction:
    "bg-accent text-accent-fg border border-transparent rounded-2xl font-bold " +
    "flex items-center justify-center min-w-touch min-h-touch text-2xl tracking-wide " +
    "shadow-sm active:scale-[0.95] active:shadow-xs active:opacity-90",

  /* Gold — para acciones de confirmación elegantes */
  gold:
    "bg-gold text-gold-fg border border-transparent rounded-2xl font-bold " +
    "shadow-md active:scale-[0.97] active:shadow-xs active:opacity-90",

  /* Destructivo */
  danger:
    "bg-danger text-white border border-transparent rounded-2xl font-bold " +
    "shadow-sm active:scale-[0.97] active:shadow-xs",
};

export const EchoButton = forwardRef<HTMLButtonElement, EchoButtonProps>(
  function EchoButton(
    { variant = "primary", children, className = "", onPointerDown, style, ...rest },
    forwardedRef
  ) {
    return (
      <button
        ref={forwardedRef}
        {...rest}
        onPointerDown={onPointerDown}
        style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation", ...style }}
        className={[
          "relative select-none outline-none",
          "transition-all duration-150 ease-out cursor-pointer",
          "focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2",
          "disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none",
          variants[variant],
          className,
        ].join(" ")}
      >
        {/* Anillo de eco táctil */}
        <span className="echo-ring" aria-hidden />
        <span className="relative z-10 inline-flex items-center justify-center gap-2 w-full h-full">
          {children}
        </span>
      </button>
    );
  }
);
