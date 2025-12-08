"""
Real Market Data Fetcher from Indian Government APIs
Fetches 10+ years of historical oilseed price data from AGMARKNET and Data.gov.in
For Smart India Hackathon 2025 - Oilseed Hedging Platform
"""

import requests
import pandas as pd
import json
from datetime import datetime, timedelta
from pathlib import Path
import time
import os
from typing import List, Dict, Optional

class AGMARKNETDataFetcher:
    """Fetch real market data from Indian Government sources"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the data fetcher
        
        Args:
            api_key: Data.gov.in API key (get from https://data.gov.in/)
        """
        self.api_key = api_key or os.getenv('DATA_GOV_IN_API_KEY', '')
        
        # Data.gov.in API configuration
        self.data_gov_base = "https://api.data.gov.in/resource"
        
        # AGMARKNET Resource IDs (these are official data.gov.in resources)
        self.resources = {
            'prices': '9ef84268-d588-465a-a308-a864a43d0070',  # Daily commodity prices
            'arrivals': '35985678-0d79-46b4-9ed6-6f13308a1d24',  # Market arrivals
        }
        
        # Commodity mapping (AGMARKNET names)
        self.commodities = {
            'Soybean': ['Soybean', 'Soya bean', 'Soyabean'],
            'Mustard': ['Mustard', 'Mustard Seed', 'Rai', 'Sarson'],
            'Sesame': ['Sesame', 'Til', 'Gingelly'],
            'Groundnut': ['Groundnut', 'Ground Nut', 'Peanut']
        }
        
        # Major markets for each commodity
        self.markets = {
            'Soybean': [
                {'state': 'Madhya Pradesh', 'district': 'Indore', 'market': 'Indore'},
                {'state': 'Madhya Pradesh', 'district': 'Bhopal', 'market': 'Bhopal'},
                {'state': 'Maharashtra', 'district': 'Nagpur', 'market': 'Nagpur'},
                {'state': 'Rajasthan', 'district': 'Kota', 'market': 'Kota'},
            ],
            'Mustard': [
                {'state': 'Rajasthan', 'district': 'Jaipur', 'market': 'Jaipur'},
                {'state': 'Rajasthan', 'district': 'Bharatpur', 'market': 'Bharatpur'},
                {'state': 'Haryana', 'district': 'Sirsa', 'market': 'Sirsa'},
                {'state': 'Uttar Pradesh', 'district': 'Bareilly', 'market': 'Bareilly'},
            ],
            'Sesame': [
                {'state': 'Gujarat', 'district': 'Rajkot', 'market': 'Rajkot'},
                {'state': 'Madhya Pradesh', 'district': 'Indore', 'market': 'Indore'},
                {'state': 'Uttar Pradesh', 'district': 'Kanpur', 'market': 'Kanpur'},
            ],
            'Groundnut': [
                {'state': 'Gujarat', 'district': 'Rajkot', 'market': 'Rajkot'},
                {'state': 'Andhra Pradesh', 'district': 'Anantapur', 'market': 'Anantapur'},
                {'state': 'Tamil Nadu', 'district': 'Vellore', 'market': 'Vellore'},
            ]
        }
    
    def fetch_data_gov_api(self, resource_id: str, filters: Dict, limit: int = 10000) -> Optional[pd.DataFrame]:
        """
        Fetch data from data.gov.in API
        
        Args:
            resource_id: Resource ID from data.gov.in
            filters: Query filters
            limit: Maximum records to fetch
            
        Returns:
            DataFrame with fetched data or None if error
        """
        if not self.api_key:
            print("⚠️  Warning: No API key provided. Using public access (limited).")
        
        url = f"{self.data_gov_base}/{resource_id}"
        
        params = {
            'api-key': self.api_key,
            'format': 'json',
            'limit': limit,
            'offset': 0
        }
        
        # Add filters
        for key, value in filters.items():
            params[f'filters[{key}]'] = value
        
        try:
            print(f"📡 Fetching from data.gov.in... (Resource: {resource_id})")
            response = requests.get(url, params=params, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if 'records' in data and len(data['records']) > 0:
                    df = pd.DataFrame(data['records'])
                    print(f"✅ Fetched {len(df)} records")
                    return df
                else:
                    print(f"⚠️  No records found")
                    return None
            else:
                print(f"❌ Error: HTTP {response.status_code}")
                print(f"Response: {response.text[:200]}")
                return None
                
        except Exception as e:
            print(f"❌ Exception: {str(e)}")
            return None
    
    def fetch_agmarknet_direct(self, commodity: str, state: str, district: str, 
                                market: str, from_date: str, to_date: str) -> Optional[pd.DataFrame]:
        """
        Fetch data directly from AGMARKNET portal (fallback method)
        
        Args:
            commodity: Commodity name
            state: State name
            district: District name
            market: Market name
            from_date: Start date (DD-MMM-YYYY)
            to_date: End date (DD-MMM-YYYY)
            
        Returns:
            DataFrame with price data or None
        """
        print(f"🌐 Fetching from AGMARKNET portal: {commodity} @ {market}")
        
        # AGMARKNET search URL
        url = "https://agmarknet.gov.in/SearchCmmMkt.aspx"
        
        try:
            # First, get the page to extract viewstate
            session = requests.Session()
            response = session.get(url, timeout=30)
            
            # Parse viewstate from HTML (needed for ASP.NET postback)
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(response.content, 'html.parser')
            viewstate = soup.find('input', {'id': '__VIEWSTATE'})
            viewstate_value = viewstate['value'] if viewstate else ''
            
            # Prepare POST data
            payload = {
                '__VIEWSTATE': viewstate_value,
                'Tx_Commodity': commodity,
                'Tx_State': state,
                'Tx_District': district,
                'Tx_Market': market,
                'DateFrom': from_date,
                'DateTo': to_date,
                'Fr_Date': from_date,
                'To_Date': to_date,
                'Tx_Trend': '0',
                'Tx_CommodityHead': commodity,
                'Tx_StateHead': state,
                'Tx_DistrictHead': district,
                'Tx_MarketHead': market,
            }
            
            # Submit form
            response = session.post(url, data=payload, timeout=60)
            
            # Parse result table
            soup = BeautifulSoup(response.content, 'html.parser')
            table = soup.find('table', {'id': 'cphBody_GridPriceData'})
            
            if table:
                # Extract table data
                rows = table.find_all('tr')
                data = []
                
                for row in rows[1:]:  # Skip header
                    cols = row.find_all('td')
                    if len(cols) >= 7:
                        data.append({
                            'date': cols[0].text.strip(),
                            'commodity': commodity,
                            'state': state,
                            'district': district,
                            'market': market,
                            'min_price': cols[3].text.strip(),
                            'max_price': cols[4].text.strip(),
                            'modal_price': cols[5].text.strip(),
                            'arrivals': cols[6].text.strip() if len(cols) > 6 else '0'
                        })
                
                if data:
                    df = pd.DataFrame(data)
                    print(f"✅ Fetched {len(df)} records from AGMARKNET portal")
                    return df
            
            print("⚠️  No data found in table")
            return None
            
        except Exception as e:
            print(f"❌ AGMARKNET portal error: {str(e)}")
            return None
    
    def fetch_commodity_data(self, commodity: str, years: int = 10) -> pd.DataFrame:
        """
        Fetch historical data for a specific commodity
        
        Args:
            commodity: Commodity name (Soybean, Mustard, Sesame, Groundnut)
            years: Number of years of historical data
            
        Returns:
            Combined DataFrame with all market data
        """
        print(f"\n{'='*80}")
        print(f"🌾 Fetching {commodity} data for {years} years")
        print(f"{'='*80}")
        
        all_data = []
        end_date = datetime.now()
        start_date = end_date - timedelta(days=years*365)
        
        markets = self.markets.get(commodity, [])
        
        for market_info in markets:
            print(f"\n📍 Market: {market_info['market']}, {market_info['district']}, {market_info['state']}")
            
            # Try data.gov.in API first
            filters = {
                'commodity': commodity,
                'state': market_info['state'],
                'district': market_info['district'],
                'market': market_info['market'],
            }
            
            df = self.fetch_data_gov_api(self.resources['prices'], filters, limit=10000)
            
            # Fallback to AGMARKNET portal scraping
            if df is None or len(df) == 0:
                print("🔄 Trying AGMARKNET portal (fallback)...")
                from_date = start_date.strftime('%d-%b-%Y')
                to_date = end_date.strftime('%d-%b-%Y')
                
                df = self.fetch_agmarknet_direct(
                    commodity=commodity,
                    state=market_info['state'],
                    district=market_info['district'],
                    market=market_info['market'],
                    from_date=from_date,
                    to_date=to_date
                )
            
            if df is not None and len(df) > 0:
                all_data.append(df)
                time.sleep(2)  # Rate limiting
        
        if all_data:
            combined_df = pd.concat(all_data, ignore_index=True)
            print(f"\n✅ Total records for {commodity}: {len(combined_df)}")
            return combined_df
        else:
            print(f"\n❌ No data fetched for {commodity}")
            return pd.DataFrame()
    
    def fetch_all_commodities(self, years: int = 10) -> pd.DataFrame:
        """
        Fetch data for all configured commodities
        
        Args:
            years: Number of years of historical data
            
        Returns:
            Combined DataFrame with all commodity data
        """
        print(f"\n{'='*80}")
        print(f"🚀 AGMARKNET DATA FETCHER - Smart India Hackathon 2025")
        print(f"{'='*80}")
        print(f"📅 Fetching {years} years of historical data")
        print(f"🌾 Commodities: {', '.join(self.commodities.keys())}")
        print(f"{'='*80}\n")
        
        all_datasets = []
        
        for commodity in self.commodities.keys():
            df = self.fetch_commodity_data(commodity, years)
            if len(df) > 0:
                all_datasets.append(df)
        
        if all_datasets:
            combined_df = pd.concat(all_datasets, ignore_index=True)
            print(f"\n{'='*80}")
            print(f"✅ TOTAL RECORDS FETCHED: {len(combined_df)}")
            print(f"{'='*80}")
            return combined_df
        else:
            print("\n❌ No data fetched from any source")
            return pd.DataFrame()
    
    def clean_and_standardize(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Clean and standardize the fetched data
        
        Args:
            df: Raw data DataFrame
            
        Returns:
            Cleaned DataFrame
        """
        print("\n🧹 Cleaning and standardizing data...")
        
        if len(df) == 0:
            return df
        
        # Standardize column names
        column_mapping = {
            'arrival_date': 'date',
            'Commodity': 'commodity',
            'State': 'state',
            'District': 'district',
            'Market': 'market',
            'Min_Price': 'min_price',
            'Max_Price': 'max_price',
            'Modal_Price': 'modal_price',
            'Price_Date': 'date',
            'Arrivals': 'arrivals'
        }
        
        df = df.rename(columns={k: v for k, v in column_mapping.items() if k in df.columns})
        
        # Convert date to datetime
        if 'date' in df.columns:
            df['date'] = pd.to_datetime(df['date'], errors='coerce', format='%d-%b-%Y')
        
        # Convert prices to numeric
        price_columns = ['min_price', 'max_price', 'modal_price', 'arrivals']
        for col in price_columns:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col].astype(str).str.replace(',', ''), errors='coerce')
        
        # Remove rows with missing essential data
        df = df.dropna(subset=['date', 'modal_price'])
        
        # Sort by date
        df = df.sort_values('date').reset_index(drop=True)
        
        # Add unit
        df['unit'] = 'Quintal'
        
        print(f"✅ Cleaned data: {len(df)} valid records")
        
        return df
    
    def save_data(self, df: pd.DataFrame, output_dir: str = None):
        """
        Save fetched data to files
        
        Args:
            df: DataFrame to save
            output_dir: Output directory path
        """
        if output_dir is None:
            output_dir = Path(__file__).parent.parent / "processed"
        else:
            output_dir = Path(output_dir)
        
        output_dir.mkdir(parents=True, exist_ok=True)
        
        print(f"\n💾 Saving data to {output_dir}...")
        
        # Save combined data
        csv_path = output_dir / "agmarknet_real_data.csv"
        df.to_csv(csv_path, index=False)
        print(f"✅ Saved: {csv_path}")
        
        json_path = output_dir / "agmarknet_real_data.json"
        df.to_json(json_path, orient='records', date_format='iso', indent=2)
        print(f"✅ Saved: {json_path}")
        
        # Save commodity-wise files
        for commodity in df['commodity'].unique():
            commodity_df = df[df['commodity'] == commodity]
            commodity_file = output_dir / f"{commodity.lower().replace(' ', '_')}_real.csv"
            commodity_df.to_csv(commodity_file, index=False)
            print(f"✅ Saved: {commodity_file}")
        
        # Generate metadata
        metadata = {
            'fetched_on': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'source': 'AGMARKNET / Data.gov.in',
            'date_range': {
                'start': df['date'].min().strftime('%Y-%m-%d'),
                'end': df['date'].max().strftime('%Y-%m-%d')
            },
            'total_records': len(df),
            'commodities': {
                commodity: {
                    'records': len(df[df['commodity'] == commodity]),
                    'markets': int(df[df['commodity'] == commodity]['market'].nunique()),
                    'avg_price': float(df[df['commodity'] == commodity]['modal_price'].mean().round(2)),
                    'price_range': [
                        float(df[df['commodity'] == commodity]['modal_price'].min().round(2)),
                        float(df[df['commodity'] == commodity]['modal_price'].max().round(2))
                    ],
                    'date_coverage_years': round(
                        (df[df['commodity'] == commodity]['date'].max() - 
                         df[df['commodity'] == commodity]['date'].min()).days / 365.25, 1
                    )
                }
                for commodity in df['commodity'].unique()
            }
        }
        
        metadata_path = output_dir / "agmarknet_metadata.json"
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        print(f"✅ Saved: {metadata_path}")
        
        # Print summary
        print(f"\n{'='*80}")
        print("📊 DATA SUMMARY")
        print(f"{'='*80}")
        print(f"Total Records: {metadata['total_records']:,}")
        print(f"Date Range: {metadata['date_range']['start']} to {metadata['date_range']['end']}")
        print(f"\nCommodity Breakdown:")
        for commodity, stats in metadata['commodities'].items():
            print(f"\n  {commodity}:")
            print(f"    Records: {stats['records']:,}")
            print(f"    Markets: {stats['markets']}")
            print(f"    Coverage: {stats['date_coverage_years']} years")
            print(f"    Avg Price: ₹{stats['avg_price']:,.2f}/quintal")
            print(f"    Price Range: ₹{stats['price_range'][0]:,.2f} - ₹{stats['price_range'][1]:,.2f}")
        print(f"\n{'='*80}")


def main():
    """Main execution function"""
    
    # Get API key from environment or prompt
    api_key = os.getenv('DATA_GOV_IN_API_KEY')
    
    if not api_key:
        print("\n⚠️  No API key found in environment variable 'DATA_GOV_IN_API_KEY'")
        print("Get your free API key from: https://data.gov.in/")
        print("You can continue without API key but with limited access.\n")
        api_key = input("Enter API key (or press Enter to skip): ").strip()
    
    # Initialize fetcher
    fetcher = AGMARKNETDataFetcher(api_key=api_key)
    
    # Fetch data (10 years)
    print("\n🚀 Starting data fetch process...")
    df = fetcher.fetch_all_commodities(years=10)
    
    if len(df) > 0:
        # Clean data
        df = fetcher.clean_and_standardize(df)
        
        # Save data
        output_dir = Path(r"d:\FINAL PROJECT\TESTING-APP\ml-model\data\processed")
        fetcher.save_data(df, output_dir)
        
        print("\n✅ Data fetch complete! Ready for model training.")
    else:
        print("\n❌ No data was fetched. Please check:")
        print("  1. Internet connection")
        print("  2. API key validity")
        print("  3. AGMARKNET portal availability")


if __name__ == "__main__":
    main()
