'use client';

import { useEffect, useState } from 'react';

export default function Page() {
  const [uploadMessage, setUploadMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Just for debugging – logs env variables
  useEffect(() => {
    console.log('668132817392533', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
    console.log('dck2dxvo1', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
  }, []);

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
      // Step 1: Get signature
      const signatureRes = await fetch('/api/upload-signature');
      if (!signatureRes.ok) throw new Error('Failed to get upload signature');
      const { signature, timestamp } = await signatureRes.json();

      // Step 2: Prepare upload data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);

      // Step 3: Upload to Cloudinary
      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      const cloudinaryData = await cloudinaryRes.json();

      if (cloudinaryData.secure_url) {
        setUploadMessage('Image uploaded successfully!');
        setImageUrl(cloudinaryData.secure_url);
        console.log('Cloudinary response:', cloudinaryData);

        // Step 4: Save image URL
        const saveRes = await fetch('/api/save-image-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: cloudinaryData.secure_url }),
        });

        if (!saveRes.ok) {
          console.error('Failed to save image URL');
        }
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
    <div>
      <h1>Upload an Image</h1>
      <form onSubmit={handleUpload}>
        <input type="file" name="image" accept="image/*" required />
        <button type="submit">Upload</button>
      </form>
      <p>{uploadMessage}</p>
      {imageUrl && (
        <p>
          Uploaded Image URL: <a href={imageUrl} target="_blank" rel="noreferrer">{imageUrl}</a>
        </p>
      )}
    </div>
  );
}
