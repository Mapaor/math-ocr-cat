import { useCallback, useEffect, useRef, useState } from 'react'
import { recognizeFormula } from './lib/mfr'

type Status = 'idle' | 'loading' | 'recognizing' | 'done' | 'error'

export default function App() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [latex, setLatex] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  const recognizeFile = useCallback(async (nextFile: File) => {
    setStatus('loading')
    setMessage('Carregant el model de reconeixement…')
    try {
      setStatus('recognizing')
      setMessage('Reconeixent la fórmula…')
      const text = await recognizeFormula(nextFile)
      setLatex(text)
      setStatus('done')
      setMessage(text ? 'Fórmula reconeguda.' : 'No s’ha detectat cap fórmula.')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'S’ha produït un error durant el reconeixement.')
    }
  }, [])

  const useFile = useCallback((nextFile?: File) => {
    if (!nextFile || !nextFile.type.startsWith('image/')) return
    setFile(nextFile)
    setLatex('')
    setPreview(URL.createObjectURL(nextFile))
    void recognizeFile(nextFile)
  }, [recognizeFile])

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const pasted = Array.from(event.clipboardData?.items ?? []).find((item) => item.type.startsWith('image/'))
      const image = pasted?.getAsFile()
      if (image) useFile(image)
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [useFile])

  const copyResult = async () => {
    await navigator.clipboard.writeText(latex)
    setMessage('La fórmula s’ha copiat al porta-retalls.')
  }

  const clear = () => {
    setFile(null)
    setPreview('')
    setLatex('')
    setStatus('idle')
    setMessage('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <main className="page">
      <div className="content">
        <header className="page-heading">
          <h2>Alternativa a MathPix</h2>
          <p>OCR per fórmules matemàtiques directament al navegador.</p>
        </header>

        <section
          className={`drop-area${file ? ' has-file' : ''}`}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => { event.preventDefault(); useFile(event.dataTransfer.files[0]) }}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click() }}
          aria-label="Selecciona o deixa anar una imatge"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple={false}
            hidden
            onChange={(event) => useFile(event.target.files?.[0])}
          />
          {preview ? (
            <div className="preview-wrap">
              <img src={preview} alt="Imatge amb la fórmula" />
              <span className="filename">{file?.name}</span>
            </div>
          ) : (
            <div className="drop-copy">
              <svg className="upload-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M13 3v9.586l3.5-3.5 1.414 1.414L12 16.414 6.086 10.5 7.5 9.086l3.5 3.5V3H13ZM4.5 14v5h15v-5h2v7h-19v-7h2Z" />
              </svg>
              <span>Arrossega o enganxa una imatge, o clica per seleccionar fitxers</span>
              <small>(Admet arrossegar, Ctrl+V o selecció d’imatges)</small>
            </div>
          )}
        </section>

        {file && (
          <div className="actions">
            <button className="quiet" onClick={clear}>Esborra</button>
          </div>
        )}

        {message && <p className={`status ${status === 'error' ? 'error' : ''}`} role="status">{message}</p>}

        {status === 'done' && (
          <section className="result" aria-live="polite">
            <div className="result-heading"><h2>Resultat LaTeX</h2><button className="quiet" onClick={copyResult}>{message.includes('copiat') ? 'Copiat!' : 'Copia'}</button></div>
            <textarea value={latex} onChange={(event) => setLatex(event.target.value)} aria-label="Resultat LaTeX" />
          </section>
        )}

        <footer>
          <h2>Codi font</h2>
          <p>GitHub: <a href="https://github.com/Mapaor/math-ocr-cat" target="_blank" rel="noreferrer">math-ocr-cat</a></p>
          <p className="note">Nota: per fórmules matemàtiques enmig de paràgrafs utilitza <a href="https://tex.ocr.cat" target="_blank" rel="noreferrer">tex.ocr.cat</a>.</p>
        </footer>
      </div>
    </main>
  )
}
