import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { ChartCanvas } from '../components/ChartCanvas'
import { Ring } from '../components/Ring'
import type { ChartLook } from '../lib/charts'
import { compact, fmt, int, pct, today } from '../lib/format'
import { topWithOthers, type Report } from '../lib/report'
import { t } from '../i18n'
import type { Theme } from '../themes'

export const SLIDE_W = 1280
export const SLIDE_H = 720

export type SlideId = 'capa' | 'indicadores' | 'participacao' | 'barras' | 'distribuicao' | 'evolucao' | 'comparacao' | 'destaques' | 'ranking' | 'detalhes'

/** Textos que a pessoa reescreveu na prévia. Títulos por slide; destaques pela posição. */
export interface TextEdits {
  titles: Partial<Record<SlideId, string>>
  insights: Record<number, string>
}
export type TextEdit = { kind: 'title'; slide: SlideId; text: string } | { kind: 'insight'; index: number; text: string }

export interface SlideProps {
  report: Report
  theme: Theme
  index: number
  total: number
  slide?: SlideId
  edits?: TextEdits
  /** Só existe na prévia grande: é o que liga a edição de texto. */
  onEdit?: (e: TextEdit) => void
}

interface SlideDef {
  id: SlideId
  available: (R: Report) => boolean
  Component: (p: SlideProps) => ReactNode
}

export function slideVars(t: Theme): CSSProperties {
  const s = t.slide
  return {
    '--s-bg': s.bg,
    '--s-fg': s.fg,
    '--s-muted': s.muted,
    '--s-card': s.card,
    '--s-line': s.line,
    '--s-track': s.track,
    '--s-accent': s.accent,
    '--s-cover-bg': s.coverBg,
    '--s-cover-fg': s.coverFg,
    '--s-cover-muted': s.coverMuted,
    '--s-display': t.display,
    '--s-body': t.body,
  } as CSSProperties
}

/** Sobretítulo e título automático de cada slide; o PowerPoint usa os mesmos textos. */
export function slideHeading(id: SlideId, R: Report): { kicker: string; title: string } {
  const T = t()
  const { cat, val } = R.settings
  switch (id) {
    case 'capa':
      return { kicker: 'Prisma Reports', title: R.settings.title }
    case 'indicadores':
      return { kicker: T.kOverview, title: T.mainKpis }
    case 'participacao':
      return { kicker: T.kShare, title: T.shareBy(cat) }
    case 'barras':
      return { kicker: T.kCompare, title: T.aBy(R.aggLabel, cat) }
    case 'distribuicao':
      return { kicker: T.kCompare, title: T.distributionBy(cat) }
    case 'evolucao':
      return { kicker: T.kTrend, title: T.perMonth(R.aggLabel) }
    case 'comparacao':
      return { kicker: T.kComparison, title: R.compare ? T.compareTitle(R.compare.nameA, R.compare.nameB, cat) : '' }
    case 'destaques':
      return { kicker: T.kReading, title: T.highlights }
    case 'ranking':
      return { kicker: T.kRanking, title: T.rankingBy(cat) }
    case 'detalhes':
      return { kicker: T.kDetails, title: val ? T.topRecords(val) : T.firstRecords }
  }
}

/** Itens do slide de indicadores (o último é o maior grupo). */
export function kpiItems(R: Report) {
  const T = t()
  return [
    { l: T.rowsAnalyzed, v: int(R.rowCount), f: T.columns(R.colCount) },
    R.hasValue ? { l: T.totalOf(R.settings.val), v: compact(R.total), f: fmt(R.total) } : null,
    R.hasValue ? { l: T.avgOf(R.settings.val), v: compact(R.avg), f: T.minMax(compact(R.min), compact(R.max)) } : null,
    { l: T.groupsIn(R.settings.cat), v: int(R.groups.length), f: T.distinctValues },
    R.groups[0] ? { l: T.topGroup, v: R.groups[0].label, f: T.ofTotal(pct(R.groups[0].share)) } : null,
  ].filter((x): x is { l: string; v: string; f: string } => !!x)
}

function slideLook(t: Theme): ChartLook {
  return { palette: t.palette, fg: t.slide.fg, muted: t.slide.muted, line: t.slide.line, surface: t.slide.bg, font: t.body, fontSize: 17, animate: false }
}

/**
 * Texto que vira editável na prévia grande. Enter confirma; apagar tudo volta ao texto automático.
 * O conteúdo é escrito pelo próprio DOM durante a edição, por isso o React só o define ao montar ou quando o valor muda.
 */
