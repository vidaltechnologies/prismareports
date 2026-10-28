<p align="center">
  <img src="docs/icon.svg" alt="Prisma Reports" width="72" />
</p>

<h1 align="center">Prisma Reports — informes visuales a partir de hojas de cálculo</h1>

<p align="center">
  Sube un archivo <strong>Excel o CSV</strong> y obtén al instante un informe con indicadores, porcentajes y gráficos.<br />
  Arma la presentación en la propia página y descarga las diapositivas en PDF o PowerPoint.
</p>

<p align="center">
  <a href="README.md">Português</a> · <a href="README.en.md">English</a> · <strong>Español</strong>
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19-20232A?logo=react&logoColor=61DAFB" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white" />
  <img alt="Chart.js" src="https://img.shields.io/badge/Chart.js-4-FF6384?logo=chartdotjs&logoColor=white" />
  <img alt="GitHub Pages" src="https://img.shields.io/badge/Alojamiento-GitHub_Pages-222222?logo=github&logoColor=white" />
</p>

![Página inicial de Prisma Reports con indicadores y anillos de porcentaje](docs/screenshots/inicio.png)

## Sobre el proyecto

Prisma Reports convierte una hoja de cálculo en un informe visual, sin armar gráficos a
mano. Subes el archivo, eliges qué analizar, ajustas las diapositivas y descargas la
presentación lista en PDF o PowerPoint.

