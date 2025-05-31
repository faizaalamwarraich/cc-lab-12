import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;
const MONGODB_DB = 'secureDB'; // Replace with your actual DB name if different

// Reuse MongoClient across requests (recommended for performance)
let cachedClient: MongoClient | null = null;

async function connectDatabase(): Promise<MongoClient> {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

// POST /api/save-image-url
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ message: 'Image URL is required.' }, { status: 400 });
    }

    const client = await connectDatabase();
    const db = client.db(MONGODB_DB);
    const collection = db.collection('uploaded_images');

    const result = await collection.insertOne({
      url,
      uploadedAt: new Date(),
    });

    console.log('Image URL saved:', result.insertedId);
    return NextResponse.json({ message: 'Image URL saved to database successfully!' });
  } catch (error) {
    console.error('Error saving image URL:', error);
    return NextResponse.json({ message: 'Failed to save image URL to database.' }, { status: 500 });
  }
}
