import type { Theme } from './themes'

/**
 * O símbolo do Prisma Reports: um feixe de luz entra no prisma e sai em três raios.
 * Coordenadas no espaço 0–64 do favicon; a capa dos slides e o PowerPoint desenham o mesmo traçado.
 */
type Pt = [number, number]
export interface LogoLine {
  from: Pt
  to: Pt
  width: number
  /** Qual cor da capa usar: o feixe, um dos três raios ou o prisma. */
  role: 'beam' | 'beamInside' | 0 | 1 | 2
}

export const LOGO_LINES: LogoLine[] = [
  { from: [3, 37], to: [18, 31], width: 3.2, role: 'beam' },
  { from: [18, 31], to: [33, 28], width: 2.6, role: 'beamInside' },
  { from: [33, 28], to: [60, 15], width: 3.6, role: 0 },
  { from: [33, 28], to: [61, 29], width: 3.6, role: 1 },
  { from: [33, 28], to: [59, 43], width: 3.6, role: 2 },
]
export const LOGO_PRISM = { points: [[26, 13], [43, 47], [9, 47]] as Pt[], width: 4 }
/** Área ocupada pelo desenho (x, y, largura, altura), sem as sobras do quadrado 64×64. */
export const LOGO_BOX = { x: 0, y: 8, w: 64, h: 44 }

/** Cores do símbolo na capa de cada tema: o prisma e os raios seguem a paleta, o feixe é a cor do texto. */
export function coverLogoColors(t: Theme) {
  const s = t.slide
  return { beam: s.coverFg, prism: s.coverShape, rays: [s.coverShape, s.coverShape2, t.palette[3]] }
}