La inspiración es [beautiful.ai](https://www.beautiful.ai/): diapositivas atractivas, con
diseños que se ajustan solos al contenido y temas listos, aquí alimentadas por los datos
de la hoja.

Todo funciona en el navegador. Los datos no se envían a ningún servidor.

### Objetivos

- Leer cualquier hoja con encabezado en la primera fila, sin configuración.
- Mostrar los números más importantes de forma clara y visual.
- Permitir cambiar el análisis (agrupación, valor, cálculo) y ver el resultado al instante.
- Generar un PDF o un PowerPoint igual a la vista previa, listo para enviar o presentar.

## Funcionalidades

- **Carga de Excel y CSV:** `.xlsx`, `.xls` y `.csv`, arrastrando el archivo a la página o
  con el botón **Abrir planilha** (abrir hoja). Los libros con varias hojas muestran un
  selector de hoja.
- **Detección automática de columnas:** cada columna se reconoce como número, fecha,
  categoría o texto, incluidos los formatos brasileños (`1.234,56`, `R$ 10,00`,
  `dd/mm/aaaa`). CSV separado por `;`, `,` o tabulación, en UTF-8 o Windows-1252.
- **Panel:** indicadores, anillos de porcentaje, gráficos de barras, dona y línea de
  tiempo, destacados escritos automáticamente y vista previa de la tabla.
- **Análisis dinámico:** elige por qué columna agrupar, qué valor usar y si el cálculo es
  suma, promedio o conteo. Panel y diapositivas se actualizan al instante.
- **Editor de diapositivas:** vista previa de todas las diapositivas en la página, con la
  opción de cambiar el orden y ocultar diapositivas. Lo que ves en la vista previa es
  exactamente lo que va al PDF.
- **Filtros:** limita el informe a un período (de un mes a otro, por la columna de fecha)
  y a algunos valores de una categoría. Panel, diapositivas y PDF muestran solo las filas
  filtradas e indican el filtro usado.
- **Textos editables:** haz clic en el título de cualquier diapositiva o en un destacado,
  en la vista previa, y reescríbelo. Borrar el texto vuelve al automático, y **Restaurar
  textos automáticos** deshace todas las ediciones.
- **Comparación entre dos columnas:** en **Comparar com** (comparar con), elige una segunda
  columna numérica para ver ambas lado a lado por grupo, cada una en su propio eje.
- **Tres temas:** Prisma, Executivo y Vibrante, cada uno con sus colores y fuentes,
  elegidos en una lista desplegable. El tema se aplica a la página, las diapositivas y el PDF.
- **Diapositivas en PDF y PowerPoint:** presentación 16:9 con portada, indicadores,
  participación, barras, distribución, evolución mensual, comparación, destacados, ranking y
  tabla de detalle. El botón **Descargar diapositivas** ofrece los dos formatos. En el
  `.pptx`, cada diapositiva es una imagen en alta resolución, con el título en las notas.
- **Portugués, inglés y español:** las banderas en la esquina superior derecha cambian el
  idioma de la página, las diapositivas, los destacados y el formato de números y fechas. La
  elección queda guardada en el navegador; en la primera visita se usa el idioma del navegador.
- **Modo claro y oscuro:** la página sigue la configuración del sistema.
- **Responsivo:** funciona en computadora y en celular.

Por ahora, la interfaz está en portugués.

## Pantallas

### Editor de diapositivas y temas

![Pestaña Slides con la lista de diapositivas a la izquierda y la vista previa grande a la derecha](docs/screenshots/editor.png)

| Selección de tema | Panel en modo oscuro |
| --- | --- |
| ![Lista desplegable con los tres temas](docs/screenshots/temas.png) | ![Página en modo oscuro](docs/screenshots/tema-escuro.png) |

| Temas Prisma, Executivo y Vibrante |
| --- |
| ![Portada del informe en los tres temas](docs/screenshots/temas-capas.png) |
| ![Diapositiva de barras en los tres temas](docs/screenshots/temas-graficos.png) |

### Filtros y edición de textos

![Filtros por período y por producto](docs/screenshots/filtros.png)

![Un destacado editado directamente en la vista previa](docs/screenshots/edicao.png)

### Idiomas y descarga

![Pestaña Diapositivas en inglés](docs/screenshots/idioma-ingles.png)

| Panel en español | Descarga en PDF o PowerPoint |
| --- | --- |
| ![Panel en español, con números en formato español](docs/screenshots/idioma-espanhol.png) | ![Menú Descargar diapositivas con las opciones PDF y PowerPoint](docs/screenshots/download.png) |

### Panel

| Gráficos y destacados | Tabla de datos |
| --- | --- |
| ![Gráficos y destacados](docs/screenshots/graficos.png) | ![Tabla de datos con el tipo de cada columna](docs/screenshots/dados.png) |

### Diapositivas en PDF (tema Prisma)

| Portada | Indicadores |
| --- | --- |
| ![Diapositiva de portada](docs/screenshots/slide-capa.png) | ![Diapositiva de indicadores](docs/screenshots/slide-indicadores.png) |

| Participación | Comparativo en barras |
| --- | --- |
| ![Diapositiva de participación](docs/screenshots/slide-participacao.png) | ![Diapositiva con gráfico de barras](docs/screenshots/slide-barras.png) |

| Distribución | Evolución mensual |
| --- | --- |
| ![Diapositiva con gráfico de dona](docs/screenshots/slide-rosca.png) | ![Diapositiva con línea de tiempo](docs/screenshots/slide-evolucao.png) |

| Destacados | Ranking |
| --- | --- |
| ![Diapositiva de destacados](docs/screenshots/slide-destaques.png) | ![Diapositiva de ranking](docs/screenshots/slide-ranking.png) |

| Comparación entre dos columnas | Detalles |
| --- | --- |
| ![Diapositiva que compara ingresos y cantidad](docs/screenshots/slide-comparacao.png) | ![Diapositiva con tabla de detalle](docs/screenshots/slide-detalhes.png) |

### Celular

| Inicio | Indicadores | Diapositivas |
| --- | --- | --- |
| <img src="docs/screenshots/celular-inicio.png" alt="Inicio en el celular" width="260" /> | <img src="docs/screenshots/celular-indicadores.png" alt="Indicadores en el celular" width="260" /> | <img src="docs/screenshots/celular-slides.png" alt="Diapositivas en el celular" width="260" /> |

## Tecnologías

| Tecnología | Para qué sirve |
| --- | --- |
| [React](https://react.dev/) | Componentes de la interfaz y un componente por tipo de diapositiva |
| [TypeScript](https://www.typescriptlang.org/) | Código tipado, más seguro de mantener |
| [Vite](https://vite.dev/) | Servidor de desarrollo y generación de la versión final |
| [SheetJS](https://sheetjs.com/) | Lectura de archivos Excel y CSV |
| [Chart.js](https://www.chartjs.org/) | Gráficos de barras, dona y línea |
| [html-to-image](https://github.com/bubkoo/html-to-image) y [jsPDF](https://github.com/parallax/jsPDF) | Captura de las diapositivas y armado del PDF |
| [PptxGenJS](https://gitbrent.github.io/PptxGenJS/) | Armado del archivo de PowerPoint |
| [Fontsource](https://fontsource.org/) | Fuentes de los temas incluidas en el proyecto |

El proyecto no usa base de datos, login ni servidor. La versión final es un conjunto de
archivos estáticos, publicada en GitHub Pages cada vez que se actualiza la rama `main`.

## Cómo ejecutarlo en tu computadora

Necesitas [Node.js](https://nodejs.org/) 20 o más reciente.

```bash
git clone https://github.com/vidaltechnologies/prismareports.git
cd prismareports
npm install
npm run dev
```

Luego abre http://localhost:5173. La página abre con datos de ventas de ejemplo. Para
probar con otro archivo, usa `exemplos/despesas-por-departamento.csv`.

Otros comandos:

| Comando | Qué hace |
| --- | --- |
| `npm run build` | Genera la versión final en `dist/` |
| `npm run preview` | Sirve la versión generada por `build` |
| `npm run build:single` | Genera un único `index.html` con todo incluido, en `dist-single/` |
| `npm run typecheck` | Verifica los tipos del código |

### Publicación

El workflow `.github/workflows/deploy.yml` publica el sitio en GitHub Pages cada vez que
se actualiza `main`. Para activarlo, en **Settings → Pages** del repositorio, elige
**GitHub Actions** como origen.

## Estructura del código

```
src/
├── main.tsx                # Punto de entrada
├── App.tsx                 # Estado de la página: datos, configuración, tema, idioma, diapositivas y exportación
├── i18n.ts                 # Textos de la interfaz en portugués, inglés y español
├── themes.ts               # Los tres temas (colores y fuentes)
├── styles.css              # Estilos de la página y de las diapositivas
├── components/
│   ├── Uploader.tsx        # Área para soltar o elegir la hoja
│   ├── Controls.tsx        # Título, hoja, agrupación, valor, comparación y línea de tiempo
│   ├── FiltersBar.tsx      # Filtros por período y por categoría
│   ├── Dashboard.tsx       # Pestaña Panel
│   ├── SlideEditor.tsx     # Pestaña Slides: vista previa, orden y diapositivas ocultas
│   ├── ThemePicker.tsx     # Lista desplegable de temas
│   ├── LanguageSwitcher.tsx # Banderas para cambiar el idioma
│   ├── ExportMenu.tsx      # Botón Descargar diapositivas, con PDF y PowerPoint
│   ├── ScaledSlide.tsx     # Diapositiva de 1280×720 reducida para caber en pantalla
│   ├── ExportStage.tsx     # Renderiza las diapositivas a tamaño real para la exportación
│   ├── ChartCanvas.tsx     # Gráfico de Chart.js como componente
│   └── Ring.tsx            # Anillo de porcentaje en SVG
├── slides/
│   └── slides.tsx          # Un componente por tipo de diapositiva y la lista de diapositivas
└── lib/
    ├── parse.ts            # Lectura de la hoja y detección de tipos de columna
    ├── report.ts           # Agrupaciones, totales, serie mensual y destacados
    ├── charts.ts           # Configuración de los gráficos
    ├── exportSlides.ts     # Captura de diapositivas y generación del PDF y del PowerPoint
    ├── format.ts           # Números, porcentajes y fechas en el idioma elegido
    └── sample.ts           # Datos de ejemplo
exemplos/                   # Hoja de prueba
docs/                       # Logo e imágenes usadas en este README
```

## Próximos pasos

- Guardar un informe (configuración, filtros y textos) para abrirlo de nuevo después.
- PowerPoint con textos y gráficos editables, en lugar de una imagen por diapositiva.
- Traducir también los nombres de las columnas de los datos de ejemplo.

---

© Vidal Technologies. Todos los derechos reservados.
