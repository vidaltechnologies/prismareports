import type { CSSProperties, ReactNode } from 'react'
import { ChartCanvas } from '../components/ChartCanvas'
import { Ring } from '../components/Ring'
import type { ChartLook } from '../lib/charts'
import { compact, fmt, int, pct, today } from '../lib/format'
import { topWithOthers, type Report } from '../lib/report'
import type { Theme } from '../themes'

export const SLIDE_W = 1280
export const SLIDE_H = 720

export type SlideId = 'capa' | 'indicadores' | 'participacao' | 'barras' | 'distribuicao' | 'evolucao' | 'destaques' | 'ranking'

export interface SlideProps {
  report: Report
  theme: Theme
  index: number
  total: number
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

function Frame({ report, index, total, kicker, title, children }: SlideProps & { kicker: string; title: string; children: ReactNode }) {
  return (
    <div className="slide-inner">
      <div className="s-kicker">{kicker}</div>
      <h2 className="s-title">{title}</h2>
      <div className="s-body">{children}</div>
      <div className="s-foot">
        <span>
          {report.settings.title} · {report.fileName}
        </span>
        <span>{index ? `${index} / ${total}` : 'oculto'}</span>
      </div>
    </div>
  )
}

function Cover({ report, theme }: SlideProps) {
  const s = theme.slide
  return (
    <div className="slide-inner cover">
      <svg className="cover-art" viewBox="0 0 420 420" aria-hidden="true">
        <path d="M210 30 400 400H20Z" fill={s.coverShape} />
        <path d="M210 30v370" stroke={s.coverShape2} strokeWidth="10" />
        <path d="M210 30 400 400H210Z" fill={s.coverBg} opacity="0.18" />
      </svg>
      <div className="s-kicker cover-kicker">Prisma Reports</div>
      <h1 className="cover-title">{report.settings.title}</h1>
      <p className="cover-meta">
        {report.fileName} · {int(report.rowCount)} linhas · {today()}
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
            <span>{t.text}</span>
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

export const SLIDES: SlideDef[] = [
  { id: 'capa', name: 'Capa', available: () => true, Component: Cover },
  { id: 'indicadores', name: 'Indicadores', available: () => true, Component: Kpis },
  { id: 'participacao', name: 'Participação', available: (R) => R.groups.length > 0, Component: Shares },
  { id: 'barras', name: 'Barras', available: (R) => R.groups.length > 0, Component: Bars },
  { id: 'distribuicao', name: 'Distribuição', available: (R) => R.groups.length > 0, Component: Pie },
  { id: 'evolucao', name: 'Evolução', available: (R) => !!R.series, Component: Trend },
  { id: 'destaques', name: 'Destaques', available: (R) => R.insights.length > 0, Component: Highlights },
  { id: 'ranking', name: 'Ranking', available: (R) => R.groups.length > 0, Component: Ranking },
]

export const slideDef = (id: SlideId) => SLIDES.find((s) => s.id === id)!

/** Um slide em tamanho real (1280×720). O tamanho na tela é ajustado por quem o envolve. */
export function Slide({ id, ...p }: SlideProps & { id: SlideId }) {
  const { Component } = slideDef(id)
  return (
    <div className="slide" style={slideVars(p.theme)} data-slide={id}>
      <Component {...p} />
    </div>
  )
}
