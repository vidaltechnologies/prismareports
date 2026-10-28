import type PptxGenJS from 'pptxgenjs'
import { t } from '../i18n'
import { kpiItems, slideHeading, type SlideId, type TextEdits } from '../slides/slides'
import type { Theme } from '../themes'
import { compact, fmt, int, pct, today } from './format'
import { topWithOthers, type Report } from './report'

/*
 * Apresentação do PowerPoint montada com elementos nativos: caixas de texto, gráficos e tabelas
 * que a pessoa edita no PowerPoint, no Keynote ou no Google Apresentações.
 * O desenho segue os slides da página (1280×720 px), convertidos para o 16:9 do PowerPoint (10 × 5,625 pol.).
 */

type Pptx = InstanceType<typeof PptxGenJS>
type PSlide = ReturnType<Pptx['addSlide']>

const W = 10
const H = 5.625
/** px do slide da página → polegadas. */
const u = (px: number) => px / 128
/** px de fonte → pontos. */
const pt = (px: number) => Math.round(px * 0.5625 * 10) / 10
const hex = (c: string) => c.replace('#', '').toUpperCase()
/** Primeiro nome da pilha de fontes do tema (todas são Google Fonts). */
const fontName = (stack: string) => stack.split(',')[0].replace(/["']/g, '').trim()

const PAD_X = u(72)
const BODY_W = W - 2 * PAD_X
const BODY_Y = u(178)
const FOOT_H = u(56)
const BODY_H = H - FOOT_H - u(24) - BODY_Y

interface Ctx {
  pptx: Pptx
  R: Report
  theme: Theme
  display: string
  body: string
  index: number
  total: number
  edits: TextEdits
}

function frame(c: Ctx, id: SlideId): PSlide {
  const { pptx, R, theme } = c
  const S = theme.slide
  const slide = pptx.addSlide()
  slide.background = { color: hex(S.bg) }
  const h = slideHeading(id, R)
  slide.addText(h.kicker.toUpperCase(), { x: PAD_X, y: u(56), w: BODY_W, h: u(24), fontFace: c.body, fontSize: pt(14), bold: true, color: hex(S.accent), charSpacing: 2, margin: 0 })
  slide.addText(c.edits.titles[id] || h.title, { x: PAD_X, y: u(86), w: BODY_W, h: u(64), fontFace: c.display, fontSize: pt(44), bold: true, color: hex(S.fg), margin: 0, valign: 'top', fit: 'shrink' })
  const footY = H - FOOT_H
  slide.addShape('line', { x: PAD_X, y: footY, w: BODY_W, h: 0, line: { color: hex(S.line), width: 0.75 } })
  const left = [R.settings.title, R.fileName, R.filterLabel].filter(Boolean).join(' · ')
  slide.addText(left, { x: PAD_X, y: footY, w: BODY_W - 1, h: FOOT_H, fontFace: c.body, fontSize: pt(14), color: hex(S.muted), margin: 0, valign: 'middle' })
  slide.addText(`${c.index} / ${c.total}`, { x: W - PAD_X - 1, y: footY, w: 1, h: FOOT_H, fontFace: c.body, fontSize: pt(14), color: hex(S.muted), margin: 0, align: 'right', valign: 'middle' })
  return slide
}

/** Cores e fontes comuns aos gráficos. */
function chartLook(c: Ctx) {
  const S = c.theme.slide
  return {
    catAxisLabelColor: hex(S.muted),
    valAxisLabelColor: hex(S.muted),
    catAxisLabelFontFace: c.body,
    valAxisLabelFontFace: c.body,
    catAxisLabelFontSize: pt(16),
    valAxisLabelFontSize: pt(16),
    catAxisLineColor: hex(S.line),
    valAxisLineShow: false,
    valGridLine: { color: hex(S.line), size: 0.75 },
    catGridLine: { style: 'none' as const },
    valAxisLabelFormatCode: '#,##0',
    legendFontFace: c.body,
    legendColor: hex(S.fg),
    legendFontSize: pt(16),
  }
}

function cover(c: Ctx) {
  const { pptx, R, theme } = c
  const S = theme.slide
  const slide = pptx.addSlide()
  slide.background = { color: hex(S.coverBg) }
  // O prisma da capa: um triângulo com uma faixa vertical no meio.
  const box = { x: u(800), y: u(286), size: u(440) }
  const tri = { x: box.x + (box.size * 20) / 420, y: box.y + (box.size * 30) / 420, w: (box.size * 380) / 420, h: (box.size * 370) / 420 }
  slide.addShape('triangle', { ...tri, fill: { color: hex(S.coverShape) }, line: { type: 'none' } })
  slide.addShape('rect', { x: tri.x + tri.w / 2 - u(5), y: tri.y, w: u(10), h: tri.h, fill: { color: hex(S.coverShape2) }, line: { type: 'none' } })
  slide.addText('PRISMA REPORTS', { x: u(88), y: u(64), w: 5, h: u(28), fontFace: c.body, fontSize: pt(14), bold: true, color: hex(S.coverMuted), charSpacing: 2, margin: 0 })
  slide.addText(R.settings.title, { x: u(88), y: u(190), w: u(700), h: u(250), fontFace: c.display, fontSize: pt(76), bold: true, color: hex(S.coverFg), margin: 0, valign: 'bottom', fit: 'shrink' })
  const meta = [`${R.fileName} · ${t().rowsLabel(int(R.rowCount))} · ${today()}`]
  if (R.filterLabel) meta.push(t().filterNote(R.filterLabel))
  slide.addText(meta.join('\n'), { x: u(88), y: u(466), w: u(700), h: u(90), fontFace: c.body, fontSize: pt(20), color: hex(S.coverMuted), margin: 0, valign: 'top' })
}

function kpis(c: Ctx) {
  const slide = frame(c, 'indicadores')
  const S = c.theme.slide
  const items = kpiItems(c.R)
  const cols = items.length === 2 || items.length === 4 ? 2 : 3
  const rows = Math.ceil(items.length / cols)
  const gap = u(20)
  const cw = (BODY_W - gap * (cols - 1)) / cols
  const ch = u(176)
  const top = BODY_Y + (BODY_H - (rows * ch + (rows - 1) * gap)) / 2
  items.forEach((k, i) => {
    const x = PAD_X + (i % cols) * (cw + gap)
    const y = top + Math.floor(i / cols) * (ch + gap)
    const color = i === 0 ? S.fg : c.theme.palette[(i - 1) % 6]
    slide.addShape('roundRect', { x, y, w: cw, h: ch, rectRadius: 0.12, fill: { color: hex(S.card) }, line: { type: 'none' } })
    slide.addText(
      [
        { text: k.l, options: { fontSize: pt(18), color: hex(S.muted), breakLine: true } },
        { text: k.v, options: { fontFace: c.display, fontSize: pt(50), bold: true, color: hex(color), breakLine: true } },
        { text: k.f, options: { fontSize: pt(15), color: hex(S.muted) } },
      ],
      { x: x + u(28), y, w: cw - u(56), h: ch, fontFace: c.body, margin: 0, valign: 'middle', paraSpaceAfter: 2, fit: 'shrink' },
    )
  })
}

function shares(c: Ctx) {
  const slide = frame(c, 'participacao')
  const S = c.theme.slide
  const items = topWithOthers(c.R.groups, 5).slice(0, 5)
  const size = u(items.length > 4 ? 170 : 200)
  const colW = BODY_W / items.length
  const top = BODY_Y + (BODY_H - size - u(80)) / 2
  items.forEach((g, i) => {
    const cx = PAD_X + colW * i + colW / 2
    const share = Math.min(1, Math.max(0, g.share))
    slide.addChart('doughnut', [{ name: g.label, labels: ['', ''], values: [share, 1 - share] }], {
      x: cx - size / 2,
      y: top,
      w: size,
      h: size,
      holeSize: 78,
      chartColors: [hex(c.theme.palette[i % 6]), hex(S.track)],
      dataBorder: { pt: 0, color: hex(S.bg) },
      showLegend: false,
      showValue: false,
      showPercent: false,
      showLabel: false,
      showTitle: false,
      firstSliceAng: 0,
      layout: { x: 0, y: 0, w: 1, h: 1 },
    })
    slide.addText(pct(g.share), { x: cx - size / 2, y: top, w: size, h: size, align: 'center', valign: 'middle', fontFace: c.display, fontSize: pt(size * 128 * 0.18), bold: true, color: hex(S.fg), margin: 0 })
    slide.addText(
      [
        { text: g.label, options: { fontSize: pt(21), bold: true, color: hex(S.fg), breakLine: true } },
        { text: compact(g.value), options: { fontSize: pt(16), color: hex(S.muted) } },
      ],
      { x: cx - colW / 2, y: top + size + u(12), w: colW, h: u(64), align: 'center', valign: 'top', fontFace: c.body, margin: 0, fit: 'shrink' },
    )
  })
}

function bars(c: Ctx) {
  const slide = frame(c, 'barras')
  const top = c.R.groups.slice(0, 12)
  const horizontal = top.length > 6
  slide.addChart('bar', [{ name: c.R.aggLabel, labels: top.map((g) => g.label), values: top.map((g) => g.value) }], {
    x: PAD_X,
    y: BODY_Y,
    w: BODY_W,
    h: BODY_H,
    ...chartLook(c),
    barDir: horizontal ? 'bar' : 'col',
    // Barras deitadas: o maior grupo fica em cima, como na página.
    ...(horizontal ? { catAxisOrientation: 'maxMin' as 'minMax' } : {}),
    chartColors: [hex(c.theme.palette[0])],
    barGapWidthPct: 60,
    showLegend: false,
    showValue: true,
    dataLabelFormatCode: '#,##0',
    dataLabelFontFace: c.body,
    dataLabelFontSize: pt(14),
    dataLabelColor: hex(c.theme.slide.fg),
    dataLabelPosition: 'outEnd',
  })
}

function pie(c: Ctx) {
  const slide = frame(c, 'distribuicao')
  const items = topWithOthers(c.R.groups, 6)
  slide.addChart('doughnut', [{ name: c.R.aggLabel, labels: items.map((g) => `${g.label}  ${pct(g.share)}`), values: items.map((g) => g.share) }], {
    x: PAD_X,
    y: BODY_Y,
    w: BODY_W,
    h: BODY_H,
    ...chartLook(c),
    holeSize: 58,
    chartColors: items.map((_, i) => hex(c.theme.palette[i % 6])),
    dataBorder: { pt: 1.5, color: hex(c.theme.slide.bg) },
    showLegend: true,
    legendPos: 'r',
    showPercent: false,
    showValue: false,
    showLabel: false,
  })
}

function trend(c: Ctx) {
  const slide = frame(c, 'evolucao')
  const S = c.R.series!
  const color = hex(c.theme.palette[2])
  slide.addChart('line', [{ name: c.R.aggLabel, labels: S.labels, values: S.values }], {
    x: PAD_X,
    y: BODY_Y,
    w: BODY_W,
    h: BODY_H,
    ...chartLook(c),
    chartColors: [color],
    lineSize: 2.5,
    lineDataSymbol: 'circle',
    lineDataSymbolSize: 6,
    lineDataSymbolLineColor: color,
    showLegend: false,
  })
}

function compare(c: Ctx) {
  const slide = frame(c, 'comparacao')
  const C = c.R.compare!
  const look = chartLook(c)
  const [a, b] = [hex(c.theme.palette[0]), hex(c.theme.palette[1])]
  // Dois eixos, como na página: barras para a primeira coluna e linha para a segunda.
  slide.addChart(
    [
      { type: 'bar', data: [{ name: C.nameA, labels: C.labels, values: C.a }], options: { chartColors: [a], barGapWidthPct: 60 } },
      { type: 'line', data: [{ name: C.nameB, labels: C.labels, values: C.b }], options: { chartColors: [b], secondaryValAxis: true, secondaryCatAxis: true, lineSize: 2.5, lineDataSymbol: 'circle', lineDataSymbolSize: 7 } },
    ] as never,
    {
      x: PAD_X,
      y: BODY_Y,
      w: BODY_W,
      h: BODY_H,
      ...look,
      showLegend: true,
      legendPos: 't',
      valAxes: [
        { showValAxisTitle: false, valAxisLabelColor: a, valAxisLabelFormatCode: '#,##0', valGridLine: look.valGridLine, valAxisLineShow: false },
        { showValAxisTitle: false, valAxisLabelColor: b, valAxisLabelFormatCode: '#,##0', valGridLine: { style: 'none' }, valAxisLineShow: false },
      ],
      catAxes: [{ catAxisTitle: '', catAxisLabelColor: look.catAxisLabelColor }, { catAxisHidden: true }],
    } as never,
  )
}

function highlights(c: Ctx) {
  const slide = frame(c, 'destaques')
  const S = c.theme.slide
  const runs = c.R.insights.flatMap((ins, i) => [
    { text: '●  ', options: { color: hex(c.theme.palette[i % 6]), fontSize: pt(18) } },
    { text: ins.text, options: { color: hex(S.fg), breakLine: i < c.R.insights.length - 1 } },
  ])
  slide.addText(runs, { x: PAD_X, y: BODY_Y, w: u(1060), h: BODY_H, fontFace: c.body, fontSize: pt(25), valign: 'middle', margin: 0, paraSpaceAfter: pt(22), lineSpacingMultiple: 1.1, fit: 'shrink' })
}

/** Célula de tabela com só a linha de baixo, como nos slides da página. */
function cell(c: Ctx, text: string, opts: PptxGenJS.TableCellProps = {}): PptxGenJS.TableCell {
  const line: PptxGenJS.BorderProps = { pt: 0.75, color: hex(c.theme.slide.line) }
  const none: PptxGenJS.BorderProps = { type: 'none' }
  return { text, options: { border: [none, none, line, none], ...opts } }
}

function headCell(c: Ctx, text: string, align: 'left' | 'right' = 'left') {
  return cell(c, text.toUpperCase(), { bold: true, fontSize: pt(13), color: hex(c.theme.slide.muted), align })
}

function ranking(c: Ctx) {
  const slide = frame(c, 'ranking')
  const R = c.R
  const S = c.theme.slide
  const rows = R.groups.slice(0, 10)
  const maxShare = Math.max(...rows.map((r) => r.share), 0.0001)
  const colW = [u(44), BODY_W - u(44) - u(220) - u(200) - u(110), u(220), u(200), u(110)]
  const rowH = u(39)
  const headH = u(32)
  slide.addTable(
    [
      [headCell(c, '#'), headCell(c, R.settings.cat), headCell(c, R.aggLabel, 'right'), headCell(c, t().share, 'right'), headCell(c, '', 'right')],
      ...rows.map((r, i) => [
        cell(c, String(i + 1), { color: hex(S.muted) }),
        cell(c, r.label),
        cell(c, fmt(r.value), { align: 'right' }),
        cell(c, ''),
        cell(c, pct(r.share), { align: 'right' }),
      ]),
    ],
    { x: PAD_X, y: BODY_Y, w: BODY_W, colW, rowH: [headH, ...rows.map(() => rowH)], fontFace: c.body, fontSize: pt(19), color: hex(S.fg), valign: 'middle', margin: [0, 0, 0, 0] },
  )
  // Barras da participação, desenhadas sobre a coluna vazia da tabela.
  const barX = PAD_X + colW[0] + colW[1] + colW[2] + u(32)
  const barMax = colW[3] - u(32)
  rows.forEach((r, i) => {
    const w = Math.max(u(4), (r.share / maxShare) * barMax)
    slide.addShape('roundRect', { x: barX, y: BODY_Y + headH + rowH * i + rowH / 2 - u(5), w, h: u(10), rectRadius: 0.04, fill: { color: hex(S.accent) }, line: { type: 'none' } })
  })
  if (R.groups.length > 10) {
    slide.addText(t().topNGroups(R.groups.length), { x: PAD_X, y: BODY_Y + headH + rowH * rows.length + u(10), w: BODY_W, h: u(24), fontFace: c.body, fontSize: pt(15), color: hex(S.muted), margin: 0 })
  }
}

function details(c: Ctx) {
  const slide = frame(c, 'detalhes')
  const D = c.R.details!
  const right = (j: number) => (D.columns[j].type === 'number' ? 'right' : 'left')
  slide.addTable(
    [D.columns.map((col, j) => headCell(c, col.name, right(j))), ...D.rows.map((r) => r.map((v, j) => cell(c, v, { align: right(j) })))],
    { x: PAD_X, y: BODY_Y, w: BODY_W, rowH: u(30), fontFace: c.body, fontSize: pt(16), color: hex(c.theme.slide.fg), valign: 'middle', margin: [0, u(12), 0, 0] },
  )
  if (c.R.rowCount > 10) {
    slide.addText(t().nOfRows(int(c.R.rowCount)), { x: PAD_X, y: BODY_Y + u(30) * (D.rows.length + 1) + u(12), w: BODY_W, h: u(24), fontFace: c.body, fontSize: pt(15), color: hex(c.theme.slide.muted), margin: 0 })
  }
}

const BUILDERS: Record<SlideId, (c: Ctx) => void> = {
  capa: cover,
  indicadores: kpis,
  participacao: shares,
  barras: bars,
  distribuicao: pie,
  evolucao: trend,
  comparacao: compare,
  destaques: highlights,
  ranking,
  detalhes: details,
}

/** Gera o .pptx com os slides visíveis, na ordem do editor. */
export async function reportToPptx(slides: SlideId[], R: Report, theme: Theme, edits: TextEdits): Promise<Blob> {
  const { default: PptxGenJS } = await import('pptxgenjs')
  const pptx = new PptxGenJS()
  pptx.layout = 'LAYOUT_16x9'
  pptx.title = R.settings.title
  pptx.company = 'Prisma Reports'
  const ctx = { pptx, R, theme, display: fontName(theme.display), body: fontName(theme.body), edits, total: slides.length }
  slides.forEach((id, i) => BUILDERS[id]({ ...ctx, index: i + 1 }))
  return (await pptx.write({ outputType: 'blob' })) as Blob
}
