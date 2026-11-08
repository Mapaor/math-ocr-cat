import { MfrRecognizer } from 'pix2text-mfr-web'

export const MODEL_URL = import.meta.env.VITE_MFR_MODEL_BASE_URL
  || 'https://huggingface.co/breezedeus/pix2text-mfr-1.5/resolve/main'

let recognizerPromise: Promise<MfrRecognizer> | undefined

function loadRecognizer() {
  return MfrRecognizer.load({
    modelBaseUrl: MODEL_URL,
  })
}

export async function recognizeFormula(image: Blob): Promise<string> {
  recognizerPromise ??= loadRecognizer()
  try {
    const recognizer = await recognizerPromise
    const result = await recognizer.recognize(image)
    return result.text
  } catch (error) {
    recognizerPromise = undefined
    throw error
  }
}
