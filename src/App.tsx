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
  const [copied, setCopied] = useState(false)

  const recognizeFile = useCallback(async (nextFile: File) => {
    setStatus('loading')
    setMessage('')
    setCopied(false)
    try {
      setStatus('recognizing')
      const text = await recognizeFormula(nextFile)
      setLatex(text)
      setStatus('done')
      setMessage('')
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
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
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

        {message && <p className="status error" role="alert">{message}</p>}

        {file && (
          <section className="result-card">
            <div className="result-header">
              <span>Resultat</span>
              <button
                className={`copy-button${copied ? ' copied' : ''}`}
                onClick={copyResult}
                disabled={!latex}
                aria-label={copied ? 'LaTeX copiat' : 'Copia el LaTeX'}
                title={copied ? 'Copiat' : 'Copia el LaTeX'}
              >
                {copied ? (
                  <svg aria-hidden="true" viewBox="0 0 16 16">
                    <path d="m2.75 8.75 3.5 3.5 7-7.5" />
                  </svg>
                ) : (
                  <svg aria-hidden="true" viewBox="0 0 48 48">
                    <path d="M13 12.432v-4.62A2.813 2.813 0 0 1 15.813 5h24.374A2.813 2.813 0 0 1 43 7.813v24.375A2.813 2.813 0 0 1 40.187 35h-4.67" />
                    <path d="M32.188 13H7.811A2.813 2.813 0 0 0 5 15.813v24.374A2.813 2.813 0 0 0 7.813 43h24.375A2.813 2.813 0 0 0 35 40.187V15.814A2.813 2.813 0 0 0 32.187 13Z" />
                  </svg>
                )}
              </button>
            </div>
            {(status === 'loading' || status === 'recognizing') && (
              <div className="processing-state" role="status" aria-live="polite">
                <div className="progress-track"><div className="progress-bar" /></div>
                <span className="processing-label">
                  <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /></svg>
                  Processant
                </span>
              </div>
            )}
            <textarea
              value={latex}
              readOnly
              spellCheck={false}
              placeholder="El LaTeX apareixerà aquí..."
              aria-label="Resultat LaTeX"
            />
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
