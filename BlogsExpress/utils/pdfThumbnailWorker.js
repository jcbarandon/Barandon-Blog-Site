// Runs in an isolated child process (spawned by pdfThumbnail.js) so that any
// crash inside pdfjs-dist/canvas rendering can never affect the main server.
const fs = require('fs');
const path = require('path');
// pdfjs-dist's own internal canvas allocations (transparency groups, soft
// masks) are built against @napi-rs/canvas's Canvas/Image classes — pdfjs-dist
// depends on it directly. Using the unrelated `node-canvas` package here
// caused an instanceof mismatch ("Image or Canvas expected") whenever pdf.js
// tried to compose our canvas with one of its own internally-created ones.
const { createCanvas } = require('@napi-rs/canvas');

class NodeCanvasFactory {
  create(width, height) {
    const canvas = createCanvas(width, height);
    return { canvas, context: canvas.getContext('2d') };
  }

  reset(canvasAndContext, width, height) {
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  }

  destroy(canvasAndContext) {
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
    canvasAndContext.canvas = null;
    canvasAndContext.context = null;
  }
}

async function run(pdfPath, outputDir) {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const canvasFactory = new NodeCanvasFactory();

  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const pdfDocument = await pdfjsLib.getDocument({ data, canvasFactory }).promise;
  const page = await pdfDocument.getPage(1);

  const viewport = page.getViewport({ scale: 1.5 });
  const canvasAndContext = canvasFactory.create(viewport.width, viewport.height);

  await page.render({
    canvasContext: canvasAndContext.context,
    viewport,
    canvasFactory
  }).promise;

  const filename = `${path.basename(pdfPath)}-thumb.png`;
  fs.writeFileSync(path.join(outputDir, filename), canvasAndContext.canvas.toBuffer('image/png'));

  return filename;
}

const [, , pdfPath, outputDir] = process.argv;

run(pdfPath, outputDir)
  .then((filename) => {
    process.stdout.write(filename);
    process.exit(0);
  })
  .catch((err) => {
    process.stderr.write(String(err && err.stack ? err.stack : err));
    process.exit(1);
  });

// Belt-and-suspenders: even if pdfjs-dist throws asynchronously outside the
// promise chain above (as it's been observed to do during render cancellation),
// make sure this worker process still exits with a failure code instead of
// hanging or, worse, crashing in a way that leaks past the process boundary.
process.on('uncaughtException', (err) => {
  process.stderr.write(`uncaughtException: ${String(err && err.stack ? err.stack : err)}`);
  process.exit(1);
});
process.on('unhandledRejection', (err) => {
  process.stderr.write(`unhandledRejection: ${String(err && err.stack ? err.stack : err)}`);
  process.exit(1);
});
