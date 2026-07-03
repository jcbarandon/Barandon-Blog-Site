// Uploads the selected file straight from the browser to Cloudinary
// (bypassing our server entirely), then submits the rest of the form as a
// small text-only request. This avoids Vercel's ~4.5MB serverless function
// body limit, which a normal multipart file upload through our server would
// hit for anything but small images.
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form[data-cloud-name]');
  if (!form) return;

  const cloudName = form.dataset.cloudName;
  const uploadPreset = form.dataset.uploadPreset;
  const fileInput = form.querySelector('input[type="file"]');
  const submitBtn = form.querySelector('button');
  const originalBtnText = submitBtn.textContent;

  const setStatus = (text) => { submitBtn.textContent = text; };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;

    try {
      let image = '';
      let fileType = '';
      let thumbnail = '';

      const file = fileInput && fileInput.files[0];
      if (file) {
        setStatus('Uploading file...');

        const cloudForm = new FormData();
        cloudForm.append('file', file);
        cloudForm.append('upload_preset', uploadPreset);

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: cloudForm
        });
        const data = await uploadRes.json();

        if (!uploadRes.ok) {
          throw new Error((data.error && data.error.message) || 'Upload failed');
        }

        image = data.secure_url;
        fileType = data.format === 'pdf' ? 'pdf' : 'image';

        // Cloudinary can render any page of a PDF as an image on the fly —
        // pg_1 selects the first page, f_jpg picks the output format.
        if (fileType === 'pdf') {
          thumbnail = image.replace('/upload/', '/upload/pg_1,f_jpg/');
        }
      }

      setStatus('Saving post...');

      const params = new URLSearchParams();
      for (const [key, value] of new FormData(form).entries()) {
        if (key === 'image') continue; // this was the raw <input type="file">
        params.append(key, value);
      }
      if (image) {
        params.append('image', image);
        params.append('fileType', fileType);
        params.append('thumbnail', thumbnail);
      }

      const saveRes = await fetch(form.action, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
      });

      window.location.href = saveRes.url || '/blogs';
    } catch (err) {
      alert('Something went wrong: ' + err.message);
      submitBtn.disabled = false;
      setStatus(originalBtnText);
    }
  });
});
