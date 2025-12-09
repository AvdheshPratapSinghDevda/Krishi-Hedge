import { NextResponse } from 'next/server';

// Mock options chain data - replace with real NCDEX API
const OPTIONS_DATA: Record<string, any[]> = {
  soybean: [
    { strikePrice: 4600, callPremium: 385, putPremium: 45, callOI: 12400, putOI: 8200 },
    { strikePrice: 4700, callPremium: 295, putPremium: 68, callOI: 18900, putOI: 11500 },
    { strikePrice: 4800, callPremium: 218, putPremium: 105, callOI: 25600, putOI: 15800 },
    { strikePrice: 4900, callPremium: 152, putPremium: 165, callOI: 32100, putOI: 22400 },
    { strikePrice: 5000, callPremium: 98, putPremium: 245, callOI: 28400, putOI: 31200 },
    { strikePrice: 5100, callPremium: 58, putPremium: 342, callOI: 19800, putOI: 38900 },
    { strikePrice: 5200, callPremium: 32, putPremium: 458, callOI: 11200, putOI: 42100 }
  ],
  groundnut: [
    { strikePrice: 6000, callPremium: 445, putPremium: 52, callOI: 8900, putOI: 5400 },
    { strikePrice: 6100, callPremium: 358, putPremium: 78, callOI: 12400, putOI: 7800 },
    { strikePrice: 6200, callPremium: 282, putPremium: 118, callOI: 16700, putOI: 10200 },
    { strikePrice: 6300, callPremium: 215, putPremium: 172, callOI: 19200, putOI: 14100 },
    { strikePrice: 6400, callPremium: 158, putPremium: 245, callOI: 15800, putOI: 18900 },
    { strikePrice: 6500, callPremium: 108, putPremium: 335, callOI: 11200, putOI: 24200 }
  ],
  mustard: [
    { strikePrice: 5200, callPremium: 382, putPremium: 48, callOI: 6700, putOI: 4200 },
    { strikePrice: 5300, callPremium: 298, putPremium: 72, callOI: 9800, putOI: 6100 },
    { strikePrice: 5400, callPremium: 225, putPremium: 108, callOI: 13500, putOI: 8900 },
    { strikePrice: 5500, callPremium: 165, putPremium: 158, callOI: 16200, putOI: 12400 },
    { strikePrice: 5600, callPremium: 115, putPremium: 228, callOI: 12800, putOI: 16700 }
  ],
  castor: [
    { strikePrice: 5600, callPremium: 362, putPremium: 42, callOI: 5200, putOI: 3100 },
    { strikePrice: 5700, callPremium: 285, putPremium: 65, callOI: 7800, putOI: 4800 },
    { strikePrice: 5800, callPremium: 218, putPremium: 98, callOI: 10900, putOI: 6900 },
    { strikePrice: 5900, callPremium: 162, putPremium: 145, callOI: 12400, putOI: 9800 },
    { strikePrice: 6000, callPremium: 112, putPremium: 208, callOI: 9200, putOI: 13100 }
  ]
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const commodity = searchParams.get('commodity') || 'soybean';

    const optionsChain = OPTIONS_DATA[commodity] || [];

    return NextResponse.json(optionsChain);
  } catch (error) {
    console.error('Error fetching options:', error);
    return NextResponse.json({ error: 'Failed to fetch options data' }, { status: 500 });
  }
}
