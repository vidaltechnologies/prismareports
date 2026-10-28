import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { WorkBook } from 'xlsx'
import { Controls } from './components/Controls'
import { Dashboard, uiPalette } from './components/Dashboard'
import { ExportMenu, type ExportFormat } from './components/ExportMenu'
import { ExportStage } from './components/ExportStage'
import { FiltersBar } from './components/FiltersBar'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import { SlideEditor, visibleSlides, type DeckItem } from './components/SlideEditor'
import { ThemePicker } from './components/ThemePicker'
import { Uploader } from './components/Uploader'
import { getLocale, LOCALES, setLocale, t, type Locale } from './i18n'
import { captureSlides, saveBlob, slidesToPdf, slidesToPptx } from './lib/exportSlides'
import { int, slug, today } from './lib/format'
import { readWorkbook, sheetToDataset, type Dataset } from './lib/parse'
import { applyFilters, autoTitle, buildReport, defaultSettings, NO_FILTERS, type Filters, type Settings } from './lib/report'
import { sampleDataset } from './lib/sample'
import { SLIDES, type SlideId, type TextEdit, type TextEdits } from './slides/slides'
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

function initialLocale(): Locale {
  const saved = store.get('prisma.lang') as Locale | null
  if (saved && LOCALES.includes(saved)) return saved
  const nav = (navigator.language || 'pt').slice(0, 2)
  return nav === 'en' || nav === 'es' ? nav : 'pt'
}
setLocale(initialLocale())

const initialDeck = (): DeckItem[] => SLIDES.map((s) => ({ id: s.id, hidden: false }))
const NO_EDITS: TextEdits = { titles: {}, insights: {} }

