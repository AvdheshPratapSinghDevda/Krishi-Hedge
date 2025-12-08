/**
 * ML Data API Endpoint
 * Serves processed oilseed market data from the ML model
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Path to ML model data
const ML_DATA_PATH = path.join(process.cwd(), '..', '..', '..', 'ml-model', 'data', 'processed');

interface OilseedData {
  commodity: string;
  variety: string;
  market: string;
  district: string;
  state: string;
  date: string;
  modal_price: number;
  min_price: number;
  max_price: number;
  arrivals: number;
  volume_lakhs: number;
  adtv: number;
  unit: string;
}

// Commodity name mapping
const COMMODITY_MAP: Record<string, string> = {
  'soybean': 'Soybean',
  'mustard': 'Mustard',
  'groundnut': 'Groundnut',
  'sunflower': 'Sunflower Oil',
  'castor': 'Castor Oil',
  'groundnut-oil': 'Groundnut Oil',
  'sesame': 'Sesame'
};

function parseCSV(csvText: string): OilseedData[] {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',');
  const data: OilseedData[] = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = lines[i].split(',');
    const row: any = {};
    
    headers.forEach((header, index) => {
      const key = header.trim();
      let value: any = values[index]?.trim();
      
      // Convert numeric fields
      if (['modal_price', 'min_price', 'max_price', 'arrivals', 'volume_lakhs', 'adtv'].includes(key)) {
        value = parseFloat(value) || 0;
      }
      
      row[key] = value;
    });
    
    data.push(row as OilseedData);
  }

  return data;
}

function filterDataByTimeframe(data: OilseedData[], timeframe: string): OilseedData[] {
  const now = new Date();
  const timeframeMap: Record<string, number> = {
    '1D': 1,
    '1W': 7,
    '1M': 30,
    '3M': 90,
    '6M': 180,
    '1Y': 365
  };

  const days = timeframeMap[timeframe] || 30;
  const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  return data.filter(row => {
    const rowDate = new Date(row.date);
    return rowDate >= cutoffDate;
  });
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const commodity = searchParams.get('commodity') || 'groundnut';
    const timeframe = searchParams.get('timeframe') || '1M';
    
    // Map commodity name
    const commodityName = COMMODITY_MAP[commodity.toLowerCase()] || 'Groundnut';

    // Read combined dataset
    const csvPath = path.join(ML_DATA_PATH, 'combined_oilseed_data.csv');
    
    if (!fs.existsSync(csvPath)) {
      return NextResponse.json({
        error: 'ML data not found. Please run the ML pipeline first.',
        data: []
      }, { status: 404 });
    }

    const csvText = fs.readFileSync(csvPath, 'utf-8');
    const allData = parseCSV(csvText);

    // Filter by commodity
    let commodityData = allData.filter(row => 
      row.commodity.toLowerCase().includes(commodityName.toLowerCase()) ||
      commodityName.toLowerCase().includes(row.commodity.toLowerCase())
    );

    // If no data found, try alternate names
    if (commodityData.length === 0) {
      commodityData = allData.filter(row => {
        const rowCommodity = row.commodity.toLowerCase();
        return rowCommodity.includes(commodity.toLowerCase());
      });
    }

    // Filter by timeframe
    const filteredData = filterDataByTimeframe(commodityData, timeframe);

    // Sort by date
    filteredData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate statistics
    const prices = filteredData.map(d => d.modal_price);
    const currentPrice = prices[prices.length - 1] || 0;
    const previousPrice = prices[prices.length - 2] || currentPrice;
    const priceChange = currentPrice - previousPrice;
    const priceChangePercent = previousPrice > 0 ? ((priceChange / previousPrice) * 100) : 0;

    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Transform for frontend
    const chartData = filteredData.map(row => ({
      date: new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      price: row.modal_price,
      minPrice: row.min_price,
      maxPrice: row.max_price,
      arrivals: row.arrivals,
      volume: row.volume_lakhs,
      timestamp: new Date(row.date).getTime()
    }));

    return NextResponse.json({
      success: true,
      commodity: commodityName,
      market: filteredData[0]?.market || 'N/A',
      state: filteredData[0]?.state || 'N/A',
      timeframe,
      recordCount: filteredData.length,
      currentPrice,
      priceChange,
      priceChangePercent,
      statistics: {
        average: avgPrice,
        min: minPrice,
        max: maxPrice,
        latest: currentPrice
      },
      data: chartData
    });

  } catch (error: any) {
    console.error('Error fetching ML data:', error);
    return NextResponse.json({
      error: 'Failed to fetch ML data',
      message: error.message,
      data: []
    }, { status: 500 });
  }
}
