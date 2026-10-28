import { useEffect, useRef, useState } from 'react'
import { t } from '../i18n'

export type ExportFormat = 'pdf' | 'pptx'

interface Props {
  busy: boolean
  disabled: boolean
  onExport: (f: ExportFormat) => void
}

const ITEMS: { id: ExportFormat; ext: string }[] = [
  { id: 'pdf', ext: '.pdf' },
  { id: 'pptx', ext: '.pptx' },
]

/** Botão de download com a escolha do formato: PDF ou PowerPoint. */
export function ExportMenu({ busy, disabled, onExport }: Props) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const items = useRef<(HTMLButtonElement | null)[]>([])
  const T = t()

  useEffect(() => {
    if (!open) return
    items.current[0]?.focus()
    const close = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const choose = (f: ExportFormat) => {
    setOpen(false)
    onExport(f)
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false)
      root.current?.querySelector<HTMLButtonElement>('.export-btn')?.focus()
    }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const i = items.current.indexOf(document.activeElement as HTMLButtonElement)
    const n = items.current.length
    items.current[(i + (e.key === 'ArrowDown' ? 1 : n - 1)) % n]?.focus()
  }

  return (
    <div className="menu-wrap" ref={root} onKeyDown={onKey}>
      <button type="button" className="primary export-btn" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)} disabled={busy || disabled}>
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M8 2v8m0 0 3-3m-3 3L5 7M3 13h10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {busy ? T.generating : T.exportLabel}
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="menu" role="menu" aria-label={T.exportLabel}>
          {ITEMS.map((it, i) => (
            <button
              key={it.id}
              type="button"
              role="menuitem"
              ref={(el) => {
                items.current[i] = el
              }}
              onClick={() => choose(it.id)}
            >
              <span className={`file-badge ${it.id}`} aria-hidden="true">
                {it.id.toUpperCase()}
              </span>
              <span>
                <b>{it.id === 'pdf' ? T.downloadPdf : T.downloadPptx}</b>
                <small>{it.id === 'pdf' ? T.pdfHint : T.pptxHint}</small>
              </span>
              <small className="ext">{it.ext}</small>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
