// pages/api/explain-verse.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { explainVerse } from '@/ai/flows/generate-verse-explanation';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await explainVerse(body);
  return NextResponse.json(result);
}

/*export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Received request to explain verse:', req.body);
  if (req.method !== 'POST') {
    res.status(405).end('Method Not Allowed');
    return;
  }

  try {
    const input = req.body;
    const result = await explainVerse(input);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error generating verse explanation:', error);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}*/
