import { NextRequest, NextResponse } from 'next/server';
const BASE_BALANCE_API_URL = process.env.BASE_BALANCE_API_URL || 'https://paynope.com/v1/balance_check/';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const addr = searchParams.get('addr');
  const symbol = searchParams.get('symbol');

  if (!addr || !symbol) {
    return NextResponse.json({ error: 'Missing addr or symbol' }, { status: 400 });
  }

  const apiUrl = `${BASE_BALANCE_API_URL}${encodeURIComponent(addr)}/${encodeURIComponent(symbol)}`;

  try {
    const res = await fetch(apiUrl);
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch balance' }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}