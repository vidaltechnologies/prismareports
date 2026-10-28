<p align="center">
  <img src="docs/icon.svg" alt="Prisma Reports" width="72" />
</p>

<h1 align="center">Prisma Reports — visual reports from spreadsheets</h1>

<p align="center">
  Upload an <strong>Excel or CSV</strong> file and instantly get a report with key figures, percentages and charts.<br />
  One click turns the report into a slide presentation in PDF.
</p>

<p align="center">
  <a href="README.md">Português</a> · <strong>English</strong> · <a href="README.es.md">Español</a>
</p>

<p align="center">
  <img alt="HTML5" src="https://img.shields.io/badge/HTML5-single_page-E34F26?logo=html5&logoColor=white" />
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-ES2020-F7DF1E?logo=javascript&logoColor=black" />
  <img alt="SheetJS" src="https://img.shields.io/badge/SheetJS-0.18-217346?logo=microsoftexcel&logoColor=white" />
  <img alt="Chart.js" src="https://img.shields.io/badge/Chart.js-4-FF6384?logo=chartdotjs&logoColor=white" />
  <img alt="jsPDF" src="https://img.shields.io/badge/jsPDF-2.5-B30B00?logo=adobeacrobatreader&logoColor=white" />
</p>

![Prisma Reports home page with key figures and percentage rings](docs/screenshots/inicio.png)

## About the project

Prisma Reports turns a spreadsheet into a visual report, with no charts to build by hand.
You upload the file, choose what to analyze and download the result ready to present, as
PDF slides.

It is inspired by [beautiful.ai](https://www.beautiful.ai/): good-looking slides whose
layouts adapt to the content, here driven by the spreadsheet's data.

Everything runs in the browser. Your data is never sent to a server.

### Goals

- Read any spreadsheet with a header row, with no setup.
- Show the most important numbers in a clear, visual way.
- Let people change the analysis (grouping, value, calculation) and see the result right away.
- Produce a PDF presentation ready to send or present.

## Features

- **Excel and CSV upload:** `.xlsx`, `.xls` and `.csv`, by dragging the file onto the page
  or with the **Abrir planilha** (open spreadsheet) button. Workbooks with several sheets
  get a sheet picker.
- **Automatic column detection:** each column is recognized as number, date, category or
  text, including Brazilian formats (`1.234,56`, `R$ 10,00`, `dd/mm/yyyy`). CSV separated by
  `;`, `,` or tab, in UTF-8 or Windows-1252.
- **Key figures:** row count, sum and average of the chosen value, number of groups and
  the largest group.
- **Percentage rings:** each group's share of the total.
- **Charts:** bars by group, a doughnut with the distribution and a monthly timeline.
- **Automatic highlights:** short sentences on the leader, how concentrated the top groups
  are, last month's change and the best month.
- **Dynamic analysis:** choose which column to group by, which value to use and whether to
  sum, average or count. Everything updates instantly.
- **PDF slides:** a 16:9 presentation with cover, key figures, shares, charts, highlights
  and ranking.
- **Light and dark theme:** the page follows the system theme.
- **Responsive:** works on desktop and mobile.

The interface is currently in Portuguese.

## Screens

### Desktop

| Charts and highlights | Data table |
| --- | --- |
| ![Charts and highlights](docs/screenshots/graficos.png) | ![Data table with each column's type](docs/screenshots/dados.png) |

| Dark theme | |
| --- | --- |
| ![Page in dark theme](docs/screenshots/tema-escuro.png) | |

### PDF slides

| Cover | Key figures |
| --- | --- |
| ![Cover slide](docs/screenshots/slide-capa.png) | ![Key figures slide](docs/screenshots/slide-indicadores.png) |

| Shares | Bar comparison |
| --- | --- |
| ![Shares slide](docs/screenshots/slide-participacao.png) | ![Bar chart slide](docs/screenshots/slide-barras.png) |

| Distribution | Monthly trend |
| --- | --- |
| ![Doughnut chart slide](docs/screenshots/slide-rosca.png) | ![Timeline slide](docs/screenshots/slide-evolucao.png) |

| Highlights | Ranking |
| --- | --- |
| ![Highlights slide](docs/screenshots/slide-destaques.png) | ![Ranking slide](docs/screenshots/slide-ranking.png) |

### Mobile

| Home | Key figures | Charts |
| --- | --- | --- |
| <img src="docs/screenshots/celular-inicio.png" alt="Home on mobile" width="260" /> | <img src="docs/screenshots/celular-indicadores.png" alt="Key figures on mobile" width="260" /> | <img src="docs/screenshots/celular-graficos.png" alt="Charts on mobile" width="260" /> |

## Technologies

| Technology | What it is for |
| --- | --- |
| HTML, CSS and JavaScript | Single page, no build step |
| [SheetJS](https://sheetjs.com/) | Reading Excel and CSV files |
| [Chart.js](https://www.chartjs.org/) | Bar, doughnut and line charts |
| [jsPDF](https://github.com/parallax/jsPDF) | Building the PDF slides |
| Canvas | Percentage rings |

Libraries load from the jsDelivr CDN. The project has no database, login or server: the
page can be hosted as a static file (for example, on GitHub Pages).

## Running it locally

Nothing to install. Download the project and open `index.html` in your browser:

```bash
git clone https://github.com/vidaltechnologies/prismareports.git
cd prismareports
```

Then double-click `index.html`. If you prefer a local server:

```bash
npx serve .
```

and open http://localhost:3000.

The page opens with sample sales data. To try another file, use
`exemplos/despesas-por-departamento.csv`.

## Code structure

```
index.html                 # Whole page: layout, styles, parsing, charts and PDF
exemplos/
└── despesas-por-departamento.csv  # Test spreadsheet (CSV with ;)
docs/
├── icon.svg               # Logo used in this README
└── screenshots/           # Images used in this README
```

## Next steps

- Move to Vite + React + TypeScript, with one component per slide type.
- Slide preview and editing on the page, beautiful.ai style: themes, reorder and hide slides.
- Filters by period and category.

---

© Vidal Technologies. All rights reserved.
