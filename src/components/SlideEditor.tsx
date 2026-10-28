import type { Report } from '../lib/report'
import { slideDef, type SlideId, type TextEdit, type TextEdits } from '../slides/slides'
import type { Theme } from '../themes'
import { ScaledSlide } from './ScaledSlide'

export interface DeckItem {
  id: SlideId
  hidden: boolean
}

interface Props {
  report: Report
  theme: Theme
  deck: DeckItem[]
  onDeck: (d: DeckItem[]) => void
  selected: SlideId
  onSelect: (id: SlideId) => void
  edits: TextEdits
  onEdit: (e: TextEdit) => void
  onResetEdits: () => void
}

/** Slides que entram no PDF, na ordem do deck, sem os ocultos e sem os que não se aplicam aos dados. */
export function visibleSlides(deck: DeckItem[], R: Report) {
  return deck.filter((d) => !d.hidden && slideDef(d.id).available(R)).map((d) => d.id)
}

export function SlideEditor({ report, theme, deck, onDeck, selected, onSelect, edits, onEdit, onResetEdits }: Props) {
  const usable = deck.filter((d) => slideDef(d.id).available(report))
  const visible = visibleSlides(deck, report)
  const total = visible.length
  const numberOf = (id: SlideId) => visible.indexOf(id) + 1

  const move = (id: SlideId, dir: -1 | 1) => {
    const list = [...deck]
    const from = list.findIndex((d) => d.id === id)
    // Pula slides que não se aplicam a estes dados, para cada clique mover uma posição visível.
    let to = from + dir
    while (to >= 0 && to < list.length && !slideDef(list[to].id).available(report)) to += dir
    if (to < 0 || to >= list.length) return
    ;[list[from], list[to]] = [list[to], list[from]]
    onDeck(list)
  }
  const toggle = (id: SlideId) => onDeck(deck.map((d) => (d.id === id ? { ...d, hidden: !d.hidden } : d)))

  const current = usable.find((d) => d.id === selected) ?? usable[0]
  const currentNo = current && !current.hidden ? numberOf(current.id) : 0

  return (
    <div className="editor">
      <ol className="thumbs" aria-label="Slides">
        {usable.map((d, i) => (
          <li key={d.id} className={`thumb${d.id === current?.id ? ' selected' : ''}${d.hidden ? ' is-hidden' : ''}`}>
            <button type="button" className="thumb-view" onClick={() => onSelect(d.id)} aria-label={`Ver slide ${slideDef(d.id).name}`} aria-current={d.id === current?.id}>
              <span className="thumb-no">{d.hidden ? '–' : numberOf(d.id)}</span>
              <ScaledSlide id={d.id} report={report} theme={theme} edits={edits} index={d.hidden ? 0 : numberOf(d.id)} total={total} />
            </button>
            <div className="thumb-bar">
              <span className="thumb-name">
                {slideDef(d.id).name}
                {d.hidden && <em>oculto</em>}
              </span>
              <span className="thumb-actions">
                <button type="button" className="icon" onClick={() => move(d.id, -1)} disabled={i === 0} aria-label={`Subir ${slideDef(d.id).name}`} title="Subir">
                  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                    <path d="M3 8.5 7 4.5l4 4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button type="button" className="icon" onClick={() => move(d.id, 1)} disabled={i === usable.length - 1} aria-label={`Descer ${slideDef(d.id).name}`} title="Descer">
                  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                    <path d="M3 5.5 7 9.5l4-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button type="button" className="icon" onClick={() => toggle(d.id)} aria-pressed={d.hidden} aria-label={d.hidden ? `Mostrar ${slideDef(d.id).name}` : `Ocultar ${slideDef(d.id).name}`} title={d.hidden ? 'Mostrar' : 'Ocultar'}>
                  {d.hidden ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                      <path d="M1.5 7S3.5 3 7 3s5.5 4 5.5 4-2 4-5.5 4S1.5 7 1.5 7Z M2 12 12 2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                      <path d="M1.5 7S3.5 3 7 3s5.5 4 5.5 4-2 4-5.5 4S1.5 7 1.5 7Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="7" cy="7" r="1.8" fill="currentColor" />
                    </svg>
                  )}
                </button>
              </span>
            </div>
          </li>
        ))}
      </ol>
      {current && (
        <div className="stage">
          <ScaledSlide id={current.id} report={report} theme={theme} edits={edits} onEdit={onEdit} index={currentNo} total={total} interactive />
          <p className="stage-note">
            {current.hidden
              ? 'Este slide está oculto e não entra no PDF.'
              : `Slide ${currentNo} de ${total}. Clique no título ou nos destaques para editar o texto. Use as setas para mudar a ordem e o olho para ocultar um slide.`}
            {(Object.keys(edits.titles).length > 0 || Object.keys(edits.insights).length > 0) && (
              <button type="button" className="link" onClick={onResetEdits}>
                Restaurar textos automáticos
              </button>
            )}
          </p>
        </div>
      )}
    </div>
  )
}
