import { getLocale, t } from '../i18n'

// Os formatadores dependem do idioma; ficam em cache por idioma.
const cache = new Map<string, Intl.NumberFormat>()
const nfOf = (digits: number) => {
  const key = `${getLocale()}:${digits}`
  let f = cache.get(key)
  if (!f) cache.set(key, (f = new Intl.NumberFormat(t().numberLocale, { maximumFractionDigits: digits })))
  return f
}

/** Número completo no idioma atual; sem casas decimais a partir de mil. */
export const fmt = (v: number) => (Math.abs(v) >= 1000 ? nfOf(0).format(v) : nfOf(2).format(v))

export const int = (v: number) => nfOf(0).format(v)

const UNITS = {
  pt: ['mil', 'mi', 'bi'],
  en: ['K', 'M', 'B'],
  es: ['mil', 'M', 'mil M'],
}

/** Número curto para eixos e destaques: 12,5 mil · 3,2 mi · 1,1 bi. */
export function compact(v: number) {
  const a = Math.abs(v)
  const [k, m, b] = UNITS[getLocale()]
  const sep = getLocale() === 'en' ? '' : ' '
  if (a >= 1e9) return nfOf(2).format(v / 1e9) + sep + b
  if (a >= 1e6) return nfOf(2).format(v / 1e6) + sep + m
  if (a >= 1e4) return nfOf(2).format(v / 1e3) + sep + k
  return fmt(v)
}

export const pct = (share: number) => nfOf(1).format(share * 100) + '%'

export function monthLabel(key: string) {
  const [y, m] = key.split('-')
  return new Date(+y, +m - 1, 1).toLocaleDateString(t().numberLocale, { month: 'short', year: '2-digit' }).replace('.', '')
}

export const dateLabel = (d: Date) => d.toLocaleDateString(t().numberLocale)

export const today = () => new Date().toLocaleDateString(t().numberLocale, { day: '2-digit', month: 'long', year: 'numeric' })

export function slug(s: string) {
  return (
    s
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^\w\- ]+/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .toLowerCase() || 'report'
  )
}
