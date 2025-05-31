import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('secureDB')
    const data = await db.collection('data').findOne({})

    if (!data) {
      return NextResponse.json({ message: 'No data found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('MongoDB Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
