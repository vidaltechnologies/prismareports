import { compact, fmt, monthLabel, pct } from './format'
import { isEmpty, parseDate, parseNum, type Dataset } from './parse'

export type Agg = 'sum' | 'avg' | 'count'
export interface Settings {
  title: string
  cat: string
  val: string
  agg: Agg
  date: string
}
export interface Group {
  label: string
  value: number
  share: number
}
export interface Report {
  settings: Settings
  fileName: string
  rowCount: number
  colCount: number
  aggLabel: string
  groups: Group[]
  total: number
  avg: number
  min: number
  max: number
  hasValue: boolean
  series: { labels: string[]; values: number[] } | null
  insights: Insight[]
}
/** Um destaque: `strong` é o trecho que ganha ênfase visual. */
export interface Insight {
  text: string
  strong?: string
}

interface Acc {
  sum: number
  count: number
  nums: number
}

export function defaultSettings(ds: Dataset): Settings {
  const cats = ds.columns.filter((c) => c.type === 'category')
  const nums = ds.columns.filter((c) => c.type === 'number')
  const dates = ds.columns.filter((c) => c.type === 'date')
  const cat = cats.find((c) => c.distinct >= 2 && c.distinct <= 12) ?? cats[0] ?? ds.columns[0]
  const val = nums.find((n) => /receita|valor|total|venda|faturamento|amount|revenue|price|preço/i.test(n.name)) ?? nums[0]
  const base = ds.fileName.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ')
  return {
    title: ds.sample ? 'Relatório de vendas' : `Relatório · ${base}`,
    cat: cat?.name ?? '',
    val: val?.name ?? '',
    agg: val ? 'sum' : 'count',
    date: dates[0]?.name ?? '',
  }
}

export function topWithOthers(groups: Group[], n: number): Group[] {
  if (groups.length <= n) return groups
  const rest = groups.slice(n - 1)
  return [
    ...groups.slice(0, n - 1),
    {
      label: `Outros (${rest.length})`,
      value: rest.reduce((s, g) => s + g.value, 0),
      share: rest.reduce((s, g) => s + g.share, 0),
    },
  ]
}

export function buildReport(ds: Dataset, s: Settings): Report {
  const agg: Agg = s.val ? s.agg : 'count'
  const groups = new Map<string, Acc>()
  let total = 0
  let cnt = 0
  let min = Infinity
  let max = -Infinity
  for (const r of ds.rows) {
    const k = isEmpty(r[s.cat]) ? '(vazio)' : String(r[s.cat]).trim()
    const n = s.val ? parseNum(r[s.val]) : null
    const g = groups.get(k) ?? { sum: 0, count: 0, nums: 0 }
    g.count++
    if (n !== null) {
      g.sum += n
      g.nums++
      total += n
      cnt++
      min = Math.min(min, n)
      max = Math.max(max, n)
    }
    groups.set(k, g)
  }
  const metric = (g: Acc) => (agg === 'sum' ? g.sum : agg === 'avg' ? (g.nums ? g.sum / g.nums : 0) : g.count)
  const ranked: Group[] = [...groups.entries()]
    .map(([label, g]) => ({
      label,
      value: metric(g),
      share: agg === 'count' ? g.count / ds.rows.length : total ? g.sum / total : 0,
    }))
    .sort((a, b) => b.value - a.value)

  let series: Report['series'] = null
  if (s.date) {
    const m = new Map<string, Acc>()
    for (const r of ds.rows) {
      const d = parseDate(r[s.date])
      if (!d) continue
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const g = m.get(key) ?? { sum: 0, count: 0, nums: 0 }
      const n = s.val ? parseNum(r[s.val]) : null
      g.count++
      if (n !== null) {
        g.sum += n
        g.nums++
      }
      m.set(key, g)
    }
    const keys = [...m.keys()].sort()
    if (keys.length >= 2) series = { labels: keys.map(monthLabel), values: keys.map((k) => metric(m.get(k)!)) }
  }

  const aggLabel = agg === 'sum' ? `Soma de ${s.val}` : agg === 'avg' ? `Média de ${s.val}` : 'Quantidade de linhas'
  const report: Report = {
    settings: { ...s, agg },
    fileName: ds.fileName,
    rowCount: ds.rows.length,
    colCount: ds.columns.length,
    aggLabel,
    groups: ranked,
    total,
    avg: cnt ? total / cnt : 0,
    min: cnt ? min : 0,
    max: cnt ? max : 0,
    hasValue: !!s.val && cnt > 0,
    series,
    insights: [],
  }
  report.insights = buildInsights(report)
  return report
}

function buildInsights(R: Report): Insight[] {
  const out: Insight[] = []
  const { cat, val, agg } = R.settings
  const top = R.groups[0]
  if (top) out.push({ strong: top.label, text: `${top.label} lidera em ${cat}, com ${pct(top.share)} do ${agg === 'count' ? 'total de linhas' : 'total de ' + val}.` })
  if (R.groups.length >= 3) {
    const top3 = R.groups.slice(0, 3).reduce((s, x) => s + x.share, 0)
    out.push({ text: `Os 3 maiores grupos somam ${pct(top3)} do total, entre ${R.groups.length} grupos.` })
  }
  if (R.groups.length >= 2) {
    const last = R.groups[R.groups.length - 1]
    out.push({ strong: last.label, text: `Menor resultado: ${last.label} (${fmt(last.value)}).` })
  }
  if (R.series) {
    const v = R.series.values
    const a = v[v.length - 2]
    const b = v[v.length - 1]
    if (a) out.push({ text: `No último mês (${R.series.labels.at(-1)}) a variação foi de ${b >= a ? '+' : ''}${pct((b - a) / Math.abs(a))} em relação ao mês anterior.` })
    const iMax = v.indexOf(Math.max(...v))
    out.push({ text: `Melhor mês: ${R.series.labels[iMax]} (${compact(v[iMax])}).` })
  }
  if (R.hasValue) out.push({ text: `${val} varia de ${fmt(R.min)} a ${fmt(R.max)}, com média de ${fmt(R.avg)} por linha.` })
  return out
}
