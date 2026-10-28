import { t } from '../i18n'
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
  const T = t()
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => onChange({ ...settings, [k]: v })
  const cats = ds.columns.filter((c) => c.type === 'category')
  const nums = ds.columns.filter((c) => c.type === 'number')
  const dates = ds.columns.filter((c) => c.type === 'date')
  return (
    <section className="controls" aria-label={T.settingsAria}>
      <label htmlFor="titleInput">
        {T.reportTitle}
        <input id="titleInput" type="text" value={settings.title} onChange={(e) => set('title', e.target.value)} />
      </label>
      {sheets.length > 1 && (
        <label htmlFor="sheetSel">
          {T.sheet}
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
        {T.groupBy}
        <select id="catSel" value={settings.cat} onChange={(e) => set('cat', e.target.value)}>
          {(cats.length ? cats : ds.columns).map((c) => (
            <option key={c.name}>{c.name}</option>
          ))}
        </select>
      </label>
      <label htmlFor="valSel">
        {T.value}
        <select id="valSel" value={settings.val} onChange={(e) => set('val', e.target.value)} disabled={!nums.length}>
          {nums.length ? nums.map((c) => <option key={c.name}>{c.name}</option>) : <option value="">{T.noNumeric}</option>}
        </select>
      </label>
      <label htmlFor="aggSel">
        {T.calculation}
        <select id="aggSel" value={settings.agg} onChange={(e) => set('agg', e.target.value as Agg)}>
          {nums.length > 0 && <option value="sum">{T.sum}</option>}
          {nums.length > 0 && <option value="avg">{T.avg}</option>}
          <option value="count">{T.count}</option>
        </select>
      </label>
      <label htmlFor="val2Sel">
        {T.compareWith}
        <select id="val2Sel" value={settings.val2} onChange={(e) => set('val2', e.target.value)} disabled={nums.length < 2}>
          <option value="">{T.none}</option>
          {nums
            .filter((c) => c.name !== settings.val)
            .map((c) => (
              <option key={c.name}>{c.name}</option>
            ))}
        </select>
      </label>
      <label htmlFor="dateSel">
        {T.timeline}
        <select id="dateSel" value={settings.date} onChange={(e) => set('date', e.target.value)}>
          <option value="">{T.none}</option>
          {dates.map((c) => (
            <option key={c.name}>{c.name}</option>
          ))}
        </select>
      </label>
    </section>
  )
}
