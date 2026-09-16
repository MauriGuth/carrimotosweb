type Props = {
  className?: string;
  /** 'full' incluye las franjas y la palabra "Motos". 'mark' es sólo CARRI. */
  variante?: 'full' | 'mark';
};

/**
 * Logo de CARRI Motos, reconstruido en SVG para que escale y funcione sobre
 * fondo oscuro. Si más adelante querés usar el archivo original, reemplazá
 * este componente por una <Image src="/logo.png" .../>.
 */
export default function Logo({ className = 'h-10 w-auto', variante = 'full' }: Props) {
  const alto = variante === 'full' ? 118 : 74;

  return (
    <svg
      viewBox={`0 0 300 ${alto}`}
      className={className}
      role="img"
      aria-label="CARRI Motos"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="carri-rojo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f22730" />
          <stop offset="100%" stopColor="#c8121a" />
        </linearGradient>
        <linearGradient id="carri-franja" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8d8d97" />
          <stop offset="55%" stopColor="#d9d9e0" />
          <stop offset="100%" stopColor="#5d5d66" />
        </linearGradient>
      </defs>

      {/* Sombra en relieve del wordmark */}
      <text
        x="6"
        y="60"
        fontFamily="var(--font-display)"
        fontSize="68"
        fontWeight="700"
        letterSpacing="-1"
        fill="#7a0d12"
        transform="translate(5 6)"
      >
        CARRI
      </text>

      <text
        x="6"
        y="60"
        fontFamily="var(--font-display)"
        fontSize="68"
        fontWeight="700"
        letterSpacing="-1"
        fill="url(#carri-rojo)"
      >
        CARRI
      </text>

      {variante === 'full' && (
        <>
          {/* Franjas de velocidad */}
          <g transform="skewX(35)" opacity="0.95">
            <rect x="-44" y="70" width="116" height="10" fill="url(#carri-franja)" />
            <rect x="-44" y="85" width="110" height="10" fill="url(#carri-franja)" />
            <rect x="-44" y="100" width="104" height="10" fill="url(#carri-franja)" />
          </g>

          <text
            x="150"
            y="111"
            fontFamily="var(--font-display)"
            fontSize="50"
            fontWeight="700"
            letterSpacing="-0.5"
            fill="currentColor"
          >
            Motos
          </text>
        </>
      )}
    </svg>
  );
}
