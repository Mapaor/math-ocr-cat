import { useCallback, useEffect, useRef, useState } from 'react'
import { MODEL_URL, recognizeFormula } from './lib/mfr'

type Status = 'idle' | 'loading' | 'recognizing' | 'done' | 'error'

export default function App() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [latex, setLatex] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  const useFile = useCallback((nextFile?: File) => {
    if (!nextFile || !nextFile.type.startsWith('image/')) return
    setFile(nextFile)
    setLatex('')
    setMessage('')
    setStatus('idle')
    setPreview(URL.createObjectURL(nextFile))
  }, [])

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

  const runRecognition = async () => {
    if (!file) return
    setStatus('loading')
    setMessage('Carregant el model de reconeixement…')
    try {
      setStatus('recognizing')
      setMessage('Reconeixent la fórmula…')
      const text = await recognizeFormula(file)
      setLatex(text)
      setStatus('done')
      setMessage(text ? 'Fórmula reconeguda.' : 'No s’ha detectat cap fórmula.')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'S’ha produït un error durant el reconeixement.')
    }
  }

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
      <div className="language-row">
        <label htmlFor="language">Idioma</label>
        <select id="language" value="ca" onChange={() => {}} aria-label="Idioma">
          <option value="ca">Català</option>
        </select>
      </div>

      <section
        className={`drop-area${file ? ' has-file' : ''}`}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => { event.preventDefault(); useFile(event.dataTransfer.files[0]) }}
        onClick={() => !file && inputRef.current?.click()}
        role={file ? undefined : 'button'}
        tabIndex={file ? undefined : 0}
        onKeyDown={(event) => { if (!file && (event.key === 'Enter' || event.key === ' ')) inputRef.current?.click() }}
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
            <span>Arrossega o enganxa una imatge, o clica per seleccionar fitxers</span>
            <small>(Admet arrossegar, Ctrl+V o selecció d’imatges)</small>
          </div>
        )}
      </section>

      {file && (
        <div className="actions">
          <button className="primary" onClick={runRecognition} disabled={status === 'loading' || status === 'recognizing'}>
            {status === 'loading' || status === 'recognizing' ? 'Reconeixent…' : 'Reconeix la fórmula'}
          </button>
          <button className="quiet" onClick={clear}>Esborra</button>
        </div>
      )}

      {message && <p className={`status ${status === 'error' ? 'error' : ''}`} role="status">{message}</p>}

      {status === 'done' && (
        <section className="result" aria-live="polite">
          <div className="result-heading"><h2>Resultat LaTeX</h2><button className="quiet" onClick={copyResult}>Copia</button></div>
          <textarea value={latex} onChange={(event) => setLatex(event.target.value)} aria-label="Resultat LaTeX" />
        </section>
      )}

      <footer>
        <p><a href="https://github.com/Mapaor/math-ocr-cat" target="_blank" rel="noreferrer">Codi font</a></p>
        <p>El model s’executa al navegador. La primera càrrega pot trigar una mica.</p>
        <p className="source">Motor: <a href="https://www.npmjs.com/package/pix2text-mfr-web" target="_blank" rel="noreferrer">pix2text-mfr-web a npm</a></p>
        <p className="source">Model: <a href={MODEL_URL} target="_blank" rel="noreferrer">Pix2Text MFR 1.5 a Hugging Face</a></p>
      </footer>
    </main>
  )
}
