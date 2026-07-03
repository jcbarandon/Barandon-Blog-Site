const path = require('path');
const os = require('os');
const fs = require('fs');
const { execFile } = require('child_process');

const workerPath = path.join(__dirname, 'pdfThumbnailWorker.js');

// pdfThumbnailWorker.js is only ever referenced below via a runtime path
// string (spawned as a subprocess), not require()'d — so Vercel's bundler,
// which decides what to include by tracing require()/import() calls, would
// never see it or its dependencies and would leave them out of the deployed
// function. These resolve() calls exist purely to force that tracing.
require.resolve('@napi-rs/canvas');
require.resolve('pdfjs-dist');
require.resolve('./pdfThumbnailWorker.js');

// Renders a PDF buffer's first page to a PNG buffer. The actual rendering
// happens in a separate process (see pdfThumbnailWorker.js) — pdfjs-dist has
// been observed to throw asynchronously outside its own promise chain on
// some real-world PDFs, which would otherwise crash the whole server.
// Uses os.tmpdir() (writable even in serverless environments like Vercel,
// unlike the rest of the filesystem) since the worker communicates via files.
function generatePdfThumbnail(pdfBuffer) {
  return new Promise((resolve, reject) => {
    const tmpDir = os.tmpdir();
    const tmpId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const tmpPdfPath = path.join(tmpDir, `${tmpId}.pdf`);

    fs.writeFileSync(tmpPdfPath, pdfBuffer);

    execFile(
      process.execPath,
      [workerPath, tmpPdfPath, tmpDir],
      { timeout: 20000 },
      (err, stdout, stderr) => {
        if (err) {
          fs.unlink(tmpPdfPath, () => {});
          return reject(new Error(
            `worker exited code=${err.code} signal=${err.signal}\n` +
            `stderr: ${stderr || '(empty)'}\n` +
            `stdout: ${stdout || '(empty)'}`
          ));
        }

        const thumbPath = path.join(tmpDir, stdout.trim());
        fs.readFile(thumbPath, (readErr, buffer) => {
          fs.unlink(tmpPdfPath, () => {});
          fs.unlink(thumbPath, () => {});

          if (readErr) return reject(readErr);
          resolve(buffer);
        });
      }
    );
  });
}

module.exports = generatePdfThumbnail;
