import { NextResponse } from 'next/server';

// Mock futures data - replace with real NCDEX API integration
const FUTURES_DATA: Record<string, any[]> = {
  soybean: [
    {
      id: 'SOY-JAN25',
      commodity: 'Soybean',
      contractMonth: 'January 2025',
      strikePrice: 4800,
      lastPrice: 4925,
      change: 125,
      changePercent: 2.6,
      volume: 15420,
      openInterest: 48300,
      expiry: '2025-01-20'
    },
    {
      id: 'SOY-FEB25',
      commodity: 'Soybean',
      contractMonth: 'February 2025',
      strikePrice: 4850,
      lastPrice: 4980,
      change: 95,
      changePercent: 1.95,
      volume: 12100,
      openInterest: 35200,
      expiry: '2025-02-20'
    }
  ],
  groundnut: [
    {
      id: 'GNT-JAN25',
      commodity: 'Groundnut',
      contractMonth: 'January 2025',
      strikePrice: 6200,
      lastPrice: 6380,
      change: 180,
      changePercent: 2.9,
      volume: 8900,
      openInterest: 22400,
      expiry: '2025-01-20'
    }
  ],
  mustard: [
    {
      id: 'MST-JAN25',
      commodity: 'Mustard',
      contractMonth: 'January 2025',
      strikePrice: 5400,
      lastPrice: 5520,
      change: -45,
      changePercent: -0.81,
      volume: 6700,
      openInterest: 18900,
      expiry: '2025-01-20'
    }
  ],
  castor: [
    {
      id: 'CST-JAN25',
      commodity: 'Castor',
      contractMonth: 'January 2025',
      strikePrice: 5800,
      lastPrice: 5905,
      change: 105,
      changePercent: 1.81,
      volume: 4200,
      openInterest: 12800,
      expiry: '2025-01-20'
    }
  ]
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const commodity = searchParams.get('commodity') || 'soybean';

    const contracts = FUTURES_DATA[commodity] || [];

    return NextResponse.json(contracts);
  } catch (error) {
    console.error('Error fetching futures:', error);
    return NextResponse.json({ error: 'Failed to fetch futures data' }, { status: 500 });
  }
}
