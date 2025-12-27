PDF.js vendor files

Why: The OCR page (`Polygon/survey-ocr.html`) prefers a local copy of PDF.js at `js/vendor/pdf.min.js` and `js/vendor/pdf.worker.min.js` when CDNs fail or are blocked.

Recommended (npm) — reliable and reproducible:

1. From your project root run:

```bash
npm init -y
npm install pdfjs-dist@4.2.67 --no-audit --no-fund
mkdir -p js/vendor
cp node_modules/pdfjs-dist/build/pdf.min.js js/vendor/
cp node_modules/pdfjs-dist/build/pdf.worker.min.js js/vendor/
```

2. Verify files exist:

```bash
ls -l js/vendor/pdf.min.js js/vendor/pdf.worker.min.js
```

Alternative (curl/wget) — only if the CDN links are correct and reachable:

```bash
mkdir -p js/vendor
curl -L -o js/vendor/pdf.min.js https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.min.js
curl -L -o js/vendor/pdf.worker.min.js https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.js
# or using wget
wget -O js/vendor/pdf.min.js https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.min.js
wget -O js/vendor/pdf.worker.min.js https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.js
```

Notes & troubleshooting
- If you get 404 from the CDN commands, the CDN path or version may not exist or is blocked. Use the npm approach instead (recommended).
- Serve the site over HTTP (not `file://`) when testing; e.g. `python3 -m http.server 8000` from the project root and open `http://localhost:8000/Polygon/survey-ocr.html`.
- After installing local files, reload the OCR page — it will attempt the local `js/vendor/pdf.min.js` first.

If you prefer, I can add a tiny helper script (`scripts/install-pdfjs.sh`) that runs the npm/copy steps — tell me if you want that and I will add it.