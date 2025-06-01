'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
type ImageData = {
  _id: string;
  url: string;
};

export default function Page() {
  const [uploadMessage, setUploadMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState<ImageData[]>([]);

  // Fetch all uploaded images from DB
  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const res = await fetch('/api/get-images');
      const data = await res.json();
      setImages(data);
    } catch (err) {
      console.error('Error fetching images:', err);
    }
  };

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploadMessage('');
    setImageUrl('');

    const fileInput = event.currentTarget.elements.namedItem('image') as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file) {
      setUploadMessage('Please select an image file.');
      return;
    }

    setUploadMessage('Uploading...');

    try {
      // 1. Get signature
      // Get signature
const signatureRes = await fetch('/api/upload-signature');
if (!signatureRes.ok) {
  const error = await signatureRes.text();
  throw new Error('Signature fetch failed: ' + error);
}
const { signature, timestamp } = await signatureRes.json();


      // 2. Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);

      // Upload to Cloudinary
const cloudinaryRes = await fetch(
  `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
  {
    method: 'POST',
    body: formData,
  }
);
if (!cloudinaryRes.ok) {
  const error = await cloudinaryRes.text();
  throw new Error('Cloudinary upload failed: ' + error);
}

      const cloudinaryData = await cloudinaryRes.json();

      if (cloudinaryData.secure_url) {
        setUploadMessage('Image uploaded successfully!');
        setImageUrl(cloudinaryData.secure_url);

        // 3. Save URL to MongoDB
        const saveRes = await fetch('/api/save-image-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: cloudinaryData.secure_url }),
        });

        if (!saveRes.ok) {
          console.error('Failed to save image URL');
        }

        fetchImages(); // Refresh gallery
      } else {
        setUploadMessage('Upload failed.');
        console.error('Cloudinary error:', cloudinaryData);
      }
    } catch (error) {
      setUploadMessage('Error during upload.');
      console.error('Upload error:', error);
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Upload an Image</h1>
      <form onSubmit={handleUpload} style={{ marginBottom: '1rem' }}>
        <input type="file" name="image" accept="image/*" required />
        <button type="submit">Upload</button>
      </form>
      <p>{uploadMessage}</p>

      {imageUrl && (
        <p>
          Uploaded Image URL:{' '}
          <a href={imageUrl} target="_blank" rel="noreferrer">
            {imageUrl}
          </a>
        </p>
      )}

      <h2>Uploaded Images</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {images.map((img) => (
          <img
            key={img._id}
            src={img.url}
            alt="Uploaded"
            width={200}
            style={{ borderRadius: '8px' }}
          />
        ))}
      </div>
    </div>
  );
}
