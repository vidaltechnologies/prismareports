import type { DeckItem } from '../components/SlideEditor'
import { SLIDES, type SlideId, type TextEdits } from '../slides/slides'
import { themeById, type ThemeId } from '../themes'
import type { Dataset } from './parse'
import { defaultSettings, valuesOf, type Agg, type Filters, type Settings } from './report'

/**
 * Template: as escolhas de um relatório, sem os dados, num arquivo .prisma.json.
 * Abrir o template sobre outra planilha refaz o mesmo relatório com os números novos.
 * O período e os destaques reescritos ficam de fora: dependem dos dados de cada mês.
 */
export interface Template {
  app: 'prisma-reports'
  version: 1
  savedAt: string
  settings: Settings
  theme: ThemeId
  filter: { col: string; values: string[] }
  deck: DeckItem[]
  titles: TextEdits['titles']
}

export const TEMPLATE_EXT = '.prisma.json'

export function makeTemplate(settings: Settings, theme: ThemeId, filters: Filters, deck: DeckItem[], edits: TextEdits): Template {
  return {
    app: 'prisma-reports',
    version: 1,
    savedAt: new Date().toISOString(),
    settings,
    theme,
    filter: { col: filters.col, values: filters.values },
    deck,
    titles: edits.titles,
  }
}

export class TemplateError extends Error {}

const SLIDE_IDS = new Set<string>(SLIDES.map((s) => s.id))
const str = (v: unknown) => (typeof v === 'string' ? v : '')

/** Lê e valida o arquivo; qualquer coisa que não seja um template do Prisma Reports é recusada. */
export function parseTemplate(text: string): Template {
  let raw: Partial<Template>
  try {
    raw = JSON.parse(text)
  } catch {
    throw new TemplateError('json')
  }
  if (!raw || raw.app !== 'prisma-reports' || raw.version !== 1 || typeof raw.settings !== 'object') throw new TemplateError('format')
  const s = raw.settings as Partial<Settings>
  const agg: Agg = s.agg === 'avg' || s.agg === 'count' ? s.agg : 'sum'
  const deck = (Array.isArray(raw.deck) ? raw.deck : []).filter((d): d is DeckItem => !!d && SLIDE_IDS.has(d.id)).map((d) => ({ id: d.id, hidden: !!d.hidden }))
  // Slides que surgiram depois do template entram no fim, visíveis.
  for (const s of SLIDES) if (!deck.some((d) => d.id === s.id)) deck.push({ id: s.id, hidden: false })
  const titles: TextEdits['titles'] = {}
  for (const [k, v] of Object.entries(raw.titles ?? {})) if (SLIDE_IDS.has(k) && typeof v === 'string' && v) titles[k as SlideId] = v
  return {
    app: 'prisma-reports',
    version: 1,
    savedAt: str(raw.savedAt),
    settings: { title: str(s.title), cat: str(s.cat), val: str(s.val), agg, date: str(s.date), val2: str(s.val2) },
    theme: themeById(str(raw.theme)).id,
    filter: { col: str(raw.filter?.col), values: Array.isArray(raw.filter?.values) ? raw.filter.values.filter((v): v is string => typeof v === 'string') : [] },
    deck,
    titles,
  }
}

export interface Applied {
  settings: Settings
  filters: Filters
  /** Colunas citadas no template que não existem nesta planilha. */
  missing: string[]
}

/**
 * Encaixa o template na planilha aberta. Uma coluna que não existe cai na escolha automática,
 * e os valores do filtro que não aparecem nos dados novos são descartados.
 */
export function applyTemplate(tpl: Template, ds: Dataset): Applied {
  const auto = defaultSettings(ds)
  const has = (name: string, types: string[]) => ds.columns.some((c) => c.name === name && types.includes(c.type))
  const missing = new Set<string>()
  const pick = (name: string, types: string[], fallback: string) => {
    if (!name) return ''
    if (has(name, types)) return name
    missing.add(name)
    return fallback
  }
  const s = tpl.settings
  const val = pick(s.val, ['number'], auto.val)
  const val2 = pick(s.val2, ['number'], '')
  const settings: Settings = {
    title: s.title || auto.title,
    cat: pick(s.cat, ['category', 'text', 'number', 'date'], auto.cat) || auto.cat,
    val,
    agg: val ? s.agg : 'count',
    date: pick(s.date, ['date'], auto.date),
    val2: val2 === val ? '' : val2,
  }
  let filters: Filters = { from: '', to: '', col: '', values: [] }
  if (tpl.filter.col) {
    if (has(tpl.filter.col, ['category'])) {
      const present = new Set(valuesOf(ds, tpl.filter.col).map((v) => v.value))
      filters = { ...filters, col: tpl.filter.col, values: tpl.filter.values.filter((v) => present.has(v)) }
    } else missing.add(tpl.filter.col)
  }
  return { settings, filters, missing: [...missing] }
}
