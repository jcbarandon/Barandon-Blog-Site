const path = require('path');
const { execFile } = require('child_process');

const workerPath = path.join(__dirname, 'pdfThumbnailWorker.js');

// Renders a PDF's first page to a PNG in a separate process. pdfjs-dist has
// been observed to throw asynchronously outside its own promise chain on
// some real-world PDFs (transparency/cancel-path bugs), which would otherwise
// crash the whole server. Running it out-of-process contains any such crash
// to that subprocess — worst case this rejects and the blog just has no
// thumbnail, but the main server and the blog save are never affected.
function generatePdfThumbnail(pdfPath, outputDir) {
  return new Promise((resolve, reject) => {
    execFile(
      process.execPath,
      [workerPath, pdfPath, outputDir],
      { timeout: 20000 },
      (err, stdout, stderr) => {
        if (err) {
          return reject(new Error(
            `worker exited code=${err.code} signal=${err.signal}\n` +
            `stderr: ${stderr || '(empty)'}\n` +
            `stdout: ${stdout || '(empty)'}`
          ));
        }
        resolve(stdout.trim());
      }
    );
  });
}

module.exports = generatePdfThumbnail;
