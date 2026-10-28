import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { WorkBook } from 'xlsx'
import { Controls } from './components/Controls'
import { Dashboard, uiPalette } from './components/Dashboard'
import { ExportStage } from './components/ExportStage'
import { SlideEditor, visibleSlides, type DeckItem } from './components/SlideEditor'
import { ThemePicker } from './components/ThemePicker'
import { Uploader } from './components/Uploader'
import { saveBlob, slidesToPdf } from './lib/exportPdf'
import { slug, today } from './lib/format'
import { readWorkbook, sheetToDataset, type Dataset } from './lib/parse'
import { buildReport, defaultSettings, type Settings } from './lib/report'
import { sampleDataset } from './lib/sample'
import { SLIDES, type SlideId } from './slides/slides'
import { themeById, type ThemeId } from './themes'

type View = 'painel' | 'slides'

const store = {
  get(k: string) {
    try {
      return localStorage.getItem(k)
    } catch {
      return null
    }
  },
  set(k: string, v: string) {
    try {
      localStorage.setItem(k, v)
    } catch {
      /* armazenamento indisponível: a escolha vale só nesta visita */
    }
  },
}

function useDarkMode() {
  const read = () => {
    const forced = document.documentElement.dataset.theme
    if (forced === 'dark') return true
    if (forced === 'light') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  const [dark, setDark] = useState(read)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const update = () => setDark(read())
    mq.addEventListener('change', update)
    const mo = new MutationObserver(update)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => {
      mq.removeEventListener('change', update)
      mo.disconnect()
    }
  }, [])
  return dark
}

const initialDeck = (): DeckItem[] => SLIDES.map((s) => ({ id: s.id, hidden: false }))

export default function App() {
  const [ds, setDs] = useState<Dataset>(sampleDataset)
  const [settings, setSettings] = useState<Settings>(() => defaultSettings(ds))
  const [workbook, setWorkbook] = useState<WorkBook | null>(null)
  const [sheet, setSheet] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<View>(() => (store.get('prisma.view') === 'slides' ? 'slides' : 'painel'))
  const [themeId, setThemeId] = useState<ThemeId>(() => themeById(store.get('prisma.theme') ?? 'prisma').id)
  const [deck, setDeck] = useState<DeckItem[]>(initialDeck)
  const [selected, setSelected] = useState<SlideId>('capa')
  const [exporting, setExporting] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const dark = useDarkMode()
  const theme = themeById(themeId)

  const report = useMemo(() => buildReport(ds, settings), [ds, settings])

  useEffect(() => store.set('prisma.theme', themeId), [themeId])
  useEffect(() => {
    // O tema escolhido também colore e tipografa a página, não só os slides.
    const ui = uiPalette(theme, dark)
    const s = document.documentElement.style
    s.setProperty('--accent', ui[0])
    s.setProperty('--accent-2', ui[1])
    const n = parseInt(ui[0].slice(1), 16)
    const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255
    s.setProperty('--accent-ink', lum > 0.55 ? '#10151a' : '#ffffff')
    s.setProperty('--display', theme.display)
    s.setProperty('--body', theme.body)
  }, [theme, dark])
  useEffect(() => store.set('prisma.view', view), [view])
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2800)
    return () => clearTimeout(t)
  }, [toast])

  const loadData = useCallback((next: Dataset) => {
    setDs(next)
    setSettings(defaultSettings(next))
  }, [])

  const onFile = useCallback(
    async (file: File) => {
      setError(null)
      try {
        const wb = await readWorkbook(file)
        const next = sheetToDataset(wb, 0, file.name)
        if (!next.rows.length) throw new Error('vazio')
        setWorkbook(wb)
        setSheet(0)
        loadData(next)
        setToast(`${next.rows.length} linhas lidas de ${file.name}`)
      } catch (e) {
        console.error(e)
        setError('Não foi possível ler este arquivo. Confira se é um .xlsx, .xls ou .csv com cabeçalho na primeira linha.')
      }
    },
    [loadData],
  )

  const onSheet = (i: number) => {
    if (!workbook) return
    const next = sheetToDataset(workbook, i, ds.fileName)
    if (!next.rows.length) {
      setError('Esta aba está vazia.')
      return
    }
    setSheet(i)
    loadData(next)
  }

  const exportSlides = visibleSlides(deck, report)

  const onStageReady = useCallback(
    async (nodes: HTMLElement[]) => {
      try {
        const blob = await slidesToPdf(nodes)
        const result = await saveBlob(blob, `${slug(settings.title)}.pdf`)
        setToast(result === 'saved' ? 'PDF gerado' : result === 'declined' ? 'Download cancelado' : 'Não foi possível salvar o PDF aqui')
      } catch (e) {
        console.error(e)
        setToast('Erro ao gerar o PDF')
      } finally {
        setExporting(false)
      }
    },
    [settings.title],
  )

  return (
    <>
      <header className="bar">
        <div className="wrap bar-row">
          <div className="brand">
            <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
              <path d="M13 2 24 22H2Z" fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinejoin="round" />
              <path d="M13 9v13" stroke="var(--accent-2)" strokeWidth="2.2" />
            </svg>
            Prisma Reports
          </div>
          <div className="file-meta">
            {ds.fileName} · {ds.rows.length} linhas · {ds.columns.length} colunas
          </div>
          <div className="actions">
            <ThemePicker value={theme} onChange={setThemeId} />
            <button type="button" onClick={() => fileInput.current?.click()}>
              Abrir planilha
            </button>
            <button type="button" className="primary" onClick={() => setExporting(true)} disabled={exporting || !exportSlides.length}>
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M8 2v8m0 0 3-3m-3 3L5 7M3 13h10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {exporting ? 'Gerando…' : 'Baixar slides (PDF)'}
            </button>
          </div>
        </div>
      </header>

      <div className="wrap">
        <main>
          <Uploader sample={ds.sample} error={error} onFile={onFile} inputRef={fileInput} />
          <Controls ds={ds} settings={settings} sheets={workbook?.SheetNames ?? []} sheet={sheet} onSheet={onSheet} onChange={setSettings} />

          <section className="report-head">
            <div>
              <h1 className="report-title">{settings.title.trim() || 'Relatório'}</h1>
              <p className="report-sub">
                {ds.fileName} · {ds.rows.length} linhas · gerado em {today()}
              </p>
            </div>
            <div className="tabs" role="tablist" aria-label="Visualização">
              <button type="button" role="tab" aria-selected={view === 'painel'} onClick={() => setView('painel')}>
                Painel
              </button>
              <button type="button" role="tab" aria-selected={view === 'slides'} onClick={() => setView('slides')}>
                Slides <span className="count">{exportSlides.length}</span>
              </button>
            </div>
          </section>

          {view === 'painel' ? (
            <Dashboard ds={ds} report={report} theme={theme} dark={dark} />
          ) : (
            <SlideEditor report={report} theme={theme} deck={deck} onDeck={setDeck} selected={selected} onSelect={setSelected} />
          )}
        </main>
      </div>

      {exporting && <ExportStage slides={exportSlides} report={report} theme={theme} onReady={onStageReady} />}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </>
  )
}
