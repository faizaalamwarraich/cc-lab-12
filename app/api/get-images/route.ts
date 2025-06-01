import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb'; // You may need to create this helper

export async function GET() {
  const { db } = await connectToDatabase();
  const images = await db.collection('images').find({}).sort({ _id: -1 }).toArray();

  return NextResponse.json(images);
}
