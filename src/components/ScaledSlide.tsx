import { useLayoutEffect, useRef, useState } from 'react'
import { Slide, SLIDE_H, SLIDE_W, type SlideId, type SlideProps } from '../slides/slides'

/** Mostra um slide de 1280×720 encolhido para a largura disponível, mantendo 16:9. */
export function ScaledSlide({ interactive, ...props }: SlideProps & { id: SlideId; interactive?: boolean }) {
  const box = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.25)
  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const update = () => setScale(el.clientWidth / SLIDE_W)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <div className="scaled" ref={box} style={{ aspectRatio: `${SLIDE_W} / ${SLIDE_H}` }}>
      <div className={`scaled-inner${interactive ? ' interactive' : ''}`} style={{ transform: `scale(${scale})` }}>
        <Slide {...props} />
      </div>
    </div>
  )
}
