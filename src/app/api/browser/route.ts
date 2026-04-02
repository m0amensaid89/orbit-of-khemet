import { NextRequest, NextResponse } from 'next/server';

const BROWSER_SERVICE_URL = process.env.BROWSER_SERVICE_URL;
const BROWSER_SERVICE_SECRET = process.env.BROWSER_SERVICE_SECRET;

export async function POST(req: NextRequest) {
  if (!BROWSER_SERVICE_URL) {
    return NextResponse.json(
      { error: 'Browser service not configured' },
      { status: 503 }
    );
  }

  const body = await req.json();
  const { task, url, steps } = body;

  if (!task) {
    return NextResponse.json({ error: 'task is required' }, { status: 400 });
  }

  try {
    const res = await fetch(`${BROWSER_SERVICE_URL}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-secret': BROWSER_SERVICE_SECRET || '',
      },
      body: JSON.stringify({ task, url, steps }),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: 'Browser service unreachable', detail: (err as Error).message },
      { status: 502 }
    );
  }
}
