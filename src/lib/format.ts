const nf = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 })
const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const nfPct = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 })

/** Número completo em pt-BR; sem casas decimais a partir de mil. */
export const fmt = (v: number) => (Math.abs(v) >= 1000 ? nf0.format(v) : nf.format(v))

export const int = (v: number) => nf0.format(v)

/** Número curto para eixos e destaques: 12,5 mil · 3,2 mi · 1,1 bi. */
export function compact(v: number) {
  const a = Math.abs(v)
  if (a >= 1e9) return nf.format(v / 1e9) + ' bi'
  if (a >= 1e6) return nf.format(v / 1e6) + ' mi'
  if (a >= 1e4) return nf.format(v / 1e3) + ' mil'
  return fmt(v)
}

export const pct = (share: number) => nfPct.format(share * 100) + '%'

export function monthLabel(key: string) {
  const [y, m] = key.split('-')
  return new Date(+y, +m - 1, 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '')
}

export const today = () => new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

export function slug(s: string) {
  return (
    s
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^\w\- ]+/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .toLowerCase() || 'relatorio'
  )
}
