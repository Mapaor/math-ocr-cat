import { MfrRecognizer } from 'pix2text-mfr-web'
import wasmMjsUrl from 'onnxruntime-web/ort-wasm-simd-threaded.jsep.mjs?url'
import wasmBinaryUrl from 'onnxruntime-web/ort-wasm-simd-threaded.jsep.wasm?url'

export const MODEL_URL = import.meta.env.VITE_MFR_MODEL_BASE_URL
  || 'https://huggingface.co/breezedeus/pix2text-mfr-1.5/resolve/main'

let recognizerPromise: Promise<MfrRecognizer> | undefined

function loadRecognizer() {
  return MfrRecognizer.load({
    modelBaseUrl: MODEL_URL,
    wasmPaths: { mjs: wasmMjsUrl, wasm: wasmBinaryUrl },
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
