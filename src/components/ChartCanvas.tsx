import { useEffect, useRef } from 'react'
import { Chart } from 'chart.js'
import { chartConfig, type ChartKind, type ChartLook } from '../lib/charts'
import type { Report } from '../lib/report'

interface Props {
  kind: ChartKind
  report: Report
  look: ChartLook
  label: string
}

export function ChartCanvas({ kind, report, look, label }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cfg = chartConfig(kind, report, look)
    if (!ref.current || !cfg) return
    const chart = new Chart(ref.current, cfg)
    return () => chart.destroy()
  }, [kind, report, look])
  return (
    <div className="chart-box">
      <canvas ref={ref} role="img" aria-label={label} />
    </div>
  )
}
