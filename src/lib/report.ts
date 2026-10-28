import { t } from '../i18n'
import { compact, dateLabel, fmt, monthLabel, pct } from './format'
import { isEmpty, parseDate, parseNum, type Column, type Dataset, type Row } from './parse'

export type Agg = 'sum' | 'avg' | 'count'
export interface Settings {
  title: string
  cat: string
  val: string
  agg: Agg
  date: string
  /** Segunda coluna numérica para o slide de comparação; vazio desliga. */
  val2: string
}
/** Filtros aplicados antes de qualquer cálculo. Meses no formato aaaa-mm; listas vazias não filtram. */
export interface Filters {
  from: string
  to: string
  col: string
  values: string[]
}
export const NO_FILTERS: Filters = { from: '', to: '', col: '', values: [] }

export interface Group {
  label: string
  value: number
  share: number
}
export interface Report {
  settings: Settings
  fileName: string
  rowCount: number
  /** Linhas antes dos filtros. */
  totalRows: number
  colCount: number
  /** Resumo legível dos filtros ativos, ou vazio. */
  filterLabel: string
  aggLabel: string
  groups: Group[]
  total: number
  avg: number
  min: number
  max: number
  hasValue: boolean
  series: { labels: string[]; values: number[] } | null
  compare: { labels: string[]; a: number[]; b: number[]; nameA: string; nameB: string } | null
  details: { columns: Column[]; rows: string[][] } | null
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

export const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
export const cellText = (v: Row[string]) => (isEmpty(v) ? t().empty : String(v).trim())

/** Título automático no idioma atual. */
export function autoTitle(ds: Dataset) {
  const base = ds.fileName.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ')
  return ds.sample ? t().defaultTitleSample : t().defaultTitle(base)
}

export function defaultSettings(ds: Dataset): Settings {
  const cats = ds.columns.filter((c) => c.type === 'category')
  const nums = ds.columns.filter((c) => c.type === 'number')
  const dates = ds.columns.filter((c) => c.type === 'date')
  const cat = cats.find((c) => c.distinct >= 2 && c.distinct <= 12) ?? cats[0] ?? ds.columns[0]
  const val = nums.find((n) => /receita|valor|total|venda|faturamento|amount|revenue|price|preço/i.test(n.name)) ?? nums[0]
  return {
    title: autoTitle(ds),
    cat: cat?.name ?? '',
    val: val?.name ?? '',
    agg: val ? 'sum' : 'count',
    date: dates[0]?.name ?? '',
    val2: nums.find((n) => n !== val)?.name ?? '',
  }
}

/** Meses (aaaa-mm) presentes numa coluna de data, em ordem. */
export function monthsOf(ds: Dataset, col: string) {
  if (!col) return []
  const set = new Set<string>()
  for (const r of ds.rows) {
    const d = parseDate(r[col])
    if (d) set.add(monthKey(d))
  }
  return [...set].sort()
}

/** Valores de uma coluna, do mais frequente para o menos frequente. */
export function valuesOf(ds: Dataset, col: string) {
  const m = new Map<string, number>()
  for (const r of ds.rows) {
    const k = cellText(r[col])
    m.set(k, (m.get(k) ?? 0) + 1)
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => ({ value: k, count: n }))
}

export function applyFilters(ds: Dataset, s: Settings, f: Filters): { rows: Row[]; label: string } {
  const byDate = !!s.date && (!!f.from || !!f.to)
  const byValue = !!f.col && f.values.length > 0
  if (!byDate && !byValue) return { rows: ds.rows, label: '' }
  const wanted = new Set(f.values)
  const rows = ds.rows.filter((r) => {
    if (byDate) {
      const d = parseDate(r[s.date])
      if (!d) return false
      const k = monthKey(d)
      if (f.from && k < f.from) return false
      if (f.to && k > f.to) return false
    }
    return !byValue || wanted.has(cellText(r[f.col]))
  })
  const parts: string[] = []
  if (byDate) {
    if (f.from && f.to) parts.push(f.from === f.to ? monthLabel(f.from) : t().filterRange(monthLabel(f.from), monthLabel(f.to)))
    else if (f.from) parts.push(t().filterFrom(monthLabel(f.from)))
    else parts.push(t().filterTo(monthLabel(f.to)))
  }
  if (byValue) parts.push(`${f.col}: ${f.values.length > 3 ? t().filterMore(f.values.slice(0, 3).join(', '), f.values.length - 3) : f.values.join(', ')}`)
  return { rows, label: parts.join(' · ') }
}

export function topWithOthers(groups: Group[], n: number): Group[] {
  if (groups.length <= n) return groups
  const rest = groups.slice(n - 1)
  return [
    ...groups.slice(0, n - 1),
    {
      label: t().others(rest.length),
      value: rest.reduce((s, g) => s + g.value, 0),
      share: rest.reduce((s, g) => s + g.share, 0),
    },
  ]
}

export function buildReport(ds: Dataset, s: Settings, f: Filters = NO_FILTERS): Report {
  const { rows, label: filterLabel } = applyFilters(ds, s, f)
  const agg: Agg = s.val ? s.agg : 'count'
  const groups = new Map<string, Acc>()
  let total = 0
  let cnt = 0
  let min = Infinity
  let max = -Infinity
  for (const r of rows) {
    const k = cellText(r[s.cat])
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
  const metric = (g: Acc, a: Agg = agg) => (a === 'sum' ? g.sum : a === 'avg' ? (g.nums ? g.sum / g.nums : 0) : g.count)
  const ranked: Group[] = [...groups.entries()]
    .map(([label, g]) => ({
      label,
      value: metric(g),
      share: agg === 'count' ? g.count / rows.length : total ? g.sum / total : 0,
    }))
    .sort((a, b) => b.value - a.value)

  let series: Report['series'] = null
  if (s.date) {
    const m = new Map<string, Acc>()
    for (const r of rows) {
      const d = parseDate(r[s.date])
      if (!d) continue
      const key = monthKey(d)
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

  // Comparação: a segunda coluna usa o mesmo cálculo (contagem vira soma, que é o que faz sentido para um valor).
  let compare: Report['compare'] = null
  if (s.val && s.val2 && s.val2 !== s.val && ranked.length) {
    const agg2: Agg = agg === 'avg' ? 'avg' : 'sum'
    const second = new Map<string, Acc>()
    for (const r of rows) {
      const n = parseNum(r[s.val2])
      if (n === null) continue
      const k = cellText(r[s.cat])
      const g = second.get(k) ?? { sum: 0, count: 0, nums: 0 }
      g.sum += n
      g.nums++
      g.count++
      second.set(k, g)
    }
    const top = ranked.slice(0, 8)
    compare = {
      labels: top.map((g) => g.label),
      a: top.map((g) => g.value),
      b: top.map((g) => (second.has(g.label) ? metric(second.get(g.label)!, agg2) : 0)),
      nameA: agg === 'count' ? t().rows : s.val,
      nameB: s.val2,
    }
  }

  const aggLabel = agg === 'sum' ? t().aggSum(s.val) : agg === 'avg' ? t().aggAvg(s.val) : t().aggCount
  const report: Report = {
    settings: { ...s, agg },
    fileName: ds.fileName,
    rowCount: rows.length,
    totalRows: ds.rows.length,
    colCount: ds.columns.length,
    filterLabel,
    aggLabel,
    groups: ranked,
    total,
    avg: cnt ? total / cnt : 0,
    min: cnt ? min : 0,
    max: cnt ? max : 0,
    hasValue: !!s.val && cnt > 0,
    series,
    compare,
    details: buildDetails(ds, s, rows),
    insights: [],
  }
  report.insights = buildInsights(report)
  return report
}

/** As linhas de maior valor, com as colunas que mais explicam cada uma. */
function buildDetails(ds: Dataset, s: Settings, rows: Row[]): Report['details'] {
  if (!rows.length) return null
  const pick = (name: string) => ds.columns.find((c) => c.name === name)
  const cols: Column[] = []
  const add = (c?: Column) => c && !cols.includes(c) && cols.length < 6 && cols.push(c)
  add(pick(s.date))
  add(pick(s.cat))
  ds.columns.filter((c) => c.type === 'category' || c.type === 'text').forEach((c) => cols.length < 4 && add(c))
  add(pick(s.val2))
  add(pick(s.val))
  const sorted = s.val ? [...rows].sort((a, b) => (parseNum(b[s.val]) ?? -Infinity) - (parseNum(a[s.val]) ?? -Infinity)) : rows
  const cell = (c: Column, v: Row[string]) => {
    if (isEmpty(v)) return ''
    if (c.type === 'date') return (parseDate(v) ? dateLabel(parseDate(v)!) : String(v))
    if (c.type === 'number') {
      const n = parseNum(v)
      return n === null ? String(v) : fmt(n)
    }
    return String(v)
  }
  return { columns: cols, rows: sorted.slice(0, 10).map((r) => cols.map((c) => cell(c, r[c.name]))) }
}

function buildInsights(R: Report): Insight[] {
  const out: Insight[] = []
  const T = t()
  const { cat, val, agg } = R.settings
  const top = R.groups[0]
  if (top) out.push({ strong: top.label, text: T.insLeader(top.label, cat, pct(top.share), agg === 'count' ? T.insOfRows : T.insOfValue(val)) })
  if (R.groups.length >= 3) {
    const top3 = R.groups.slice(0, 3).reduce((s, x) => s + x.share, 0)
    out.push({ text: T.insTop3(pct(top3), R.groups.length) })
  }
  if (R.groups.length >= 2) {
    const last = R.groups[R.groups.length - 1]
    out.push({ strong: last.label, text: T.insLowest(last.label, fmt(last.value)) })
  }
  if (R.series) {
    const v = R.series.values
    const a = v[v.length - 2]
    const b = v[v.length - 1]
    if (a) out.push({ text: T.insLastMonth(R.series.labels.at(-1)!, `${b >= a ? '+' : ''}${pct((b - a) / Math.abs(a))}`) })
    const iMax = v.indexOf(Math.max(...v))
    out.push({ text: T.insBestMonth(R.series.labels[iMax], compact(v[iMax])) })
  }
  if (R.hasValue) out.push({ text: T.insRange(val, fmt(R.min), fmt(R.max), fmt(R.avg)) })
  return out
}
