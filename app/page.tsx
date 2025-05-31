'use client';

import { useState } from 'react';

export default function UploadForm() {
  const [uploadMessage, setUploadMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fileInput = document.getElementById('image') as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (!file) {
      setUploadMessage('Please select an image file.');
      return;
    }

    setUploadMessage('Uploading...');

    try {
      const signatureRes = await fetch('/api/upload-signature');
      const { signature, timestamp } = await signatureRes.json();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
      const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const cloudinaryData = await cloudinaryRes.json();

      if (cloudinaryData.secure_url) {
        setUploadMessage('Image uploaded successfully!');
        setImageUrl(cloudinaryData.secure_url);

        await fetch('/api/save-image-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: cloudinaryData.secure_url }),
        });
      } else {
        setUploadMessage('Image upload failed.');
        console.error(cloudinaryData);
      }
    } catch (err) {
      setUploadMessage('Error during upload.');
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Upload an Image</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="image">Choose an image:</label>
        <input type="file" id="image" name="image" accept="image/*" required />
        <br /><br />
        <button type="submit">Upload</button>
      </form>
      <div style={{ marginTop: '10px' }}>{uploadMessage}</div>
      {imageUrl && (
        <div style={{ marginTop: '10px' }}>
          <strong>Image URL:</strong> <a href={imageUrl} target="_blank" rel="noopener noreferrer">{imageUrl}</a>
        </div>
      )}
    </div>
  );
}
