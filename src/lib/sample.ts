import { getLocale, type Locale } from '../i18n'
import { profile, type Dataset, type Row } from './parse'

/** Nomes das colunas e dos valores dos dados de exemplo em cada idioma, na mesma ordem. */
const NAMES: Record<Locale, { file: string; cols: string[]; regions: string[]; products: string[] }> = {
  pt: {
    file: 'exemplo-vendas.xlsx',
    cols: ['Data', 'Região', 'Produto', 'Vendedor', 'Quantidade', 'Receita (R$)'],
    regions: ['Sudeste', 'Sul', 'Nordeste', 'Centro-Oeste', 'Norte'],
    products: ['Plano Básico', 'Plano Pro', 'Plano Empresa', 'Consultoria'],
  },
  en: {
    file: 'sample-sales.xlsx',
    cols: ['Date', 'Region', 'Product', 'Salesperson', 'Quantity', 'Revenue (R$)'],
    regions: ['Southeast', 'South', 'Northeast', 'Midwest', 'North'],
    products: ['Basic Plan', 'Pro Plan', 'Business Plan', 'Consulting'],
  },
  es: {
    file: 'ventas-ejemplo.xlsx',
    cols: ['Fecha', 'Región', 'Producto', 'Vendedor', 'Cantidad', 'Ingresos (R$)'],
    regions: ['Sudeste', 'Sur', 'Noreste', 'Centro-Oeste', 'Norte'],
    products: ['Plan Básico', 'Plan Pro', 'Plan Empresa', 'Consultoría'],
  },
}

const WEIGHTS = [1.6, 1.1, 0.9, 0.6, 0.4]
const PRICES = [89, 249, 690, 1800]

/** Vendas fictícias de 2025, sempre iguais (gerador com semente fixa), com nomes no idioma atual. */
export function sampleDataset(lang: Locale = getLocale()): Dataset {
  const N = NAMES[lang]
  const [cData, cRegiao, cProduto, cVendedor, cQtd, cReceita] = N.cols
  let seed = 7
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  const vendedores = ['Ana Ribeiro', 'Bruno Costa', 'Carla Mendes', 'Diego Alves', 'Elisa Nunes', 'Felipe Rocha']
  const rows: Row[] = []
  for (let m = 0; m < 12; m++) {
    const n = 14 + Math.floor(rnd() * 8) + m
    for (let i = 0; i < n; i++) {
      const r = Math.floor(Math.pow(rnd(), 1.4) * WEIGHTS.length)
      const p = Math.floor(Math.pow(rnd(), 1.3) * PRICES.length)
      const qtd = 1 + Math.floor(rnd() * 6 * WEIGHTS[r])
      rows.push({
        [cData]: new Date(2025, m, 1 + Math.floor(rnd() * 27)),
        [cRegiao]: N.regions[r],
        [cProduto]: N.products[p],
        [cVendedor]: vendedores[Math.floor(rnd() * vendedores.length)],
        [cQtd]: qtd,
        [cReceita]: Math.round(qtd * PRICES[p] * (0.85 + rnd() * 0.3) * 100) / 100,
      })
    }
  }
  return { fileName: N.file, rows, columns: profile(rows, N.cols), sample: true }
}

/** Traduz um nome de coluna ou um valor dos dados de exemplo de um idioma para outro; o resto passa igual. */
export function translateSample(text: string, from: Locale, to: Locale) {
  for (const key of ['cols', 'regions', 'products'] as const) {
    const i = NAMES[from][key].indexOf(text)
    if (i >= 0) return NAMES[to][key][i]
  }
  return text
}
