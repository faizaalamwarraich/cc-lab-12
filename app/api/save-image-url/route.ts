import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';

const uri = process.env.MONGODB_URI!;
const dbName = 'your_database_name'; // Replace this

async function connectDatabase() {
  const client = new MongoClient(uri);
  await client.connect();
  return client.db(dbName);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { url } = body;

  if (!url) {
    return NextResponse.json({ message: 'Image URL is required.' }, { status: 400 });
  }

  try {
    const db = await connectDatabase();
    const collection = db.collection('uploaded_images');
    await collection.insertOne({ url, uploadedAt: new Date() });

    return NextResponse.json({ message: 'Image URL saved successfully.' });
  } catch (error) {
    console.error('Error saving image URL:', error);
    return NextResponse.json({ message: 'Failed to save image URL.' }, { status: 500 });
  }
}
