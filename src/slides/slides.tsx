import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { ChartCanvas } from '../components/ChartCanvas'
import { Ring } from '../components/Ring'
import type { ChartLook } from '../lib/charts'
import { compact, fmt, int, pct, today } from '../lib/format'
import { topWithOthers, type Report } from '../lib/report'
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
  name: string
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
      title="Clique para editar"
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
        <span>{index ? `${index} / ${total}` : 'oculto'}</span>
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
        {report.fileName} · {int(report.rowCount)} linhas · {today()}
        {report.filterLabel && (
          <>
            <br />
            Filtro: {report.filterLabel}
          </>
        )}
      </p>
    </div>
  )
}

function Kpis(p: SlideProps) {
  const R = p.report
  const items = [
    { l: 'Linhas analisadas', v: int(R.rowCount), f: `${R.colCount} colunas` },
    R.hasValue ? { l: `Total de ${R.settings.val}`, v: compact(R.total), f: fmt(R.total) } : null,
    R.hasValue ? { l: `Média de ${R.settings.val}`, v: compact(R.avg), f: `mín ${compact(R.min)} · máx ${compact(R.max)}` } : null,
    { l: `Grupos em ${R.settings.cat}`, v: int(R.groups.length), f: 'valores distintos' },
    R.groups[0] ? { l: 'Maior grupo', v: R.groups[0].label, f: `${pct(R.groups[0].share)} do total` } : null,
  ].filter((x): x is { l: string; v: string; f: string } => !!x)
  return (
    <Frame {...p} kicker="Visão geral" title="Indicadores principais">
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
    <Frame {...p} kicker="Participação" title={`Participação por ${p.report.settings.cat}`}>
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
    <Frame {...p} kicker="Comparativo" title={`${R.aggLabel} por ${R.settings.cat}`}>
      <ChartCanvas kind="bar" report={R} look={slideLook(p.theme)} label={`${R.aggLabel} por ${R.settings.cat}`} />
    </Frame>
  )
}

function Pie(p: SlideProps) {
  const R = p.report
  return (
    <Frame {...p} kicker="Comparativo" title={`Distribuição por ${R.settings.cat}`}>
      <ChartCanvas kind="pie" report={R} look={slideLook(p.theme)} label={`Distribuição por ${R.settings.cat}`} />
    </Frame>
  )
}

function Trend(p: SlideProps) {
  const R = p.report
  return (
    <Frame {...p} kicker="Evolução" title={`${R.aggLabel} por mês`}>
      <ChartCanvas kind="line" report={R} look={slideLook(p.theme)} label={`${R.aggLabel} por mês`} />
    </Frame>
  )
}

function Highlights(p: SlideProps) {
  return (
    <Frame {...p} kicker="Leitura" title="Destaques">
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
    <Frame {...p} kicker="Ranking" title={`Ranking por ${R.settings.cat}`}>
      <table className="s-rank">
        <thead>
          <tr>
            <th>#</th>
            <th>{R.settings.cat}</th>
            <th className="r">{R.aggLabel}</th>
            <th className="r" colSpan={2}>
              Participação
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
      {R.groups.length > 10 && <p className="s-note">10 maiores de {R.groups.length} grupos</p>}
    </Frame>
  )
}

function Compare(p: SlideProps) {
  const C = p.report.compare!
  return (
    <Frame {...p} kicker="Comparação" title={`${C.nameA} e ${C.nameB} por ${p.report.settings.cat}`}>
      <ChartCanvas kind="compare" report={p.report} look={slideLook(p.theme)} label={`${C.nameA} e ${C.nameB} por ${p.report.settings.cat}`} />
    </Frame>
  )
}

function Details(p: SlideProps) {
  const D = p.report.details!
  return (
    <Frame {...p} kicker="Detalhes" title={p.report.settings.val ? `Maiores registros por ${p.report.settings.val}` : 'Primeiros registros'}>
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
      {p.report.rowCount > 10 && <p className="s-note">10 de {int(p.report.rowCount)} linhas</p>}
    </Frame>
  )
}

export const SLIDES: SlideDef[] = [
  { id: 'capa', name: 'Capa', available: () => true, Component: Cover },
  { id: 'indicadores', name: 'Indicadores', available: () => true, Component: Kpis },
  { id: 'participacao', name: 'Participação', available: (R) => R.groups.length > 0, Component: Shares },
  { id: 'barras', name: 'Barras', available: (R) => R.groups.length > 0, Component: Bars },
  { id: 'distribuicao', name: 'Distribuição', available: (R) => R.groups.length > 0, Component: Pie },
  { id: 'evolucao', name: 'Evolução', available: (R) => !!R.series, Component: Trend },
  { id: 'comparacao', name: 'Comparação', available: (R) => !!R.compare, Component: Compare },
  { id: 'destaques', name: 'Destaques', available: (R) => R.insights.length > 0, Component: Highlights },
  { id: 'ranking', name: 'Ranking', available: (R) => R.groups.length > 0, Component: Ranking },
  { id: 'detalhes', name: 'Detalhes', available: (R) => !!R.details, Component: Details },
]

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
