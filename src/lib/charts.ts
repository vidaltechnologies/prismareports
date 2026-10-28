import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  DoughnutController,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  type ChartConfiguration,
} from 'chart.js'
import { compact, fmt, pct } from './format'
import { topWithOthers, type Report } from './report'

Chart.register(BarController, BarElement, CategoryScale, LinearScale, DoughnutController, ArcElement, LineController, LineElement, PointElement, Filler, Legend, Tooltip)

export type ChartKind = 'bar' | 'pie' | 'line' | 'compare'

/** Cores e tipografia que um gráfico precisa; vêm do tema e do contexto (painel ou slide). */
export interface ChartLook {
  palette: string[]
  fg: string
  muted: string
  line: string
  surface: string
  font: string
  fontSize: number
  /** Slides não animam, para a captura do PDF sair completa. */
  animate: boolean
  legendBottom?: boolean
}

export function chartConfig(kind: ChartKind, R: Report, L: ChartLook): ChartConfiguration | null {
  const font = { family: L.font, size: L.fontSize }
  const axis = {
    ticks: { color: L.muted, font },
    grid: { color: L.line },
    border: { color: L.line },
  }
  const base = {
    responsive: true,
    maintainAspectRatio: false,
    animation: L.animate ? { duration: 400 } : (false as const),
  }

  if (kind === 'bar') {
    const top = R.groups.slice(0, 12)
    const horizontal = top.length > 6
    return {
      type: 'bar',
      data: {
        labels: top.map((g) => g.label),
        datasets: [
          {
            label: R.aggLabel,
            data: top.map((g) => g.value),
            backgroundColor: top.map((_, i) => (i === 0 ? L.palette[0] : L.palette[0] + '99')),
            borderRadius: 6,
            maxBarThickness: 56,
          },
        ],
      },
      options: {
        ...base,
        indexAxis: horizontal ? 'y' : 'x',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => ' ' + fmt(horizontal ? c.parsed.x : c.parsed.y) } },
        },
        scales: {
          // Só o eixo de valores ganha o formato curto; o eixo de categorias mantém os nomes.
          x: horizontal ? { ...axis, ticks: { ...axis.ticks, callback: (v) => compact(+v) } } : axis,
          y: horizontal ? axis : { ...axis, ticks: { ...axis.ticks, callback: (v) => compact(+v) } },
        },
      },
    }
  }

  if (kind === 'pie') {
    const items = topWithOthers(R.groups, 6)
    const colors = items.map((_, i) => L.palette[i % L.palette.length])
    const pie: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: items.map((g) => g.label),
        datasets: [{ data: items.map((g) => g.share), backgroundColor: colors, borderColor: L.surface, borderWidth: 2 }],
      },
      options: {
        ...base,
        cutout: '58%',
        plugins: {
          legend: {
            position: L.legendBottom ? 'bottom' : 'right',
            labels: {
              color: L.fg,
              font,
              boxWidth: 14,
              padding: 14,
              generateLabels: () =>
                items.map((g, i) => ({ text: `${g.label}  ${pct(g.share)}`, fillStyle: colors[i], strokeStyle: colors[i], fontColor: L.fg, index: i, lineWidth: 0 })),
            },
          },
          tooltip: { callbacks: { label: (c) => ` ${c.label}: ${pct(c.parsed)}` } },
        },
      },
    }
    return pie as unknown as ChartConfiguration
  }

  if (kind === 'compare') {
    const C = R.compare
    if (!C) return null
    // Dois eixos: as colunas costumam ter escalas diferentes (ex.: receita e quantidade).
    const legend = { display: true, position: 'top' as const, align: 'center' as const, labels: { color: L.fg, font, boxWidth: 14, padding: 16 } }
    return {
      type: 'bar',
      data: {
        labels: C.labels,
        datasets: [
          { label: C.nameA, data: C.a, backgroundColor: L.palette[0], borderRadius: 5, maxBarThickness: 40, yAxisID: 'y' },
          { label: C.nameB, data: C.b, backgroundColor: L.palette[1], borderRadius: 5, maxBarThickness: 40, yAxisID: 'y1' },
        ],
      },
      options: {
        ...base,
        plugins: { legend, tooltip: { callbacks: { label: (c) => ` ${c.dataset.label}: ${fmt(c.parsed.y)}` } } },
        scales: {
          x: axis,
          y: { ...axis, position: 'left', ticks: { ...axis.ticks, color: L.palette[0], callback: (v) => compact(+v) } },
          y1: { ...axis, position: 'right', grid: { drawOnChartArea: false }, ticks: { ...axis.ticks, color: L.palette[1], callback: (v) => compact(+v) } },
        },
      },
    }
  }

  if (!R.series) return null
  const color = L.palette[2]
  return {
    type: 'line',
    data: {
      labels: R.series.labels,
      datasets: [
        {
          label: R.aggLabel,
          data: R.series.values,
          borderColor: color,
          backgroundColor: color + '22',
          fill: true,
          tension: 0.3,
          cubicInterpolationMode: 'monotone',
          borderWidth: 2.5,
          pointRadius: R.series.values.map((_, i, a) => (i === a.length - 1 ? 5 : 2)),
          pointBackgroundColor: color,
        },
      ],
    },
    options: {
      ...base,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ' ' + fmt(c.parsed.y) } } },
      scales: { x: axis, y: { ...axis, ticks: { ...axis.ticks, callback: (v) => compact(+v) } } },
    },
  }
}
