<p align="center">
  <img src="docs/icon.svg" alt="Prisma Reports" width="72" />
</p>

<h1 align="center">Prisma Reports — informes visuales a partir de hojas de cálculo</h1>

<p align="center">
  Sube un archivo <strong>Excel o CSV</strong> y obtén al instante un informe con indicadores, porcentajes y gráficos.<br />
  Con un clic, el informe se convierte en una presentación de diapositivas en PDF.
</p>

<p align="center">
  <a href="README.md">Português</a> · <a href="README.en.md">English</a> · <strong>Español</strong>
</p>

<p align="center">
  <img alt="HTML5" src="https://img.shields.io/badge/HTML5-página_única-E34F26?logo=html5&logoColor=white" />
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-ES2020-F7DF1E?logo=javascript&logoColor=black" />
  <img alt="SheetJS" src="https://img.shields.io/badge/SheetJS-0.18-217346?logo=microsoftexcel&logoColor=white" />
  <img alt="Chart.js" src="https://img.shields.io/badge/Chart.js-4-FF6384?logo=chartdotjs&logoColor=white" />
  <img alt="jsPDF" src="https://img.shields.io/badge/jsPDF-2.5-B30B00?logo=adobeacrobatreader&logoColor=white" />
</p>

![Página inicial de Prisma Reports con indicadores y anillos de porcentaje](docs/screenshots/inicio.png)

## Sobre el proyecto

Prisma Reports convierte una hoja de cálculo en un informe visual, sin armar gráficos a
mano. Subes el archivo, eliges qué analizar y descargas el resultado listo para presentar,
en diapositivas PDF.

La inspiración es [beautiful.ai](https://www.beautiful.ai/): diapositivas atractivas con
diseños que se ajustan solos al contenido, aquí alimentadas por los datos de la hoja.

Todo funciona en el navegador. Los datos no se envían a ningún servidor.

### Objetivos

- Leer cualquier hoja con encabezado en la primera fila, sin configuración.
- Mostrar los números más importantes de forma clara y visual.
- Permitir cambiar el análisis (agrupación, valor, cálculo) y ver el resultado al instante.
- Generar una presentación en PDF lista para enviar o presentar.

## Funcionalidades

- **Carga de Excel y CSV:** `.xlsx`, `.xls` y `.csv`, arrastrando el archivo a la página o
  con el botón **Abrir planilha** (abrir hoja). Los libros con varias hojas muestran un
  selector de hoja.
- **Detección automática de columnas:** cada columna se reconoce como número, fecha,
  categoría o texto, incluidos los formatos brasileños (`1.234,56`, `R$ 10,00`,
  `dd/mm/aaaa`). CSV separado por `;`, `,` o tabulación, en UTF-8 o Windows-1252.
- **Indicadores:** total de filas, suma y promedio del valor elegido, número de grupos y
  grupo mayor.
- **Anillos de porcentaje:** la participación de cada grupo en el total.
- **Gráficos:** barras por grupo, dona con la distribución y línea de tiempo por mes.
- **Destacados automáticos:** frases cortas sobre el líder, la concentración de los grupos
  mayores, la variación del último mes y el mejor mes.
- **Análisis dinámico:** elige por qué columna agrupar, qué valor usar y si el cálculo es
  suma, promedio o conteo. Todo se actualiza al instante.
- **Diapositivas en PDF:** presentación 16:9 con portada, indicadores, participación,
  gráficos, destacados y ranking.
- **Tema claro y oscuro:** la página sigue el tema del sistema.
- **Responsivo:** funciona en computadora y en celular.

Por ahora, la interfaz está en portugués.

## Pantallas

### Computadora

| Gráficos y destacados | Tabla de datos |
| --- | --- |
| ![Gráficos y destacados](docs/screenshots/graficos.png) | ![Tabla de datos con el tipo de cada columna](docs/screenshots/dados.png) |

| Tema oscuro | |
| --- | --- |
| ![Página en tema oscuro](docs/screenshots/tema-escuro.png) | |

### Diapositivas en PDF

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

### Celular

| Inicio | Indicadores | Gráficos |
| --- | --- | --- |
| <img src="docs/screenshots/celular-inicio.png" alt="Inicio en el celular" width="260" /> | <img src="docs/screenshots/celular-indicadores.png" alt="Indicadores en el celular" width="260" /> | <img src="docs/screenshots/celular-graficos.png" alt="Gráficos en el celular" width="260" /> |

## Tecnologías

| Tecnología | Para qué sirve |
| --- | --- |
| HTML, CSS y JavaScript | Página única, sin etapa de build |
| [SheetJS](https://sheetjs.com/) | Lectura de archivos Excel y CSV |
| [Chart.js](https://www.chartjs.org/) | Gráficos de barras, dona y línea |
| [jsPDF](https://github.com/parallax/jsPDF) | Armado de las diapositivas en PDF |
| Canvas | Anillos de porcentaje |

Las bibliotecas se cargan desde el CDN jsDelivr. El proyecto no usa base de datos, login
ni servidor: la página puede alojarse como archivo estático (por ejemplo, en GitHub Pages).

## Cómo ejecutarlo en tu computadora

No hace falta instalar nada. Descarga el proyecto y abre `index.html` en el navegador:

```bash
git clone https://github.com/vidaltechnologies/prismareports.git
cd prismareports
```

Luego, haz doble clic en `index.html`. Si prefieres un servidor local:

```bash
npx serve .
```

y abre http://localhost:3000.

La página abre con datos de ventas de ejemplo. Para probar con otro archivo, usa
`exemplos/despesas-por-departamento.csv`.

## Estructura del código

```
index.html                 # Página completa: diseño, estilos, lectura, gráficos y PDF
exemplos/
└── despesas-por-departamento.csv  # Hoja de prueba (CSV con ;)
docs/
├── icon.svg               # Logo usado en este README
└── screenshots/           # Imágenes usadas en este README
```

## Próximos pasos

- Migrar a Vite + React + TypeScript, con un componente por tipo de diapositiva.
- Vista previa y edición de las diapositivas en la página, al estilo de beautiful.ai:
  temas, reordenar y ocultar diapositivas.
- Filtros por período y por categoría.

---

© Vidal Technologies. Todos los derechos reservados.
