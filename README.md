# OCR de fórmules client-side

Web client-side feta amb Vite que utilitza [`pix2text-mfr-web`](https://www.npmjs.com/package/pix2text-mfr-web) com a API pel model [Pix2Text MFR 1.5](https://huggingface.co/breezedeus/pix2text-mfr-1.5) de reconeixement de fórmules (Math Formula Recognition] adaptat per ONNX Runtime for Web.

La gràcia d'utilitzar [`math.ocr.cat`](https://math.ocr.cat) respecte [`tex.ocr.cat`](https://tex.ocr.cat) és que són pràcticament igual de ràpids per fórmules soles i el primer córrer al navegador, de manera que per una banda seguirà funcionant si un dia el meu servidor s'espatlla, per altra banda no gasta RAM ni CPU del meu servidor i per altra un cop el model està carregat pot funcionar sense connexió a internet. Així que recomano si és només per fórmules utilitzar aquest client-side.

## Desenvolupament

Si crees una versió de MFR-1.5 diferent i la guardes a HF o a un CDN ho pots posar com a variable d'entorn.

```sh
VITE_MFR_MODEL_BASE_URL=/pix2text-mfr-1.5
```

Per executar la app en mode desenvolupament

```sh
npm install
npm run dev
```

Per generar la versió en mode producció (per mirar si aniria bé a Vercel)

```sh
npm run build
```

## Llicència
MIT
