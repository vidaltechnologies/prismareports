import * as XLSX from 'xlsx'

export type Cell = string | number | boolean | Date | null
export type Row = Record<string, Cell>
export type ColumnType = 'number' | 'date' | 'category' | 'text'
export interface Column {
  name: string
  type: ColumnType
  distinct: number
  filled: number
}
export interface Dataset {
  fileName: string
  rows: Row[]
  columns: Column[]
  sample: boolean
}

export const isEmpty = (v: Cell | undefined) => v === null || v === undefined || (typeof v === 'string' && v.trim() === '')

/** Lê números em formato brasileiro ou internacional: 1.234,56 · 1,234.56 · R$ 10,00 · 45%. */
export function parseNum(v: Cell | undefined): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null
  if (typeof v !== 'string') return null
  let s = v.trim().replace(/^R\$\s?/i, '').replace(/[%\s ]/g, '')
  if (!s || !/^[-+]?[\d.,]+$/.test(s)) return null
  const lc = s.lastIndexOf(',')
  const ld = s.lastIndexOf('.')
  if (lc > -1 && ld > -1) s = lc > ld ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '')
  else if (lc > -1) s = (s.match(/,/g) ?? []).length > 1 ? s.replace(/,/g, '') : s.replace(',', '.')
  else if (ld > -1 && (s.match(/\./g) ?? []).length > 1) s = s.replace(/\./g, '')
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

/** Lê datas como Date, dd/mm/aaaa ou aaaa-mm-dd. */
export function parseDate(v: Cell | undefined): Date | null {
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v
  if (typeof v !== 'string') return null
  const s = v.trim()
  let m = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})/)
  if (m) {
    const y = +m[3] < 100 ? 2000 + +m[3] : +m[3]
    const d = new Date(y, +m[2] - 1, +m[1])
    return Number.isNaN(d.getTime()) ? null : d
  }
  m = s.match(/^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?/)
  if (m) {
    const d = new Date(+m[1], +m[2] - 1, +(m[3] || 1))
    return Number.isNaN(d.getTime()) ? null : d
  }
  return null
}

export function profile(rows: Row[], names: string[]): Column[] {
  return names.map((name) => {
    const vals = rows.map((r) => r[name]).filter((v) => !isEmpty(v))
    const n = vals.length || 1
    const nums = vals.filter((v) => parseNum(v) !== null).length
    const dates = vals.filter((v) => parseDate(v) !== null).length
    const distinct = new Set(vals.map((v) => String(v).trim())).size
    let type: ColumnType = 'text'
    if (vals.length && dates / n >= 0.8) type = 'date'
    else if (vals.length && nums / n >= 0.8) type = 'number'
    else if (distinct <= Math.max(2, Math.min(60, n * 0.6))) type = 'category'
    return { name, type, distinct, filled: vals.length }
  })
}

export async function readWorkbook(file: File): Promise<XLSX.WorkBook> {
  const buf = await file.arrayBuffer()
  if (/\.(csv|tsv|txt)$/i.test(file.name)) {
    let text: string
    try {
      text = new TextDecoder('utf-8', { fatal: true }).decode(buf)
    } catch {
      text = new TextDecoder('windows-1252').decode(buf)
    }
    text = text.replace(/^﻿/, '')
    const first = text.split(/\r?\n/)[0] ?? ''
    const FS = [';', ',', '\t'].map((d) => [d, first.split(d).length] as const).sort((a, b) => b[1] - a[1])[0][0]
    return XLSX.read(text, { type: 'string', FS, raw: true, cellDates: true })
  }
  return XLSX.read(buf, { type: 'array', cellDates: true })
}

export function sheetToDataset(wb: XLSX.WorkBook, sheetIndex: number, fileName: string): Dataset {
  const ws = wb.Sheets[wb.SheetNames[sheetIndex]]
  const raw = XLSX.utils.sheet_to_json<Row>(ws, { defval: null, raw: true })
  const names: string[] = []
  raw.forEach((r) => Object.keys(r).forEach((k) => !names.includes(k) && names.push(k)))
  const keep = names.filter((c) => !/^__EMPTY/.test(c) || raw.some((r) => !isEmpty(r[c])))
  const rows = raw.filter((r) => keep.some((c) => !isEmpty(r[c])))
  return { fileName, rows, columns: profile(rows, keep), sample: false }
}
