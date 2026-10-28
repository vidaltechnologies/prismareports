import { useEffect, useRef, useState, type ReactNode } from 'react'

export interface MenuItem<K extends string> {
  id: K
  /** Selo colorido à esquerda (ex.: PDF). */
  badge: string
  title: string
  hint: string
  /** Texto pequeno à direita (ex.: a extensão do arquivo). */
  aside?: string
}

interface Props<K extends string> {
  label: ReactNode
  icon: ReactNode
  primary?: boolean
  disabled?: boolean
  items: MenuItem<K>[]
  onSelect: (id: K) => void
}

/** Botão que abre um menu de ações; usado no download dos slides e nos templates. */
export function MenuButton<K extends string>({ label, icon, primary, disabled, items, onSelect }: Props<K>) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    if (!open) return
    refs.current[0]?.focus()
    const close = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false)
      root.current?.querySelector<HTMLButtonElement>('.menu-btn')?.focus()
    }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const i = refs.current.indexOf(document.activeElement as HTMLButtonElement)
    const n = items.length
    refs.current[(i + (e.key === 'ArrowDown' ? 1 : n - 1)) % n]?.focus()
  }

  return (
    <div className="menu-wrap" ref={root} onKeyDown={onKey}>
      <button type="button" className={`menu-btn${primary ? ' primary' : ''}`} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)} disabled={disabled}>
        {icon}
        {label}
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="menu" role="menu">
          {items.map((it, i) => (
            <button
              key={it.id}
              type="button"
              role="menuitem"
              ref={(el) => {
                refs.current[i] = el
              }}
              onClick={() => {
                setOpen(false)
                onSelect(it.id)
              }}
            >
              <span className={`file-badge ${it.id}`} aria-hidden="true">
                {it.badge}
              </span>
              <span>
                <b>{it.title}</b>
                <small>{it.hint}</small>
              </span>
              {it.aside && <small className="ext">{it.aside}</small>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