function Editable({ value, onChange, multiline, className, as: Tag = 'span' }: { value: string; onChange?: (text: string) => void; multiline?: boolean; className?: string; as?: 'span' | 'h1' | 'h2' }) {
  const ref = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    if (ref.current && ref.current.textContent !== value) ref.current.textContent = value
  }, [value])
  if (!onChange) return <Tag className={className}>{value}</Tag>
  return (
    <Tag
      ref={ref as never}
      className={`${className ?? ''} editable`}
      contentEditable="plaintext-only"
      suppressContentEditableWarning
      spellCheck
      title={t().clickToEdit}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === 'Enter' && !(multiline && e.shiftKey)) {
          e.preventDefault()
          e.currentTarget.blur()
        }
        if (e.key === 'Escape') {
          e.currentTarget.textContent = value
          e.currentTarget.blur()
        }
      }}
      onBlur={(e: React.FocusEvent<HTMLElement>) => {
        const text = (e.currentTarget.textContent ?? '').replace(/\s+/g, ' ').trim()
        if (text !== value) onChange(text)
      }}
    />
  )
}

function Frame({ report, index, total, kicker, title, children, slide, edits, onEdit }: SlideProps & { kicker: string; title: string; children: ReactNode }) {
  const shown = (slide && edits?.titles[slide]) || title
  return (
    <div className="slide-inner">
      <div className="s-kicker">{kicker}</div>
      <Editable as="h2" className="s-title" value={shown} onChange={onEdit && slide ? (text) => onEdit({ kind: 'title', slide, text }) : undefined} />
      <div className="s-body">{children}</div>
      <div className="s-foot">
        <span>
          {report.settings.title} · {report.fileName}
          {report.filterLabel && ` · ${report.filterLabel}`}
        </span>
        <span>{index ? `${index} / ${total}` : t().hidden}</span>
      </div>
    </div>
  )
}

function Cover({ report, theme, onEdit }: SlideProps) {
  const s = theme.slide
  return (
    <div className="slide-inner cover">
      <svg className="cover-art" viewBox="0 0 420 420" aria-hidden="true">
        <path d="M210 30 400 400H20Z" fill={s.coverShape} />
        <path d="M210 30v370" stroke={s.coverShape2} strokeWidth="10" />
        <path d="M210 30 400 400H210Z" fill={s.coverBg} opacity="0.18" />
      </svg>
      <div className="s-kicker cover-kicker">Prisma Reports</div>
      <Editable as="h1" className="cover-title" value={report.settings.title} onChange={onEdit ? (text) => onEdit({ kind: 'title', slide: 'capa', text }) : undefined} />
      <p className="cover-meta">
        {report.fileName} · {t().rowsLabel(int(report.rowCount))} · {today()}
        {report.filterLabel && (
          <>
            <br />
            {t().filterNote(report.filterLabel)}
          </>
        )}
      </p>
    </div>
  )
}

function Kpis(p: SlideProps) {
  const R = p.report
  const items = kpiItems(R)
  return (
    <Frame {...p} {...slideHeading('indicadores', R)}>
      <div className={`s-kpis n${items.length}`}>
        {items.map((k, i) => (
          <div className="s-kpi" key={k.l}>
            <div className="s-kpi-l">{k.l}</div>
            <div className="s-kpi-v" style={{ color: i === 0 ? p.theme.slide.fg : p.theme.palette[(i - 1) % 6] }}>
              {k.v}
            </div>
            <div className="s-kpi-f">{k.f}</div>
          </div>
        ))}
      </div>
    </Frame>
  )
}

function Shares(p: SlideProps) {
  const items = topWithOthers(p.report.groups, 5).slice(0, 5)
  const size = items.length > 4 ? 170 : 200
  return (
    <Frame {...p} {...slideHeading('participacao', p.report)}>
      <div className="s-rings">
        {items.map((g, i) => (
          <div className="s-ring" key={g.label}>
            <Ring share={g.share} color={p.theme.palette[i % 6]} track={p.theme.slide.track} textColor={p.theme.slide.fg} font={p.theme.display} size={size} />
            <div className="s-ring-l">{g.label}</div>
            <div className="s-ring-f">{compact(g.value)}</div>
          </div>
        ))}
      </div>
    </Frame>
  )
}

function Bars(p: SlideProps) {
  const R = p.report
  return (
    <Frame {...p} {...slideHeading('barras', R)}>
      <ChartCanvas kind="bar" report={R} look={slideLook(p.theme)} label={t().aBy(R.aggLabel, R.settings.cat)} />
    </Frame>
  )
}

