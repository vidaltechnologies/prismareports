import { profile, type Dataset, type Row } from './parse'

/** Vendas fictícias de 2025, sempre iguais (gerador com semente fixa). */
export function sampleDataset(): Dataset {
  let seed = 7
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  const regioes: [string, number][] = [['Sudeste', 1.6], ['Sul', 1.1], ['Nordeste', 0.9], ['Centro-Oeste', 0.6], ['Norte', 0.4]]
  const produtos: [string, number][] = [['Plano Básico', 89], ['Plano Pro', 249], ['Plano Empresa', 690], ['Consultoria', 1800]]
  const vendedores = ['Ana Ribeiro', 'Bruno Costa', 'Carla Mendes', 'Diego Alves', 'Elisa Nunes', 'Felipe Rocha']
  const rows: Row[] = []
  for (let m = 0; m < 12; m++) {
    const n = 14 + Math.floor(rnd() * 8) + m
    for (let i = 0; i < n; i++) {
      const [reg, w] = regioes[Math.floor(Math.pow(rnd(), 1.4) * regioes.length)]
      const [prod, preco] = produtos[Math.floor(Math.pow(rnd(), 1.3) * produtos.length)]
      const qtd = 1 + Math.floor(rnd() * 6 * w)
      rows.push({
        Data: new Date(2025, m, 1 + Math.floor(rnd() * 27)),
        Região: reg,
        Produto: prod,
        Vendedor: vendedores[Math.floor(rnd() * vendedores.length)],
        Quantidade: qtd,
        'Receita (R$)': Math.round(qtd * preco * (0.85 + rnd() * 0.3) * 100) / 100,
      })
    }
  }
  return { fileName: 'exemplo-vendas.xlsx', rows, columns: profile(rows, Object.keys(rows[0])), sample: true }
}
