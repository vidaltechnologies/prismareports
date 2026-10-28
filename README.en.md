<p align="center">
  <img src="docs/icon.svg" alt="Prisma Reports" width="72" />
</p>

<h1 align="center">Prisma Reports — visual reports from spreadsheets</h1>

<p align="center">
  Upload an <strong>Excel or CSV</strong> file and instantly get a report with key figures, percentages and charts.<br />
  Arrange the presentation right on the page and download the slides as PDF or PowerPoint.
</p>

<p align="center">
  <a href="README.md">Português</a> · <strong>English</strong> · <a href="README.es.md">Español</a>
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19-20232A?logo=react&logoColor=61DAFB" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white" />
  <img alt="Chart.js" src="https://img.shields.io/badge/Chart.js-4-FF6384?logo=chartdotjs&logoColor=white" />
  <img alt="GitHub Pages" src="https://img.shields.io/badge/Hosting-GitHub_Pages-222222?logo=github&logoColor=white" />
</p>

![Prisma Reports home page with key figures and percentage rings](docs/screenshots/inicio.png)

## About the project

Prisma Reports turns a spreadsheet into a visual report, with no charts to build by hand.
You upload the file, choose what to analyze, adjust the slides and download the finished
presentation as PDF or PowerPoint.

It is inspired by [beautiful.ai](https://www.beautiful.ai/): good-looking slides with
layouts that adapt to the content and ready-made themes, here driven by the spreadsheet's
data.

Everything runs in the browser. Your data is never sent to a server.

### Goals

- Read any spreadsheet with a header row, with no setup.
- Show the most important numbers in a clear, visual way.
- Let people change the analysis (grouping, value, calculation) and see the result right away.
- Produce a PDF or PowerPoint file that matches the preview, ready to send or present.

## Features

- **Excel and CSV upload:** `.xlsx`, `.xls` and `.csv`, by dragging the file onto the page
  or with the **Abrir planilha** (open spreadsheet) button. Workbooks with several sheets
  get a sheet picker.
- **Automatic column detection:** each column is recognized as number, date, category or
  text, including Brazilian formats (`1.234,56`, `R$ 10,00`, `dd/mm/yyyy`). CSV separated by
  `;`, `,` or tab, in UTF-8 or Windows-1252.
- **Dashboard:** key figures, percentage rings, bar, doughnut and timeline charts,
  automatically written highlights and a table preview.
- **Dynamic analysis:** choose which column to group by, which value to use and whether to
  sum, average or count. Dashboard and slides update instantly.
- **Slide editor:** a preview of every slide on the page, where you can reorder and hide
  slides. What you see in the preview is exactly what goes into the PDF.
- **Filters:** narrow the report to a period (from one month to another, using the date
  column) and to some values of a category. Dashboard, slides and PDF show only the
  filtered rows and state the filter in use.
- **Editable text:** click any slide title or highlight in the preview and rewrite it.
  Clearing the text brings back the automatic one, and **Restaurar textos automáticos**
  (restore automatic text) undoes every edit.
- **Two-column comparison:** in **Comparar com** (compare with), pick a second numeric
  column to see both side by side per group, each on its own axis.
- **Three themes:** Prisma, Executivo and Vibrante, each with its own colors and fonts,
  picked from a dropdown. The theme applies to the page, the slides and the PDF.
- **PDF and PowerPoint slides:** a 16:9 presentation with cover, key figures, shares, bars,
  distribution, monthly trend, comparison, highlights, ranking and a detail table. The
  **Download slides** button offers both formats. In the `.pptx`, each slide is a
  high-resolution image, with its title in the speaker notes.
- **Portuguese, English and Spanish:** the flags in the top-right corner switch the language
  of the page, the slides, the highlights and the number and date format. The choice is saved
  in the browser; on the first visit, the browser's language is used.
- **Light and dark mode:** the page follows the system setting.
- **Responsive:** works on desktop and mobile.

The interface is currently in Portuguese.

## Screens

### Slide editor and themes

![Slides tab with the slide list on the left and a large preview on the right](docs/screenshots/editor.png)

| Theme picker | Dashboard in dark mode |
| --- | --- |
| ![Dropdown with the three themes](docs/screenshots/temas.png) | ![Page in dark mode](docs/screenshots/tema-escuro.png) |

| Prisma, Executivo and Vibrante themes |
| --- |
| ![Report cover in the three themes](docs/screenshots/temas-capas.png) |
| ![Bar chart slide in the three themes](docs/screenshots/temas-graficos.png) |

### Filters and text editing

![Filters by period and by product](docs/screenshots/filtros.png)

![A highlight being edited right in the slide preview](docs/screenshots/edicao.png)

### Languages and download

![Slides tab in English](docs/screenshots/idioma-ingles.png)

| Dashboard in Spanish | Download as PDF or PowerPoint |
| --- | --- |
| ![Dashboard in Spanish, with Spanish number format](docs/screenshots/idioma-espanhol.png) | ![Download slides menu with PDF and PowerPoint options](docs/screenshots/download.png) |

### Dashboard

| Charts and highlights | Data table |
| --- | --- |
| ![Charts and highlights](docs/screenshots/graficos.png) | ![Data table with each column's type](docs/screenshots/dados.png) |

### PDF slides (Prisma theme)

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

| Two-column comparison | Details |
| --- | --- |
| ![Slide comparing revenue and quantity](docs/screenshots/slide-comparacao.png) | ![Slide with a detail table](docs/screenshots/slide-detalhes.png) |

### Mobile

| Home | Key figures | Slides |
| --- | --- | --- |
| <img src="docs/screenshots/celular-inicio.png" alt="Home on mobile" width="260" /> | <img src="docs/screenshots/celular-indicadores.png" alt="Key figures on mobile" width="260" /> | <img src="docs/screenshots/celular-slides.png" alt="Slides on mobile" width="260" /> |

## Technologies

| Technology | What it is for |
| --- | --- |
| [React](https://react.dev/) | Interface components and one component per slide type |
| [TypeScript](https://www.typescriptlang.org/) | Typed code that is safer to maintain |
| [Vite](https://vite.dev/) | Development server and production build |
| [SheetJS](https://sheetjs.com/) | Reading Excel and CSV files |
| [Chart.js](https://www.chartjs.org/) | Bar, doughnut and line charts |
| [html-to-image](https://github.com/bubkoo/html-to-image) and [jsPDF](https://github.com/parallax/jsPDF) | Capturing the slides and building the PDF |
| [PptxGenJS](https://gitbrent.github.io/PptxGenJS/) | Building the PowerPoint file |
| [Fontsource](https://fontsource.org/) | Theme fonts bundled with the project |

The project has no database, login or server. The build is a set of static files,
published to GitHub Pages every time the `main` branch is updated.

## Running it locally

You need [Node.js](https://nodejs.org/) 20 or newer.

```bash
git clone https://github.com/vidaltechnologies/prismareports.git
cd prismareports
npm install
npm run dev
```

Then open http://localhost:5173. The page opens with sample sales data. To try another
file, use `exemplos/despesas-por-departamento.csv`.

Other commands:

| Command | What it does |
| --- | --- |
| `npm run build` | Builds the production version into `dist/` |
| `npm run preview` | Serves the version built by `build` |
| `npm run build:single` | Builds a single self-contained `index.html` into `dist-single/` |
| `npm run typecheck` | Checks the code's types |

### Publishing

The `.github/workflows/deploy.yml` workflow publishes the site to GitHub Pages whenever
`main` is updated. To turn it on, go to the repository's **Settings → Pages** and choose
**GitHub Actions** as the source.

## Code structure

```
src/
├── main.tsx                # Entry point
├── App.tsx                 # Page state: data, settings, theme, language, slides and export
├── i18n.ts                 # Interface text in Portuguese, English and Spanish
├── themes.ts               # The three themes (colors and fonts)
├── styles.css              # Page and slide styles
├── components/
│   ├── Uploader.tsx        # Drop area and file picker
│   ├── Controls.tsx        # Title, sheet, grouping, value, comparison and timeline
│   ├── FiltersBar.tsx      # Period and category filters
│   ├── Dashboard.tsx       # Dashboard tab
│   ├── SlideEditor.tsx     # Slides tab: preview, order and hidden slides
│   ├── ThemePicker.tsx     # Theme dropdown
│   ├── LanguageSwitcher.tsx # Flags to switch the language
│   ├── ExportMenu.tsx      # Download slides button, with PDF and PowerPoint
│   ├── ScaledSlide.tsx     # 1280×720 slide scaled down to fit the screen
│   ├── ExportStage.tsx     # Renders slides at full size for export
│   ├── ChartCanvas.tsx     # Chart.js chart as a component
│   └── Ring.tsx            # SVG percentage ring
├── slides/
│   └── slides.tsx          # One component per slide type and the slide list
└── lib/
    ├── parse.ts            # Spreadsheet reading and column type detection
    ├── report.ts           # Grouping, totals, monthly series and highlights
    ├── charts.ts           # Chart configuration
    ├── exportSlides.ts     # Slide capture, PDF and PowerPoint generation
    ├── format.ts           # Numbers, percentages and dates in the chosen language
    └── sample.ts           # Sample data
exemplos/                   # Test spreadsheet
docs/                       # Logo and images used in this README
```

## Next steps

- Save a report (settings, filters and text) to open again later.
- PowerPoint with editable text and charts, instead of one image per slide.
- Translate the column names of the sample data too.

---

© Vidal Technologies. All rights reserved.
