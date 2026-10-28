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

/** Captura cada slide (já renderizado em 1280×720) e monta um PDF com uma página por slide. */
export async function slidesToPdf(nodes: HTMLElement[]): Promise<Blob> {
  // Carregadas só na hora de exportar, para a página abrir mais rápido.
  const [{ getFontEmbedCSS, toJpeg }, { jsPDF }] = await Promise.all([import('html-to-image'), import('jspdf')])
  await document.fonts.ready
  const fontEmbedCSS = await getFontEmbedCSS(nodes[0])
  const doc = new jsPDF({ orientation: 'landscape', unit: 'px', format: [SLIDE_W, SLIDE_H], hotfixes: ['px_scaling'], compress: true })
  for (let i = 0; i < nodes.length; i++) {
    const img = await toJpeg(nodes[i], { width: SLIDE_W, height: SLIDE_H, pixelRatio: 1.5, quality: 0.92, fontEmbedCSS, cacheBust: false })
    if (i) doc.addPage([SLIDE_W, SLIDE_H], 'landscape')
    doc.addImage(img, 'JPEG', 0, 0, SLIDE_W, SLIDE_H)
  }
  return doc.output('blob')
}
