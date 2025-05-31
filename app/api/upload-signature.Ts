// pages/api/cloudinary-signature.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method === 'GET') {
    const timestamp = Math.round(new Date().getTime() / 1000);

    const apiSecret = process.env.CLOUDINARY_API_SECRET!;
    const signature = cloudinary.utils.api_sign_request(
      { timestamp },
      apiSecret
    );

    res.status(200).json({ signature, timestamp });
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
