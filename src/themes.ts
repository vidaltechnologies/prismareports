import '@fontsource/bricolage-grotesque/500.css'
import '@fontsource/bricolage-grotesque/700.css'
import '@fontsource/ibm-plex-sans/400.css'
import '@fontsource/ibm-plex-sans/600.css'
import '@fontsource/fraunces/500.css'
import '@fontsource/fraunces/700.css'
import '@fontsource/source-sans-3/400.css'
import '@fontsource/source-sans-3/600.css'
import '@fontsource/outfit/500.css'
import '@fontsource/outfit/700.css'
import '@fontsource/manrope/400.css'
import '@fontsource/manrope/600.css'

export type ThemeId = 'prisma' | 'executivo' | 'vibrante'

export interface Theme {
  id: ThemeId
  name: string
  description: string
  display: string
  body: string
  /** Seis cores para séries e categorias, na ordem de uso. */
  palette: string[]
  slide: {
    bg: string
    fg: string
    muted: string
    card: string
    line: string
    track: string
    accent: string
    coverBg: string
    coverFg: string
    coverMuted: string
    coverShape: string
    coverShape2: string
  }
}

export const THEMES: Theme[] = [
  {
    id: 'prisma',
    name: 'Prisma',
    description: 'Verde-petróleo e âmbar, títulos geométricos',
    display: '"Bricolage Grotesque", "Segoe UI", system-ui, sans-serif',
    body: '"IBM Plex Sans", "Segoe UI", system-ui, sans-serif',
    palette: ['#0f7b6c', '#d9822b', '#3d5a99', '#c2456b', '#7a8b2e', '#6b7c86'],
    slide: {
      bg: '#ffffff',
      fg: '#16211e',
      muted: '#5d6b66',
      card: '#f3f5f2',
      line: '#dbe2de',
      track: '#e4ebe7',
      accent: '#0f7b6c',
      coverBg: '#16211e',
      coverFg: '#ffffff',
      coverMuted: '#b9c7c2',
      coverShape: '#0f7b6c',
      coverShape2: '#d9822b',
    },
  },
  {
    id: 'executivo',
    name: 'Executivo',
    description: 'Azul-marinho e dourado, títulos com serifa',
    display: '"Fraunces", Georgia, "Times New Roman", serif',
    body: '"Source Sans 3", "Segoe UI", system-ui, sans-serif',
    palette: ['#1f3a5f', '#b8892b', '#5b7db1', '#a4493d', '#6e8b74', '#8a8f98'],
    slide: {
      bg: '#ffffff',
      fg: '#14243b',
      muted: '#5f6b7a',
      card: '#f2f4f7',
      line: '#d9dee6',
      track: '#e3e8ef',
      accent: '#1f3a5f',
      coverBg: '#14243b',
      coverFg: '#ffffff',
      coverMuted: '#b4c0d0',
      coverShape: '#b8892b',
      coverShape2: '#5b7db1',
    },
  },
  {
    id: 'vibrante',
    name: 'Vibrante',
    description: 'Fundo escuro com cores vivas, títulos arredondados',
    display: '"Outfit", "Segoe UI", system-ui, sans-serif',
    body: '"Manrope", "Segoe UI", system-ui, sans-serif',
    palette: ['#ff6b5b', '#3cc8e0', '#b8e04a', '#9b7bff', '#ffc845', '#ff5fa2'],
    slide: {
      bg: '#11151a',
      fg: '#f2f4f7',
      muted: '#9aa4b1',
      card: '#1b2129',
      line: '#2b333d',
      track: '#262e38',
      accent: '#ff6b5b',
      coverBg: '#ff6b5b',
      coverFg: '#11151a',
      coverMuted: '#3a1d19',
      coverShape: '#11151a',
      coverShape2: '#ffc845',
    },
  },
]

export const themeById = (id: string) => THEMES.find((t) => t.id === id) ?? THEMES[0]
