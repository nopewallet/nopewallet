import { NextRequest, NextResponse } from 'next/server';
const BASE_BALANCE_API_URL = process.env.BASE_BALANCE_API_URL || 'https://paynope.com/v1/balance_check/';

export async function POST(req: NextRequest) {
  const addrMap: Record<string, string> = await req.json();
  const results: Record<string, any> = {};

  for (const [symbol, addr] of Object.entries(addrMap)) {
    if (!addr || !symbol) continue;
    try {
      const res = await fetch(`${BASE_BALANCE_API_URL}${encodeURIComponent(addr)}/${encodeURIComponent(symbol)}`);
      if (res.ok) {
        results[symbol] = await res.json();
      } else {
        results[symbol] = { error: 'Failed to fetch balance', status: res.status };
      }
    } catch (error) {
      results[symbol] = { error: 'Internal server error' };
    }
  }

  console.log("Fetched balances:", results);
  return NextResponse.json(results);
}