"""
AGMARK Oilseed Data Processor
Converts various CSV formats to standardized AGMARK format for ML training
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from pathlib import Path
import json
import warnings
warnings.filterwarnings('ignore')

class OilseedDataProcessor:
    """Process and standardize oilseed market data"""
    
    def __init__(self, input_dir, output_dir):
        self.input_dir = Path(input_dir)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
    def parse_date_flexible(self, date_str):
        """Parse dates in multiple formats"""
        date_formats = [
            '%d-%b-%Y',      # 12-Nov-2023
            '%d-%m-%Y',      # 12-11-2023
            '%m-%Y',         # 11-2023
            '%d-%Y',         # 01-2024
            '%Y-%m-%d',      # 2023-11-12
            '%d/%m/%Y',      # 12/11/2023
        ]
        
        for fmt in date_formats:
            try:
                return pd.to_datetime(date_str, format=fmt)
            except:
                continue
        
        # Fallback to pandas auto-parse
        try:
            return pd.to_datetime(date_str)
        except:
            return None
    
    def process_sunoil_data(self, filepath):
        """Process sunflower oil daily data"""
        print(f"Processing {filepath.name}...")
        
        df = pd.read_csv(filepath)
        df['Date'] = df['Date'].apply(self.parse_date_flexible)
        
        # Remove rows with invalid dates
        df = df.dropna(subset=['Date'])
        
        # Clean numeric columns (remove commas)
        numeric_cols = ['Volume (Rs In Lakhs)', 'Quantity', 'ADTV (Rs In Lakhs)']
        for col in numeric_cols:
            df[col] = df[col].astype(str).str.replace(',', '').astype(float)
        
        # Convert to AGMARK format
        # Derive prices from volume and quantity
        df['modal_price'] = (df['Volume (Rs In Lakhs)'] * 100000) / df['Quantity'].replace(0, np.nan)
        df['modal_price'] = df['modal_price'].fillna(0).round(2)
        
        agmark_df = pd.DataFrame({
            'commodity': 'Sunflower Oil',
            'variety': 'Refined',
            'market': 'NCDEX',
            'district': 'Mumbai',
            'state': 'Maharashtra',
            'date': df['Date'],
            'modal_price': df['modal_price'],
            'min_price': (df['modal_price'] * 0.95).round(2),
            'max_price': (df['modal_price'] * 1.05).round(2),
            'arrivals': df['Quantity'],
            'volume_lakhs': df['Volume (Rs In Lakhs)'],
            'adtv': df['ADTV (Rs In Lakhs)'],
            'unit': 'Quintal'
        })
        
        # Filter out zero-volume days
        agmark_df = agmark_df[agmark_df['arrivals'] > 0].copy()
        
        return agmark_df.sort_values('date').reset_index(drop=True)
    
    def process_groundnut_monthly(self, filepath):
        """Process groundnut monthly aggregated data"""
        print(f"Processing {filepath.name}...")
        
        df = pd.read_csv(filepath)
        df['Date'] = df['Date'].apply(self.parse_date_flexible)
        df = df.dropna(subset=['Date'])
        
        # Clean numeric columns
        numeric_cols = ['Volume (Rs In Lakhs)', 'Quantity', 'ADTV (Rs In Lakhs)']
        for col in numeric_cols:
            df[col] = df[col].astype(str).str.replace(',', '').astype(float)
        
        # Calculate modal price
        df['modal_price'] = (df['Volume (Rs In Lakhs)'] * 100000) / df['Quantity'].replace(0, np.nan)
        df['modal_price'] = df['modal_price'].fillna(0).round(2)
        
        agmark_df = pd.DataFrame({
            'commodity': 'Groundnut',
            'variety': 'Bold',
            'market': 'Rajkot',
            'district': 'Rajkot',
            'state': 'Gujarat',
            'date': df['Date'],
            'modal_price': df['modal_price'],
            'min_price': (df['modal_price'] * 0.92).round(2),
            'max_price': (df['modal_price'] * 1.08).round(2),
            'arrivals': df['Quantity'],
            'volume_lakhs': df['Volume (Rs In Lakhs)'],
            'adtv': df['ADTV (Rs In Lakhs)'],
            'unit': 'Quintal'
        })
        
        # Filter valid data
        agmark_df = agmark_df[agmark_df['arrivals'] > 0].copy()
        
        return agmark_df.sort_values('date').reset_index(drop=True)
    
    def process_castor_monthly(self, filepath):
        """Process castor oil monthly data"""
        print(f"Processing {filepath.name}...")
        
        df = pd.read_csv(filepath)
        df['Date'] = df['Date'].apply(self.parse_date_flexible)
        df = df.dropna(subset=['Date'])
        
        # Clean numeric columns
        numeric_cols = ['Volume (Rs In Lakhs)', 'Quantity', 'ADTV (Rs In Lakhs)']
        for col in numeric_cols:
            df[col] = df[col].astype(str).str.replace(',', '').astype(float)
        
        df['modal_price'] = (df['Volume (Rs In Lakhs)'] * 100000) / df['Quantity'].replace(0, np.nan)
        df['modal_price'] = df['modal_price'].fillna(0).round(2)
        
        agmark_df = pd.DataFrame({
            'commodity': 'Castor Oil',
            'variety': 'Commercial',
            'market': 'Ahmedabad',
            'district': 'Ahmedabad',
            'state': 'Gujarat',
            'date': df['Date'],
            'modal_price': df['modal_price'],
            'min_price': (df['modal_price'] * 0.93).round(2),
            'max_price': (df['modal_price'] * 1.07).round(2),
            'arrivals': df['Quantity'],
            'volume_lakhs': df['Volume (Rs In Lakhs)'],
            'adtv': df['ADTV (Rs In Lakhs)'],
            'unit': 'Quintal'
        })
        
        agmark_df = agmark_df[agmark_df['arrivals'] > 0].copy()
        
        return agmark_df.sort_values('date').reset_index(drop=True)
    
    def process_groundnut_synthetic(self, filepath):
        """Process groundnut oil synthetic data"""
        print(f"Processing {filepath.name}...")
        
        df = pd.read_csv(filepath)
        
        # Parse date column (1-Jan-20 format)
        df['Date'] = pd.to_datetime(df['Date'], format='%d-%b-%y', errors='coerce')
        df = df.dropna(subset=['Date'])
        
        # Extract numeric columns (first 3 columns after Date)
        df['Volume'] = pd.to_numeric(df.iloc[:, 1], errors='coerce')
        df['Quantity'] = pd.to_numeric(df.iloc[:, 2], errors='coerce')
        df['ADTV'] = pd.to_numeric(df.iloc[:, 3], errors='coerce')
        
        df['modal_price'] = (df['Volume'] * 100000) / df['Quantity'].replace(0, np.nan)
        df['modal_price'] = df['modal_price'].fillna(0).round(2)
        
        agmark_df = pd.DataFrame({
            'commodity': 'Groundnut Oil',
            'variety': 'Filtered',
            'market': 'Rajkot',
            'district': 'Rajkot',
            'state': 'Gujarat',
            'date': df['Date'],
            'modal_price': df['modal_price'],
            'min_price': (df['modal_price'] * 0.94).round(2),
            'max_price': (df['modal_price'] * 1.06).round(2),
            'arrivals': df['Quantity'],
            'volume_lakhs': df['Volume'],
            'adtv': df['ADTV'],
            'unit': 'Quintal'
        })
        
        agmark_df = agmark_df[agmark_df['arrivals'] > 0].copy()
        
        return agmark_df.sort_values('date').reset_index(drop=True)
    
    def merge_all_datasets(self, datasets):
        """Merge all processed datasets"""
        print("\nMerging all datasets...")
        combined = pd.concat(datasets, ignore_index=True)
        combined = combined.sort_values(['commodity', 'date']).reset_index(drop=True)
        
        print(f"\nCombined dataset shape: {combined.shape}")
        print(f"Date range: {combined['date'].min()} to {combined['date'].max()}")
        print(f"Commodities: {combined['commodity'].unique()}")
        
        return combined
    
    def save_processed_data(self, df, filename):
        """Save processed data in multiple formats"""
        # CSV
        csv_path = self.output_dir / f"{filename}.csv"
        df.to_csv(csv_path, index=False)
        print(f"Saved: {csv_path}")
        
        # JSON
        json_path = self.output_dir / f"{filename}.json"
        df.to_json(json_path, orient='records', date_format='iso', indent=2)
        print(f"Saved: {json_path}")
        
        return csv_path, json_path
    
    def generate_summary_stats(self, df):
        """Generate summary statistics"""
        summary = {
            'total_records': len(df),
            'date_range': {
                'start': df['date'].min().strftime('%Y-%m-%d'),
                'end': df['date'].max().strftime('%Y-%m-%d'),
                'days': (df['date'].max() - df['date'].min()).days
            },
            'commodities': df['commodity'].value_counts().to_dict(),
            'markets': df['market'].value_counts().to_dict(),
            'states': df['state'].value_counts().to_dict(),
            'price_statistics': {
                commodity: {
                    'mean': float(group['modal_price'].mean().round(2)),
                    'median': float(group['modal_price'].median().round(2)),
                    'min': float(group['modal_price'].min().round(2)),
                    'max': float(group['modal_price'].max().round(2)),
                    'std': float(group['modal_price'].std().round(2))
                }
                for commodity, group in df.groupby('commodity')
            },
            'data_quality': {
                'missing_values': df.isnull().sum().to_dict(),
                'zero_prices': len(df[df['modal_price'] == 0]),
                'zero_arrivals': len(df[df['arrivals'] == 0])
            }
        }
        
        return summary


def main():
    """Main execution function"""
    print("=" * 60)
    print("AGMARK Oilseed Data Processor")
    print("=" * 60)
    
    # Define paths
    desktop_path = Path(r"c:\Users\HP\Desktop")
    output_path = Path(r"d:\FINAL PROJECT\TESTING-APP\ml-model\data\processed")
    
    processor = OilseedDataProcessor(desktop_path, output_path)
    
    datasets = []
    
    # Process each data file
    try:
        # Sunflower oil
        sunoil_df = processor.process_sunoil_data(desktop_path / "sunoil_data.csv")
        datasets.append(sunoil_df)
        processor.save_processed_data(sunoil_df, "sunflower_oil_processed")
    except Exception as e:
        print(f"Error processing sunflower oil data: {e}")
    
    try:
        # Groundnut
        groundnut_df = processor.process_groundnut_monthly(desktop_path / "Groundnut_data.csv")
        datasets.append(groundnut_df)
        processor.save_processed_data(groundnut_df, "groundnut_processed")
    except Exception as e:
        print(f"Error processing groundnut data: {e}")
    
    try:
        # Castor oil
        castor_df = processor.process_castor_monthly(desktop_path / "castoroil_data.csv")
        if len(castor_df) > 0:
            datasets.append(castor_df)
            processor.save_processed_data(castor_df, "castor_oil_processed")
    except Exception as e:
        print(f"Error processing castor oil data: {e}")
    
    try:
        # Groundnut oil synthetic
        groundnut_oil_df = processor.process_groundnut_synthetic(desktop_path / "groundnut_oil_synthetic_data.csv")
        datasets.append(groundnut_oil_df)
        processor.save_processed_data(groundnut_oil_df, "groundnut_oil_processed")
    except Exception as e:
        print(f"Error processing groundnut oil synthetic data: {e}")
    
    # Merge all datasets
    if datasets:
        combined_df = processor.merge_all_datasets(datasets)
        processor.save_processed_data(combined_df, "combined_oilseed_data")
        
        # Generate summary
        summary = processor.generate_summary_stats(combined_df)
        summary_path = output_path / "dataset_summary.json"
        with open(summary_path, 'w') as f:
            json.dump(summary, f, indent=2)
        print(f"\nSaved summary: {summary_path}")
        
        # Print summary
        print("\n" + "=" * 60)
        print("DATASET SUMMARY")
        print("=" * 60)
        print(f"Total Records: {summary['total_records']}")
        print(f"Date Range: {summary['date_range']['start']} to {summary['date_range']['end']}")
        print(f"Total Days: {summary['date_range']['days']}")
        print("\nCommodities:")
        for commodity, count in summary['commodities'].items():
            print(f"  - {commodity}: {count} records")
        print("\nPrice Statistics:")
        for commodity, stats in summary['price_statistics'].items():
            print(f"  {commodity}:")
            print(f"    Mean: ₹{stats['mean']:.2f} | Range: ₹{stats['min']:.2f} - ₹{stats['max']:.2f}")
    else:
        print("\nNo datasets were successfully processed.")
    
    print("\n" + "=" * 60)
    print("Processing complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
