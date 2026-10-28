import { useMemo } from 'react'
import type { ChartLook } from '../lib/charts'
import { compact, fmt, int, pct } from '../lib/format'
import { isEmpty, parseDate, parseNum, type Column, type Dataset } from '../lib/parse'
import { topWithOthers, type Report } from '../lib/report'
import type { Theme } from '../themes'
import { ChartCanvas } from './ChartCanvas'
import { Ring } from './Ring'

interface Props {
  ds: Dataset
  report: Report
  theme: Theme
  dark: boolean
}

/** Clareia uma cor #rrggbb misturando com branco; usado no modo escuro. */
export function lighten(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16)
  const mix = (c: number) => Math.round(c + (255 - c) * amount)
  return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => mix(c).toString(16).padStart(2, '0')).join('')
}

export function uiPalette(theme: Theme, dark: boolean) {
  if (!dark) return theme.palette
  // Cores escuras (como o azul-marinho do tema Executivo) somem no fundo escuro; clareamos só essas.
  return theme.palette.map((c) => {
    const n = parseInt(c.slice(1), 16)
    const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255
    return lum < 0.55 ? lighten(c, 0.45) : c
  })
}

const TYPE_NAME: Record<Column['type'], string> = { number: 'número', date: 'data', category: 'categoria', text: 'texto' }

export function Dashboard({ ds, report: R, theme, dark }: Props) {
  const palette = uiPalette(theme, dark)
  const css = getComputedStyle(document.documentElement)
  const look: ChartLook = useMemo(
    () => ({
      palette,
      fg: css.getPropertyValue('--fg').trim(),
      muted: css.getPropertyValue('--muted').trim(),
      line: css.getPropertyValue('--line').trim(),
      surface: css.getPropertyValue('--surface').trim(),
      font: theme.body,
      fontSize: 12,
      animate: true,
      legendBottom: window.innerWidth < 640,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme, dark],
  )
  const kpis = [
    { l: 'Linhas analisadas', v: int(R.rowCount), f: `${R.colCount} colunas` },
    R.hasValue ? { l: `Total de ${R.settings.val}`, v: compact(R.total), f: fmt(R.total) } : null,
    R.hasValue ? { l: `Média de ${R.settings.val}`, v: compact(R.avg), f: `mín ${compact(R.min)} · máx ${compact(R.max)}` } : null,
    { l: `Grupos em ${R.settings.cat}`, v: int(R.groups.length), f: 'valores distintos' },
    R.groups[0] ? { l: 'Maior grupo', v: R.groups[0].label, f: `${compact(R.groups[0].value)} · ${pct(R.groups[0].share)}` } : null,
  ].filter((x): x is { l: string; v: string; f: string } => !!x)
  const rings = topWithOthers(R.groups, 5).slice(0, 5)
  const preview = ds.rows.slice(0, 50)

  return (
    <>
      <section aria-labelledby="hKpi">
        <h2 id="hKpi">Indicadores</h2>
        <div className="kpis">
          {kpis.map((k) => (
            <div className="kpi" key={k.l}>
              <div className="k-label">{k.l}</div>
              <div className="k-value">{k.v}</div>
              <div className="k-foot">{k.f}</div>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="hRings">
        <h2 id="hRings">Participação por {R.settings.cat}</h2>
        <div className="rings">
          {rings.map((g, i) => (
            <div className="ring" key={g.label}>
              <Ring share={g.share} color={palette[i % 6]} track="var(--track)" textColor="var(--fg)" font={theme.display} size={120} />
              <div className="r-label">{g.label}</div>
              <div className="r-foot">{compact(g.value)}</div>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="hCharts">
        <h2 id="hCharts">Gráficos</h2>
        <div className="charts">
          <div className="card">
            <h3>
              {R.aggLabel} por {R.settings.cat}
            </h3>
            <p className="c-sub">{R.groups.length > 12 ? `12 maiores de ${R.groups.length} grupos` : `${R.groups.length} grupos`}</p>
            <ChartCanvas kind="bar" report={R} look={look} label={`${R.aggLabel} por ${R.settings.cat}`} />
          </div>
          <div className="card">
            <h3>Distribuição por {R.settings.cat}</h3>
            <p className="c-sub">{R.settings.agg === 'count' ? 'Percentual de linhas' : `Percentual do total de ${R.settings.val}`}</p>
            <ChartCanvas kind="pie" report={R} look={look} label={`Distribuição por ${R.settings.cat}`} />
          </div>
          {R.series && (
            <div className="card">
              <h3>{R.aggLabel} por mês</h3>
              <p className="c-sub">Com base em {R.settings.date}</p>
              <ChartCanvas kind="line" report={R} look={look} label={`${R.aggLabel} por mês`} />
            </div>
          )}
          {R.compare && (
            <div className="card">
              <h3>
                {R.compare.nameA} e {R.compare.nameB} por {R.settings.cat}
              </h3>
              <p className="c-sub">Cada coluna no seu próprio eixo · {R.compare.labels.length} maiores grupos</p>
              <ChartCanvas kind="compare" report={R} look={look} label={`${R.compare.nameA} e ${R.compare.nameB} por ${R.settings.cat}`} />
            </div>
          )}
          <div className="card">
            <h3>Destaques</h3>
            <p className="c-sub">Gerados automaticamente a partir dos dados</p>
            <ul className="insights">
              {R.insights.map((t, i) => (
                <li key={i}>
                  {t.strong ? (
                    <>
                      {t.text.split(t.strong)[0]}
                      <b>{t.strong}</b>
                      {t.text.split(t.strong).slice(1).join(t.strong)}
                    </>
                  ) : (
                    t.text
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="hTable">
        <h2 id="hTable">Dados</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {ds.columns.map((c) => (
                  <th key={c.name}>
                    {c.name}
                    <span className={`badge ${c.type}`}>{TYPE_NAME[c.type]}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((r, i) => (
                <tr key={i}>
                  {ds.columns.map((c) => {
                    const v = r[c.name]
                    if (isEmpty(v)) return <td key={c.name} />
                    if (c.type === 'date') {
                      const d = parseDate(v)
                      return <td key={c.name}>{d ? d.toLocaleDateString('pt-BR') : String(v)}</td>
                    }
                    if (c.type === 'number') {
                      const n = parseNum(v)
                      return (
                        <td key={c.name} className="num">
                          {n === null ? String(v) : fmt(n)}
                        </td>
                      )
                    }
                    return <td key={c.name}>{String(v)}</td>
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="table-foot">{ds.rows.length > 50 ? `Mostrando 50 de ${ds.rows.length} linhas.` : `${ds.rows.length} linhas.`}</p>
      </section>
    </>
  )
}
