import { useEffect, useState } from 'react'

interface Props {
  sample: boolean
  error: string | null
  onFile: (f: File) => void
  inputRef: React.RefObject<HTMLInputElement | null>
}

export function Uploader({ sample, error, onFile, inputRef }: Props) {
  const [over, setOver] = useState(false)

  // Soltar o arquivo em qualquer lugar da página também funciona.
  useEffect(() => {
    const prevent = (e: DragEvent) => e.preventDefault()
    const drop = (e: DragEvent) => {
      e.preventDefault()
      const f = e.dataTransfer?.files[0]
      if (f) onFile(f)
    }
    window.addEventListener('dragover', prevent)
    window.addEventListener('drop', drop)
    return () => {
      window.removeEventListener('dragover', prevent)
      window.removeEventListener('drop', drop)
    }
  }, [onFile])

  return (
    <div
      className={`drop${over ? ' over' : ''}`}
      tabIndex={0}
      role="button"
      aria-label="Enviar arquivo Excel ou CSV"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          inputRef.current?.click()
        }
      }}
      onDragEnter={() => setOver(true)}
      onDragOver={() => setOver(true)}
      onDragLeave={() => setOver(false)}
      onDrop={() => setOver(false)}
    >
      <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
        <rect x="5" y="3" width="24" height="28" rx="3" fill="none" stroke="var(--accent)" strokeWidth="2" />
        <path d="M11 12h12M11 17h12M11 22h7" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <div className="txt">
        <strong>Arraste um arquivo .xlsx, .xls ou .csv aqui</strong>
        <p>Os dados são lidos no seu navegador e não saem do seu computador. A primeira linha deve conter os nomes das colunas.</p>
        {sample && <div className="sample-note">Mostrando dados de exemplo (vendas fictícias). Envie sua planilha para substituir.</div>}
        {error && <div className="error">{error}</div>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.xlsm,.csv,.tsv,.txt"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFile(f)
          e.target.value = ''
        }}
      />
    </div>
  )
}