export default function App() {
  const [lang, setLang] = useState<Locale>(getLocale)
  const [ds, setDs] = useState<Dataset>(sampleDataset)
  const [settings, setSettings] = useState<Settings>(() => defaultSettings(ds))
  const [workbook, setWorkbook] = useState<WorkBook | null>(null)
  const [sheet, setSheet] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<View>(() => (store.get('prisma.view') === 'slides' ? 'slides' : 'painel'))
  const [themeId, setThemeId] = useState<ThemeId>(() => themeById(store.get('prisma.theme') ?? 'prisma').id)
  const [deck, setDeck] = useState<DeckItem[]>(initialDeck)
  const [selected, setSelected] = useState<SlideId>('capa')
  const [exporting, setExporting] = useState<ExportFormat | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>(NO_FILTERS)
  const [edits, setEdits] = useState<TextEdits>(NO_EDITS)
  const fileInput = useRef<HTMLInputElement>(null)
  const dark = useDarkMode()
  const theme = themeById(themeId)

  // `lang` entra nas dependências porque os textos e números do relatório mudam com o idioma.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const baseReport = useMemo(() => buildReport(ds, settings, filters), [ds, settings, filters, lang])
  // Destaques reescritos na prévia valem também para o painel e o PDF.
  const report = useMemo(
    () => ({ ...baseReport, insights: baseReport.insights.map((ins, i) => (edits.insights[i] ? { text: edits.insights[i] } : ins)) }),
    [baseReport, edits.insights],
  )
  const filteredDs = useMemo(() => ({ ...ds, rows: applyFilters(ds, settings, filters).rows }), [ds, settings, filters])

  // Os destaques automáticos mudam com a análise; um texto editado para outra análise ficaria errado.
  const analysisKey = JSON.stringify([settings.cat, settings.val, settings.agg, settings.date, filters])
  const lastKey = useRef(analysisKey)
  useEffect(() => {
    if (lastKey.current === analysisKey) return
    lastKey.current = analysisKey
    setEdits((e) => (Object.keys(e.insights).length ? { ...e, insights: {} } : e))
  }, [analysisKey])

  const onEdit = useCallback((e: TextEdit) => {
    if (e.kind === 'title' && e.slide === 'capa') {
      setSettings((s) => ({ ...s, title: e.text || s.title }))
      return
    }
    setEdits((prev) => {
      if (e.kind === 'title') {
        const titles = { ...prev.titles }
        if (e.text) titles[e.slide] = e.text
        else delete titles[e.slide]
        return { ...prev, titles }
      }
      const insights = { ...prev.insights }
      if (e.text) insights[e.index] = e.text
      else delete insights[e.index]
      return { ...prev, insights }
    })
  }, [])

  const changeLang = (l: Locale) => {
    // Um título que ainda é o automático acompanha o idioma; um título escrito pela pessoa fica como está.
    const wasAuto = settings.title === autoTitle(ds)
    setLocale(l)
    setLang(l)
    if (wasAuto) setSettings((s) => ({ ...s, title: autoTitle(ds) }))
  }
  useEffect(() => {
    store.set('prisma.lang', lang)
    document.documentElement.lang = t().numberLocale
  }, [lang])

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
    const id = setTimeout(() => setToast(null), 2800)
    return () => clearTimeout(id)
  }, [toast])

  const loadData = useCallback((next: Dataset) => {
    setDs(next)
    setSettings(defaultSettings(next))
    setFilters(NO_FILTERS)
    setEdits(NO_EDITS)
  }, [])

  const onFile = useCallback(
    async (file: File) => {
      setError(null)
      try {
        const wb = await readWorkbook(file)
        const next = sheetToDataset(wb, 0, file.name)
        if (!next.rows.length) throw new Error('empty')
        setWorkbook(wb)
        setSheet(0)
        loadData(next)
        setToast(t().rowsRead(next.rows.length, file.name))
      } catch (e) {
        console.error(e)
        setError(t().readError)
      }
    },
    [loadData],
  )

  const onSheet = (i: number) => {
    if (!workbook) return
    const next = sheetToDataset(workbook, i, ds.fileName)
    if (!next.rows.length) {
      setError(t().emptySheet)
      return
    }
    setSheet(i)
    loadData(next)
  }

  const exportSlides = visibleSlides(deck, report)

  const onStageReady = useCallback(
    async (nodes: HTMLElement[]) => {
      const format = exporting ?? 'pdf'
      const T = t()
      try {
        const images = await captureSlides(nodes)
        // Os títulos viram as anotações de cada slide no PowerPoint (e o texto alternativo da imagem).
        const notes = nodes.map((n) => n.querySelector('.s-title, .cover-title')?.textContent?.trim() ?? '')
        const blob = format === 'pptx' ? await slidesToPptx(images, settings.title, notes) : await slidesToPdf(images)
        const result = await saveBlob(blob, `${slug(settings.title)}.${format}`)
        const label = format === 'pptx' ? 'PowerPoint' : 'PDF'
        setToast(result === 'saved' ? T.saved(label) : result === 'declined' ? T.declined : T.saveFailed)
      } catch (e) {
        console.error(e)
        setToast(T.exportError)
      } finally {
        setExporting(null)
      }
    },
    [settings.title, exporting],
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
            {ds.fileName} · {t().meta(ds.rows.length, ds.columns.length)}
          </div>
          <div className="actions">
            <ThemePicker value={theme} onChange={setThemeId} />
            <button type="button" onClick={() => fileInput.current?.click()}>
              {t().openFile}
            </button>
            <ExportMenu busy={!!exporting} disabled={!exportSlides.length} onExport={setExporting} />
          </div>
          <LanguageSwitcher value={lang} onChange={changeLang} />
        </div>
      </header>

      <div className="wrap">
        <main>
          <Uploader sample={ds.sample} error={error} onFile={onFile} inputRef={fileInput} />
          <Controls ds={ds} settings={settings} sheets={workbook?.SheetNames ?? []} sheet={sheet} onSheet={onSheet} onChange={setSettings} />
          <FiltersBar ds={ds} settings={settings} filters={filters} shown={report.rowCount} onChange={setFilters} />

          <section className="report-head">
            <div>
              <h1 className="report-title">{settings.title.trim() || t().fallbackTitle}</h1>
              <p className="report-sub">
                {ds.fileName} · {report.rowCount === ds.rows.length ? t().rowsLabel(int(ds.rows.length)) : t().rowsOf(int(report.rowCount), int(ds.rows.length))}
                {report.filterLabel && ` (${report.filterLabel})`} · {t().generatedOn(today())}
              </p>
            </div>
            <div className="tabs" role="tablist" aria-label={t().viewAria}>
              <button type="button" role="tab" aria-selected={view === 'painel'} onClick={() => setView('painel')}>
                {t().dashboardTab}
              </button>
              <button type="button" role="tab" aria-selected={view === 'slides'} onClick={() => setView('slides')}>
                {t().slidesTab} <span className="count">{exportSlides.length}</span>
              </button>
            </div>
          </section>

          {view === 'painel' ? (
            <Dashboard ds={filteredDs} report={report} theme={theme} dark={dark} />
          ) : (
            <SlideEditor report={report} theme={theme} deck={deck} onDeck={setDeck} selected={selected} onSelect={setSelected} edits={edits} onEdit={onEdit} onResetEdits={() => setEdits(NO_EDITS)} />
          )}
        </main>
      </div>

      {exporting && <ExportStage slides={exportSlides} report={report} theme={theme} edits={edits} onReady={onStageReady} />}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </>
  )
}
