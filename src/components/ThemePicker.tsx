import { useEffect, useId, useRef, useState } from 'react'
import { THEMES, type Theme, type ThemeId } from '../themes'

interface Props {
  value: Theme
  onChange: (id: ThemeId) => void
}

function Swatch({ t }: { t: Theme }) {
  return (
    <span className="swatch" aria-hidden="true" style={{ background: t.slide.coverBg }}>
      {t.palette.slice(0, 3).map((c) => (
        <i key={c} style={{ background: c }} />
      ))}
    </span>
  )
}

/** Lista suspensa de temas: cada opção mostra as cores e a fonte do tema. */
export function ThemePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const listId = useId()

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const choose = (i: number) => {
    onChange(THEMES[i].id)
    setOpen(false)
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      setActive(THEMES.findIndex((t) => t.id === value.id))
      setOpen(true)
      return
    }
    if (!open) return
    if (e.key === 'Escape') setOpen(false)
    else if (e.key === 'ArrowDown') setActive((a) => (a + 1) % THEMES.length)
    else if (e.key === 'ArrowUp') setActive((a) => (a - 1 + THEMES.length) % THEMES.length)
    else if (e.key === 'Enter' || e.key === ' ') choose(active)
    else return
    e.preventDefault()
  }

  return (
    <div className="theme-picker" ref={root}>
      <button
        type="button"
        className="theme-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        onClick={() => {
          setActive(THEMES.findIndex((t) => t.id === value.id))
          setOpen((o) => !o)
        }}
        onKeyDown={onKey}
      >
        <Swatch t={value} />
        <span className="theme-btn-label">
          <small>Tema</small>
          {value.name}
        </span>
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <ul className="theme-list" role="listbox" id={listId} aria-label="Temas">
          {THEMES.map((t, i) => (
            <li
              key={t.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={t.id === value.id}
              className={i === active ? 'active' : undefined}
              onMouseEnter={() => setActive(i)}
              onClick={() => choose(i)}
            >
              <Swatch t={t} />
              <span>
                <b style={{ fontFamily: t.display }}>{t.name}</b>
                <small>{t.description}</small>
              </span>
              {t.id === value.id && (
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className="check">
                  <path d="m3.5 8.5 3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
