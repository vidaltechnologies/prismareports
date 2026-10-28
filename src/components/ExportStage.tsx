import { useEffect, useRef } from 'react'
import type { Report } from '../lib/report'
import { Slide, type SlideId, type TextEdits } from '../slides/slides'
import type { Theme } from '../themes'

interface Props {
  slides: SlideId[]
  report: Report
  theme: Theme
  edits: TextEdits
  onReady: (nodes: HTMLElement[]) => void
}

/** Renderiza os slides em tamanho real fora da tela, para a captura do PDF. */
export function ExportStage({ slides, report, theme, edits, onReady }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let cancelled = false
    // Dois quadros de animação: o React monta, o Chart.js desenha (sem animação nos slides).
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (cancelled || !ref.current) return
        onReady([...ref.current.querySelectorAll<HTMLElement>('.slide')])
      }),
    )
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div className="export-stage" ref={ref} aria-hidden="true">
      {slides.map((id, i) => (
        <Slide key={id} id={id} report={report} theme={theme} edits={edits} index={i + 1} total={slides.length} />
      ))}
    </div>
  )
}
