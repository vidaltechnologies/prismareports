import type { Dataset } from '../lib/parse'
import type { Agg, Settings } from '../lib/report'

interface Props {
  ds: Dataset
  settings: Settings
  sheets: string[]
  sheet: number
  onSheet: (i: number) => void
  onChange: (s: Settings) => void
}

export function Controls({ ds, settings, sheets, sheet, onSheet, onChange }: Props) {
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => onChange({ ...settings, [k]: v })
  const cats = ds.columns.filter((c) => c.type === 'category')
  const nums = ds.columns.filter((c) => c.type === 'number')
  const dates = ds.columns.filter((c) => c.type === 'date')
  return (
    <section className="controls" aria-label="Configuração do relatório">
      <label htmlFor="titleInput">
        Título do relatório
        <input id="titleInput" type="text" value={settings.title} onChange={(e) => set('title', e.target.value)} />
      </label>
      {sheets.length > 1 && (
        <label htmlFor="sheetSel">
          Aba
          <select id="sheetSel" value={sheet} onChange={(e) => onSheet(+e.target.value)}>
            {sheets.map((n, i) => (
              <option key={n} value={i}>
                {n}
              </option>
            ))}
          </select>
        </label>
      )}
      <label htmlFor="catSel">
        Agrupar por
        <select id="catSel" value={settings.cat} onChange={(e) => set('cat', e.target.value)}>
          {(cats.length ? cats : ds.columns).map((c) => (
            <option key={c.name}>{c.name}</option>
          ))}
        </select>
      </label>
      <label htmlFor="valSel">
        Valor
        <select id="valSel" value={settings.val} onChange={(e) => set('val', e.target.value)} disabled={!nums.length}>
          {nums.length ? nums.map((c) => <option key={c.name}>{c.name}</option>) : <option value="">(sem colunas numéricas)</option>}
        </select>
      </label>
      <label htmlFor="aggSel">
        Cálculo
        <select id="aggSel" value={settings.agg} onChange={(e) => set('agg', e.target.value as Agg)}>
          {nums.length > 0 && <option value="sum">Soma</option>}
          {nums.length > 0 && <option value="avg">Média</option>}
          <option value="count">Contagem de linhas</option>
        </select>
      </label>
      <label htmlFor="dateSel">
        Linha do tempo
        <select id="dateSel" value={settings.date} onChange={(e) => set('date', e.target.value)}>
          <option value="">Nenhuma</option>
          {dates.map((c) => (
            <option key={c.name}>{c.name}</option>
          ))}
        </select>
      </label>
    </section>
  )
}
