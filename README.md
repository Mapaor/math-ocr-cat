# OCR de fórmules

Una aplicació Vite + TypeScript per reconèixer fórmules matemàtiques en imatges des del navegador. La interfície segueix l’estil senzill d’[OCR en Català](https://ocr.cat/) i l’estructura de codi de [Mapaor/ocr-en-catala](https://github.com/Mapaor/ocr-en-catala).

La inferència segueix l’API del paquet [`pix2text-mfr-web`](https://www.npmjs.com/package/pix2text-mfr-web): `MfrRecognizer.load({ modelBaseUrl })` i `recognizer.recognize(imageBlob)`. Per defecte, el paquet baixa el model [Pix2Text MFR 1.5](https://huggingface.co/breezedeus/pix2text-mfr-1.5) directament de Hugging Face durant la primera càrrega i el guarda a la memòria cau del navegador.

Per baixar els fitxers del model al projecte i servir-los localment:

```sh
hf download breezedeus/pix2text-mfr-1.5 --local-dir public/pix2text-mfr-1.5
```

Crea `.env.local` amb:

```sh
VITE_MFR_MODEL_BASE_URL=/pix2text-mfr-1.5
```

La inferència s’executa al navegador. La primera càrrega pot trigar una mica.

## Desenvolupament

```sh
npm install
npm run dev
```

Per generar la versió de producció:

```sh
npm run build
```

Admet imatges seleccionades, arrossegades a la zona de càrrega o enganxades des del porta-retalls. El resultat es pot editar i copiar com a LaTeX.
