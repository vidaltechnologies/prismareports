import { useMemo } from 'react'
import { int, monthLabel } from '../lib/format'
import type { Dataset } from '../lib/parse'
import { monthsOf, NO_FILTERS, valuesOf, type Filters, type Settings } from '../lib/report'

interface Props {
  ds: Dataset
  settings: Settings
  filters: Filters
  shown: number
  onChange: (f: Filters) => void
}

const MAX_CHIPS = 40

export function FiltersBar({ ds, settings, filters, shown, onChange }: Props) {
  const months = useMemo(() => monthsOf(ds, settings.date), [ds, settings.date])
  const cats = ds.columns.filter((c) => c.type === 'category')
  const values = useMemo(() => (filters.col ? valuesOf(ds, filters.col) : []), [ds, filters.col])
  const active = filters.from || filters.to || filters.values.length > 0
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch })
  const toggle = (v: string) => set({ values: filters.values.includes(v) ? filters.values.filter((x) => x !== v) : [...filters.values, v] })

  return (
    <section className="filters" aria-labelledby="hFilters">
      <div className="filters-head">
        <h2 id="hFilters">Filtros</h2>
        <span className={`filters-count${shown === 0 ? ' empty' : ''}`}>
          {shown === 0 ? 'Nenhuma linha com esses filtros' : active ? `${int(shown)} de ${int(ds.rows.length)} linhas` : `Todas as ${int(ds.rows.length)} linhas`}
        </span>
        {active && (
          <button type="button" className="link" onClick={() => onChange({ ...NO_FILTERS, col: filters.col })}>
            Limpar filtros
          </button>
        )}
      </div>
      <div className="controls">
        <label htmlFor="fromSel">
          Período de
          <select id="fromSel" value={filters.from} disabled={!months.length} onChange={(e) => set({ from: e.target.value, to: filters.to && e.target.value > filters.to ? e.target.value : filters.to })}>
            <option value="">{months.length ? 'Início' : 'Sem linha do tempo'}</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {monthLabel(m)}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="toSel">
          até
          <select id="toSel" value={filters.to} disabled={!months.length} onChange={(e) => set({ to: e.target.value, from: filters.from && e.target.value && e.target.value < filters.from ? e.target.value : filters.from })}>
            <option value="">{months.length ? 'Fim' : 'Sem linha do tempo'}</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {monthLabel(m)}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="filterCol">
          Filtrar categoria
          <select id="filterCol" value={filters.col} disabled={!cats.length} onChange={(e) => set({ col: e.target.value, values: [] })}>
            <option value="">Nenhuma</option>
            {cats.map((c) => (
              <option key={c.name}>{c.name}</option>
            ))}
          </select>
        </label>
      </div>
      {filters.col && (
        <div className="chips" role="group" aria-label={`Valores de ${filters.col}`}>
          {values.slice(0, MAX_CHIPS).map(({ value, count }) => (
            <button type="button" key={value} className="chip" aria-pressed={filters.values.includes(value)} onClick={() => toggle(value)}>
              {value}
              <small>{int(count)}</small>
            </button>
          ))}
          {values.length > MAX_CHIPS && <span className="chips-more">e mais {values.length - MAX_CHIPS} valores</span>}
          <span className="chips-hint">{filters.values.length ? 'Só os valores marcados entram no relatório.' : 'Nenhum marcado: entram todos.'}</span>
        </div>
      )}
    </section>
  )
}
