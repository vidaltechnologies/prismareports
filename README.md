# Prisma Reports

Envie uma planilha Excel (`.xlsx`, `.xls`) ou CSV e gere na hora um relatório visual: indicadores, anéis de percentual, gráficos de barras, rosca e linha do tempo, destaques automáticos e uma prévia da tabela. Um clique em **Baixar slides (PDF)** gera uma apresentação 16:9 em PDF com capa, indicadores, participação, gráficos, destaques e ranking.

Tudo roda no navegador: os dados não são enviados a nenhum servidor.

## Como usar

Abra `index.html` no navegador (duplo clique já funciona) ou publique a pasta no GitHub Pages. A página abre com dados de exemplo; arraste sua planilha para substituir.

- A primeira linha da planilha deve ter os nomes das colunas.
- O tipo de cada coluna (número, data, categoria, texto) é detectado automaticamente, inclusive números no formato brasileiro (`1.234,56`, `R$ 10,00`) e datas `dd/mm/aaaa`.
- CSV separado por `;`, `,` ou tabulação, em UTF-8 ou Windows-1252.
- Em **Agrupar por**, **Valor**, **Cálculo** e **Linha do tempo** você escolhe o que o relatório mostra.

Há um arquivo de teste em `exemplos/`.

## Stack do protótipo

- [SheetJS](https://sheetjs.com) para ler Excel/CSV
- [Chart.js](https://www.chartjs.org) para os gráficos
- [jsPDF](https://github.com/parallax/jsPDF) para montar os slides em PDF

Bibliotecas carregadas via CDN (jsDelivr), sem etapa de build.

## Próximos passos sugeridos

- Migrar para Vite + React + TypeScript, com componentes por tipo de slide.
- Editor de slides no estilo beautiful.ai: prévia dos slides na página, temas, reordenar e ocultar slides, layouts que se ajustam ao conteúdo.
- Filtros (por período, por categoria) e mais tipos de gráfico.
