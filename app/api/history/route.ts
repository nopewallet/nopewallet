import { NextRequest, NextResponse } from 'next/server';

const BASE_PRICE_HISTORY_API_URL = process.env.BASE_PRICE_HISTORY_API_URL || 'https://paynope.com/v1/prices/history/';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const crypto = searchParams.get('cryptoName');

  if (!crypto) {
    return NextResponse.json({ error: 'Missing crypto parameter' }, { status: 400 });
  }

  const apiUrl = `${BASE_PRICE_HISTORY_API_URL}${encodeURIComponent(crypto)}`;

  try {
    const res = await fetch(apiUrl);
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch price history' }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}