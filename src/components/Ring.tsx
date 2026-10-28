import { pct } from '../lib/format'

interface Props {
  share: number
  color: string
  track: string
  textColor: string
  font: string
  size: number
}

/** Anel de percentual em SVG: nítido na tela e na captura do PDF. */
export function Ring({ share, color, track, textColor, font, size }: Props) {
  const stroke = size * 0.11
  const r = (size - stroke) / 2 - 1
  const c = 2 * Math.PI * r
  const dash = Math.min(1, Math.max(0, share)) * c
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={pct(share)}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
      {share > 0 && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      )}
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fill={textColor}
        style={{ font: `700 ${size * 0.2}px ${font}` }}
      >
        {pct(share)}
      </text>
    </svg>
  )
}
