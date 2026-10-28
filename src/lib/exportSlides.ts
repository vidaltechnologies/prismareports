import { SLIDE_H, SLIDE_W } from '../slides/slides'

interface DownloadsCap {
  save(req: { filename: string; data: Blob }): Promise<unknown>
}
interface ClaudeHost {
  use(name: string): Promise<unknown>
}

/**
 * Quando a página roda dentro de um Artifact do claude.ai, downloads diretos são bloqueados
 * e o arquivo precisa passar pela capacidade `downloads`. Fora dele, `window.claude` não existe.
 */
let downloadsCap: Promise<DownloadsCap | null> | null = null
function getDownloads() {
  const host = (window as unknown as { claude?: ClaudeHost }).claude
  if (!host?.use) return Promise.resolve(null)
  downloadsCap ??= host.use('downloads').then((d) => (d as DownloadsCap) ?? null).catch(() => null)
  return downloadsCap
}
getDownloads()

export type SaveResult = 'saved' | 'declined' | 'failed'

export async function saveBlob(blob: Blob, filename: string): Promise<SaveResult> {
  const cap = await getDownloads()
  if (cap) {
    try {
      await cap.save({ filename, data: blob })
      return 'saved'
    } catch (e) {
      return (e as { code?: string })?.code === 'declined' ? 'declined' : 'failed'
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
  return 'saved'
}

/** Captura cada slide (já renderizado em 1280×720) como JPEG. */
export async function captureSlides(nodes: HTMLElement[]): Promise<string[]> {
  // Carregada só na hora de exportar, para a página abrir mais rápido.
  const { getFontEmbedCSS, toJpeg } = await import('html-to-image')
  await document.fonts.ready
  const fontEmbedCSS = await getFontEmbedCSS(nodes[0])
  const out: string[] = []
  for (const node of nodes) out.push(await toJpeg(node, { width: SLIDE_W, height: SLIDE_H, pixelRatio: 1.5, quality: 0.92, fontEmbedCSS, cacheBust: false }))
  return out
}

/** Um PDF com uma página por slide. */
export async function slidesToPdf(images: string[]): Promise<Blob> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'landscape', unit: 'px', format: [SLIDE_W, SLIDE_H], hotfixes: ['px_scaling'], compress: true })
  images.forEach((img, i) => {
    if (i) doc.addPage([SLIDE_W, SLIDE_H], 'landscape')
    doc.addImage(img, 'JPEG', 0, 0, SLIDE_W, SLIDE_H)
  })
  return doc.output('blob')
}

/** Uma apresentação do PowerPoint em 16:9, com cada slide como imagem de página inteira. */
export async function slidesToPptx(images: string[], title: string, notes: string[]): Promise<Blob> {
  const { default: PptxGenJS } = await import('pptxgenjs')
  const pptx = new PptxGenJS()
  pptx.layout = 'LAYOUT_16x9'
  pptx.title = title
  pptx.company = 'Prisma Reports'
  images.forEach((data, i) => {
    const slide = pptx.addSlide()
    slide.addImage({ data, x: 0, y: 0, w: '100%', h: '100%', altText: notes[i] })
    if (notes[i]) slide.addNotes(notes[i])
  })
  return (await pptx.write({ outputType: 'blob' })) as Blob
}
