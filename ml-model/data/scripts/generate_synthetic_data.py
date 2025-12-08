"""
Synthetic Oilseed Data Generator
Generates realistic market data for Soybean, Mustard, and Sesame
Based on actual market patterns and seasonal trends
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from pathlib import Path
import json

class SyntheticOilseedGenerator:
    """Generate realistic oilseed market data"""
    
    def __init__(self, start_date='2020-01-01', end_date='2024-12-31'):
        self.start_date = pd.to_datetime(start_date)
        self.end_date = pd.to_datetime(end_date)
        self.date_range = pd.date_range(start=self.start_date, end=self.end_date, freq='D')
        
        # Market configurations for different commodities
        self.commodity_configs = {
            'Soybean': {
                'variety': 'Yellow',
                'markets': [
                    {'market': 'Indore', 'district': 'Indore', 'state': 'Madhya Pradesh'},
                    {'market': 'Bhopal', 'district': 'Bhopal', 'state': 'Madhya Pradesh'},
                    {'market': 'Rajkot', 'district': 'Rajkot', 'state': 'Gujarat'},
                ],
                'base_price': 4500,
                'price_std': 300,
                'seasonal_amplitude': 500,
                'harvest_months': [10, 11, 12],  # Oct-Dec
                'peak_arrival_months': [11, 12, 1],
                'base_arrivals': 200,
                'arrival_std': 80,
                'trend': 0.0005  # Slight upward trend
            },
            'Mustard': {
                'variety': 'Black',
                'markets': [
                    {'market': 'Jaipur', 'district': 'Jaipur', 'state': 'Rajasthan'},
                    {'market': 'Bharatpur', 'district': 'Bharatpur', 'state': 'Rajasthan'},
                    {'market': 'Alwar', 'district': 'Alwar', 'state': 'Rajasthan'},
                ],
                'base_price': 5800,
                'price_std': 400,
                'seasonal_amplitude': 600,
                'harvest_months': [2, 3, 4],  # Feb-Apr
                'peak_arrival_months': [3, 4, 5],
                'base_arrivals': 150,
                'arrival_std': 60,
                'trend': 0.0008
            },
            'Sesame': {
                'variety': 'White',
                'markets': [
                    {'market': 'Hyderabad', 'district': 'Hyderabad', 'state': 'Telangana'},
                    {'market': 'Bangalore', 'district': 'Bangalore', 'state': 'Karnataka'},
                    {'market': 'Rajkot', 'district': 'Rajkot', 'state': 'Gujarat'},
                ],
                'base_price': 12000,
                'price_std': 800,
                'seasonal_amplitude': 1200,
                'harvest_months': [10, 11],  # Oct-Nov
                'peak_arrival_months': [10, 11, 12],
                'base_arrivals': 80,
                'arrival_std': 30,
                'trend': 0.001
            }
        }
    
    def add_seasonal_pattern(self, dates, base_value, amplitude, peak_months):
        """Add seasonal variation to values"""
        seasonal_values = np.zeros(len(dates))
        
        for i, date in enumerate(dates):
            month = date.month
            # Create seasonal wave with peaks in harvest months
            if month in peak_months:
                seasonal_values[i] = amplitude * 0.8
            elif month in [(m % 12) + 1 for m in peak_months]:  # Month after peak
                seasonal_values[i] = amplitude * 0.5
            elif month in [(m - 2) % 12 + 1 for m in peak_months]:  # Month before peak
                seasonal_values[i] = amplitude * 0.3
            else:
                seasonal_values[i] = -amplitude * 0.4
        
        return seasonal_values
    
    def add_trend(self, dates, base_value, trend_rate):
        """Add linear trend to values"""
        days_from_start = (dates - dates.iloc[0]).dt.days
        return base_value + (days_from_start * trend_rate)
    
    def add_noise(self, values, std):
        """Add random noise"""
        return np.random.normal(0, std, len(values))
    
    def add_market_events(self, dates, prices):
        """Simulate market events (festivals, policy changes)"""
        # Diwali effect (Oct-Nov) - price spike
        diwali_mask = (dates.dt.month.isin([10, 11]))
        prices[diwali_mask] *= 1.05
        
        # Holi effect (Mar) - moderate increase
        holi_mask = (dates.dt.month == 3)
        prices[holi_mask] *= 1.02
        
        # Random policy shocks (2% chance per day)
        shock_days = np.random.random(len(dates)) < 0.02
        shock_magnitude = np.random.uniform(-0.08, 0.08, len(dates))
        prices[shock_days] *= (1 + shock_magnitude[shock_days])
        
        return prices
    
    def generate_commodity_data(self, commodity):
        """Generate data for a specific commodity"""
        config = self.commodity_configs[commodity]
        all_data = []
        
        for market_info in config['markets']:
            print(f"Generating {commodity} data for {market_info['market']}...")
            
            # Generate dates
            dates = pd.Series(self.date_range)
            n_days = len(dates)
            
            # Generate prices
            base_prices = self.add_trend(dates, config['base_price'], config['trend'])
            seasonal_prices = self.add_seasonal_pattern(
                dates, 
                config['base_price'], 
                config['seasonal_amplitude'], 
                config['harvest_months']
            )
            noise = self.add_noise(base_prices, config['price_std'])
            
            modal_prices = base_prices + seasonal_prices + noise
            modal_prices = self.add_market_events(dates, modal_prices)
            modal_prices = np.maximum(modal_prices, config['base_price'] * 0.5)  # Floor price
            
            # Generate min/max prices
            min_prices = modal_prices * np.random.uniform(0.92, 0.97, n_days)
            max_prices = modal_prices * np.random.uniform(1.03, 1.08, n_days)
            
            # Generate arrivals
            base_arrivals = self.add_trend(dates, config['base_arrivals'], config['trend'] * 0.3)
            seasonal_arrivals = self.add_seasonal_pattern(
                dates,
                config['base_arrivals'],
                config['base_arrivals'] * 1.5,
                config['peak_arrival_months']
            )
            arrival_noise = self.add_noise(base_arrivals, config['arrival_std'])
            
            arrivals = base_arrivals + seasonal_arrivals + arrival_noise
            arrivals = np.maximum(arrivals, 5)  # Minimum arrivals
            
            # Add weekend/holiday effect (lower arrivals)
            weekend_mask = dates.dt.dayofweek.isin([5, 6])
            arrivals[weekend_mask] *= 0.3
            
            # Some days with zero trade (5% probability)
            zero_trade_mask = np.random.random(n_days) < 0.05
            arrivals[zero_trade_mask] = 0
            modal_prices[zero_trade_mask] = 0
            
            # Create DataFrame
            market_df = pd.DataFrame({
                'commodity': commodity,
                'variety': config['variety'],
                'market': market_info['market'],
                'district': market_info['district'],
                'state': market_info['state'],
                'date': dates,
                'modal_price': modal_prices.round(2),
                'min_price': min_prices.round(2),
                'max_price': max_prices.round(2),
                'arrivals': arrivals.round(2),
                'unit': 'Quintal'
            })
            
            all_data.append(market_df)
        
        return pd.concat(all_data, ignore_index=True)
    
    def generate_all_commodities(self):
        """Generate data for all configured commodities"""
        all_datasets = []
        
        for commodity in self.commodity_configs.keys():
            print(f"\n{'='*60}")
            print(f"Generating {commodity} dataset...")
            print(f"{'='*60}")
            commodity_df = self.generate_commodity_data(commodity)
            all_datasets.append(commodity_df)
            print(f"Generated {len(commodity_df)} records for {commodity}")
        
        combined_df = pd.concat(all_datasets, ignore_index=True)
        combined_df = combined_df.sort_values(['commodity', 'market', 'date']).reset_index(drop=True)
        
        return combined_df
    
    def save_datasets(self, df, output_dir):
        """Save generated datasets"""
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Save combined dataset
        csv_path = output_path / "synthetic_oilseed_data.csv"
        df.to_csv(csv_path, index=False)
        print(f"\nSaved: {csv_path}")
        
        json_path = output_path / "synthetic_oilseed_data.json"
        df.to_json(json_path, orient='records', date_format='iso', indent=2)
        print(f"Saved: {json_path}")
        
        # Save individual commodity files
        for commodity in df['commodity'].unique():
            commodity_df = df[df['commodity'] == commodity]
            commodity_file = output_path / f"{commodity.lower().replace(' ', '_')}_synthetic.csv"
            commodity_df.to_csv(commodity_file, index=False)
            print(f"Saved: {commodity_file}")
        
        # Generate metadata
        metadata = {
            'generated_on': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'date_range': {
                'start': df['date'].min().strftime('%Y-%m-%d'),
                'end': df['date'].max().strftime('%Y-%m-%d')
            },
            'total_records': len(df),
            'commodities': {
                commodity: {
                    'records': len(df[df['commodity'] == commodity]),
                    'markets': df[df['commodity'] == commodity]['market'].nunique(),
                    'avg_price': float(df[df['commodity'] == commodity]['modal_price'].mean().round(2)),
                    'price_range': [
                        float(df[df['commodity'] == commodity]['modal_price'].min().round(2)),
                        float(df[df['commodity'] == commodity]['modal_price'].max().round(2))
                    ]
                }
                for commodity in df['commodity'].unique()
            }
        }
        
        metadata_path = output_path / "synthetic_data_metadata.json"
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        print(f"Saved: {metadata_path}")
        
        return csv_path


def main():
    """Main execution function"""
    print("=" * 60)
    print("Synthetic Oilseed Data Generator")
    print("=" * 60)
    
    # Configure date range (5 years of data)
    generator = SyntheticOilseedGenerator(
        start_date='2020-01-01',
        end_date='2024-12-31'
    )
    
    # Generate datasets
    synthetic_df = generator.generate_all_commodities()
    
    # Save datasets
    output_dir = Path(r"d:\FINAL PROJECT\TESTING-APP\ml-model\data\processed")
    generator.save_datasets(synthetic_df, output_dir)
    
    print("\n" + "=" * 60)
    print("GENERATION SUMMARY")
    print("=" * 60)
    print(f"Total records generated: {len(synthetic_df)}")
    print(f"Commodities: {', '.join(synthetic_df['commodity'].unique())}")
    print(f"Date range: {synthetic_df['date'].min()} to {synthetic_df['date'].max()}")
    print(f"Total markets: {synthetic_df['market'].nunique()}")
    print("\nRecords per commodity:")
    for commodity, count in synthetic_df['commodity'].value_counts().items():
        print(f"  - {commodity}: {count}")
    
    print("\n" + "=" * 60)
    print("Generation complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