function Pie(p: SlideProps) {
  const R = p.report
  return (
    <Frame {...p} {...slideHeading('distribuicao', R)}>
      <ChartCanvas kind="pie" report={R} look={slideLook(p.theme)} label={t().distributionBy(R.settings.cat)} />
    </Frame>
  )
}

function Trend(p: SlideProps) {
  const R = p.report
  return (
    <Frame {...p} {...slideHeading('evolucao', R)}>
      <ChartCanvas kind="line" report={R} look={slideLook(p.theme)} label={t().perMonth(R.aggLabel)} />
    </Frame>
  )
}

function Highlights(p: SlideProps) {
  return (
    <Frame {...p} {...slideHeading('destaques', p.report)}>
      <ul className="s-insights">
        {p.report.insights.map((t, i) => (
          <li key={i}>
            <span className="dot" style={{ background: p.theme.palette[i % 6] }} />
            <Editable value={t.text} multiline onChange={p.onEdit ? (text) => p.onEdit!({ kind: 'insight', index: i, text }) : undefined} />
          </li>
        ))}
      </ul>
    </Frame>
  )
}

function Ranking(p: SlideProps) {
  const R = p.report
  const rows = R.groups.slice(0, 10)
  const maxShare = Math.max(...rows.map((r) => r.share), 0.0001)
  return (
    <Frame {...p} {...slideHeading('ranking', R)}>
      <table className="s-rank">
        <thead>
          <tr>
            <th>#</th>
            <th>{R.settings.cat}</th>
            <th className="r">{R.aggLabel}</th>
            <th className="r" colSpan={2}>
              {t().share}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.label}>
              <td className="muted">{i + 1}</td>
              <td>{r.label}</td>
              <td className="r">{fmt(r.value)}</td>
              <td className="bar">
                <span style={{ width: `${(r.share / maxShare) * 100}%` }} />
              </td>
              <td className="r">{pct(r.share)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {R.groups.length > 10 && <p className="s-note">{t().topNGroups(R.groups.length)}</p>}
    </Frame>
  )
}

function Compare(p: SlideProps) {
  const C = p.report.compare!
  return (
    <Frame {...p} {...slideHeading('comparacao', p.report)}>
      <ChartCanvas kind="compare" report={p.report} look={slideLook(p.theme)} label={t().compareTitle(C.nameA, C.nameB, p.report.settings.cat)} />
    </Frame>
  )
}

function Details(p: SlideProps) {
  const D = p.report.details!
  return (
    <Frame {...p} {...slideHeading('detalhes', p.report)}>
      <table className="s-rank s-details">
        <thead>
          <tr>
            {D.columns.map((c) => (
              <th key={c.name} className={c.type === 'number' ? 'r' : undefined}>
                {c.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {D.rows.map((r, i) => (
            <tr key={i}>
              {r.map((v, j) => (
                <td key={j} className={D.columns[j].type === 'number' ? 'r' : undefined}>
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {p.report.rowCount > 10 && <p className="s-note">{t().nOfRows(int(p.report.rowCount))}</p>}
    </Frame>
  )
}

export const SLIDES: SlideDef[] = [
  { id: 'capa', available: () => true, Component: Cover },
  { id: 'indicadores', available: () => true, Component: Kpis },
  { id: 'participacao', available: (R) => R.groups.length > 0, Component: Shares },
  { id: 'barras', available: (R) => R.groups.length > 0, Component: Bars },
  { id: 'distribuicao', available: (R) => R.groups.length > 0, Component: Pie },
  { id: 'evolucao', available: (R) => !!R.series, Component: Trend },
  { id: 'comparacao', available: (R) => !!R.compare, Component: Compare },
  { id: 'destaques', available: (R) => R.insights.length > 0, Component: Highlights },
  { id: 'ranking', available: (R) => R.groups.length > 0, Component: Ranking },
  { id: 'detalhes', available: (R) => !!R.details, Component: Details },
]

export const slideName = (id: SlideId) => t().slideNames[id]

export const slideDef = (id: SlideId) => SLIDES.find((s) => s.id === id)!

/** Um slide em tamanho real (1280×720). O tamanho na tela é ajustado por quem o envolve. */
export function Slide({ id, ...p }: SlideProps & { id: SlideId }) {
  const { Component } = slideDef(id)
  return (
    <div className="slide" style={slideVars(p.theme)} data-slide={id}>
      <Component {...p} slide={id} />
    </div>
  )
}
