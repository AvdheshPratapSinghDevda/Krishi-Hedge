"""
Data Quality Validation for Oilseed Datasets
Comprehensive checks for data integrity and completeness
"""

import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime, timedelta
import json
from collections import defaultdict

class OilseedDataValidator:
    """Validate oilseed market data quality"""
    
    def __init__(self):
        self.validation_results = {
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'checks': {},
            'warnings': [],
            'errors': [],
            'summary': {}
        }
    
    def check_missing_values(self, df):
        """Check for missing values in critical columns"""
        print("Checking for missing values...")
        
        critical_cols = ['commodity', 'market', 'date', 'modal_price', 'arrivals']
        missing_info = {}
        
        for col in df.columns:
            missing_count = df[col].isnull().sum()
            missing_pct = (missing_count / len(df)) * 100
            
            if missing_count > 0:
                missing_info[col] = {
                    'count': int(missing_count),
                    'percentage': round(missing_pct, 2),
                    'is_critical': col in critical_cols
                }
                
                if col in critical_cols:
                    self.validation_results['errors'].append(
                        f"Missing values in critical column '{col}': {missing_count} ({missing_pct:.2f}%)"
                    )
                else:
                    self.validation_results['warnings'].append(
                        f"Missing values in '{col}': {missing_count} ({missing_pct:.2f}%)"
                    )
        
        self.validation_results['checks']['missing_values'] = missing_info
        return missing_info
    
    def check_date_continuity(self, df):
        """Check for gaps in date sequences by commodity and market"""
        print("Checking date continuity...")
        
        gaps_found = []
        
        for (commodity, market), group in df.groupby(['commodity', 'market']):
            group_sorted = group.sort_values('date')
            dates = pd.to_datetime(group_sorted['date'])
            
            # Find gaps > 7 days
            date_diffs = dates.diff()
            large_gaps = date_diffs[date_diffs > timedelta(days=7)]
            
            if len(large_gaps) > 0:
                for idx, gap in large_gaps.items():
                    gap_info = {
                        'commodity': commodity,
                        'market': market,
                        'gap_start': group_sorted.loc[idx-1, 'date'].strftime('%Y-%m-%d') if idx > 0 else 'N/A',
                        'gap_end': group_sorted.loc[idx, 'date'].strftime('%Y-%m-%d'),
                        'gap_days': gap.days
                    }
                    gaps_found.append(gap_info)
                    
                    if gap.days > 30:
                        self.validation_results['errors'].append(
                            f"Large date gap ({gap.days} days) in {commodity} - {market}"
                        )
        
        self.validation_results['checks']['date_gaps'] = {
            'total_gaps': len(gaps_found),
            'gaps': gaps_found[:10]  # Store first 10 gaps
        }
        
        return gaps_found
    
    def check_price_anomalies(self, df):
        """Detect price outliers and anomalies"""
        print("Checking for price anomalies...")
        
        anomalies = []
        
        for commodity, group in df.groupby('commodity'):
            # Statistical outlier detection (IQR method)
            Q1 = group['modal_price'].quantile(0.25)
            Q3 = group['modal_price'].quantile(0.75)
            IQR = Q3 - Q1
            
            lower_bound = Q1 - 3 * IQR
            upper_bound = Q3 + 3 * IQR
            
            outliers = group[
                (group['modal_price'] < lower_bound) | 
                (group['modal_price'] > upper_bound)
            ]
            
            if len(outliers) > 0:
                anomaly_info = {
                    'commodity': commodity,
                    'outlier_count': len(outliers),
                    'expected_range': [round(lower_bound, 2), round(upper_bound, 2)],
                    'outlier_prices': outliers['modal_price'].tolist()[:5]
                }
                anomalies.append(anomaly_info)
                
                self.validation_results['warnings'].append(
                    f"{commodity}: {len(outliers)} price outliers detected"
                )
        
        self.validation_results['checks']['price_anomalies'] = {
            'commodities_with_anomalies': len(anomalies),
            'details': anomalies
        }
        
        return anomalies
    
    def check_zero_values(self, df):
        """Check for zero prices and arrivals"""
        print("Checking for zero values...")
        
        zero_prices = len(df[df['modal_price'] == 0])
        zero_arrivals = len(df[df['arrivals'] == 0])
        
        zero_info = {
            'zero_prices': {
                'count': int(zero_prices),
                'percentage': round((zero_prices / len(df)) * 100, 2)
            },
            'zero_arrivals': {
                'count': int(zero_arrivals),
                'percentage': round((zero_arrivals / len(df)) * 100, 2)
            }
        }
        
        if zero_prices > len(df) * 0.1:  # More than 10%
            self.validation_results['warnings'].append(
                f"High number of zero prices: {zero_prices} ({zero_info['zero_prices']['percentage']}%)"
            )
        
        self.validation_results['checks']['zero_values'] = zero_info
        return zero_info
    
    def check_price_consistency(self, df):
        """Check min <= modal <= max price consistency"""
        print("Checking price consistency...")
        
        inconsistent_rows = df[
            (df['min_price'] > df['modal_price']) | 
            (df['max_price'] < df['modal_price'])
        ]
        
        consistency_info = {
            'inconsistent_rows': len(inconsistent_rows),
            'percentage': round((len(inconsistent_rows) / len(df)) * 100, 2)
        }
        
        if len(inconsistent_rows) > 0:
            self.validation_results['errors'].append(
                f"Price consistency violation: {len(inconsistent_rows)} rows"
            )
            
            # Sample inconsistencies
            consistency_info['samples'] = inconsistent_rows[
                ['commodity', 'market', 'date', 'min_price', 'modal_price', 'max_price']
            ].head(5).to_dict('records')
        
        self.validation_results['checks']['price_consistency'] = consistency_info
        return consistency_info
    
    def check_data_coverage(self, df):
        """Check data coverage across commodities and markets"""
        print("Checking data coverage...")
        
        coverage = {
            'total_records': len(df),
            'commodities': {},
            'markets': {},
            'date_range': {
                'start': df['date'].min().strftime('%Y-%m-%d'),
                'end': df['date'].max().strftime('%Y-%m-%d'),
                'total_days': (pd.to_datetime(df['date'].max()) - pd.to_datetime(df['date'].min())).days
            }
        }
        
        # By commodity
        for commodity, group in df.groupby('commodity'):
            coverage['commodities'][commodity] = {
                'records': len(group),
                'markets': group['market'].nunique(),
                'date_range': {
                    'start': group['date'].min().strftime('%Y-%m-%d'),
                    'end': group['date'].max().strftime('%Y-%m-%d')
                }
            }
        
        # By market
        for market, group in df.groupby('market'):
            coverage['markets'][market] = {
                'records': len(group),
                'commodities': group['commodity'].nunique(),
                'date_range': {
                    'start': group['date'].min().strftime('%Y-%m-%d'),
                    'end': group['date'].max().strftime('%Y-%m-%d')
                }
            }
        
        self.validation_results['checks']['data_coverage'] = coverage
        return coverage
    
    def check_statistical_sanity(self, df):
        """Check if statistical properties make sense"""
        print("Checking statistical sanity...")
        
        stats = {}
        
        for commodity, group in df.groupby('commodity'):
            price_mean = group['modal_price'].mean()
            price_std = group['modal_price'].std()
            cv = (price_std / price_mean) * 100 if price_mean > 0 else 0
            
            stats[commodity] = {
                'price_mean': round(price_mean, 2),
                'price_std': round(price_std, 2),
                'coefficient_of_variation': round(cv, 2),
                'price_range': [
                    round(group['modal_price'].min(), 2),
                    round(group['modal_price'].max(), 2)
                ],
                'avg_arrivals': round(group['arrivals'].mean(), 2)
            }
            
            # High volatility warning
            if cv > 50:
                self.validation_results['warnings'].append(
                    f"{commodity}: High price volatility (CV={cv:.2f}%)"
                )
        
        self.validation_results['checks']['statistical_sanity'] = stats
        return stats
    
    def check_duplicate_records(self, df):
        """Check for duplicate records"""
        print("Checking for duplicates...")
        
        duplicates = df.duplicated(subset=['commodity', 'market', 'date'], keep=False)
        duplicate_count = duplicates.sum()
        
        duplicate_info = {
            'duplicate_rows': int(duplicate_count),
            'percentage': round((duplicate_count / len(df)) * 100, 2)
        }
        
        if duplicate_count > 0:
            self.validation_results['warnings'].append(
                f"Duplicate records found: {duplicate_count}"
            )
            
            # Sample duplicates
            duplicate_info['samples'] = df[duplicates][
                ['commodity', 'market', 'date', 'modal_price']
            ].head(5).to_dict('records')
        
        self.validation_results['checks']['duplicates'] = duplicate_info
        return duplicate_info
    
    def validate_dataset(self, df):
        """Run all validation checks"""
        print("\n" + "=" * 60)
        print("DATA VALIDATION PIPELINE")
        print("=" * 60)
        
        # Ensure date is datetime
        df['date'] = pd.to_datetime(df['date'])
        
        # Run all checks
        self.check_missing_values(df)
        self.check_date_continuity(df)
        self.check_price_anomalies(df)
        self.check_zero_values(df)
        self.check_price_consistency(df)
        self.check_data_coverage(df)
        self.check_statistical_sanity(df)
        self.check_duplicate_records(df)
        
        # Generate summary
        self.validation_results['summary'] = {
            'total_checks': len(self.validation_results['checks']),
            'total_errors': len(self.validation_results['errors']),
            'total_warnings': len(self.validation_results['warnings']),
            'overall_status': 'PASS' if len(self.validation_results['errors']) == 0 else 'FAIL'
        }
        
        print("\n" + "=" * 60)
        print("VALIDATION SUMMARY")
        print("=" * 60)
        print(f"Status: {self.validation_results['summary']['overall_status']}")
        print(f"Errors: {self.validation_results['summary']['total_errors']}")
        print(f"Warnings: {self.validation_results['summary']['total_warnings']}")
        print("=" * 60)
        
        return self.validation_results
    
    def save_validation_report(self, output_dir, filename='validation_report'):
        """Save validation report"""
        output_path = Path(output_dir)
        
        # JSON report
        json_path = output_path / f"{filename}.json"
        with open(json_path, 'w') as f:
            json.dump(self.validation_results, f, indent=2)
        print(f"\nSaved: {json_path}")
        
        # Text report
        txt_path = output_path / f"{filename}.txt"
        with open(txt_path, 'w', encoding='utf-8') as f:
            f.write("=" * 80 + "\n")
            f.write("OILSEED DATA VALIDATION REPORT\n")
            f.write("=" * 80 + "\n")
            f.write(f"Timestamp: {self.validation_results['timestamp']}\n")
            f.write(f"Status: {self.validation_results['summary']['overall_status']}\n\n")
            
            f.write(f"Errors: {self.validation_results['summary']['total_errors']}\n")
            for error in self.validation_results['errors']:
                f.write(f"  ❌ {error}\n")
            
            f.write(f"\nWarnings: {self.validation_results['summary']['total_warnings']}\n")
            for warning in self.validation_results['warnings']:
                f.write(f"  ⚠️  {warning}\n")
            
            f.write("\n" + "=" * 80 + "\n")
            f.write("DETAILED CHECKS\n")
            f.write("=" * 80 + "\n")
            
            for check_name, check_data in self.validation_results['checks'].items():
                f.write(f"\n{check_name.upper().replace('_', ' ')}\n")
                f.write("-" * 80 + "\n")
                f.write(json.dumps(check_data, indent=2) + "\n")
        
        print(f"Saved: {txt_path}")
        
        return json_path, txt_path


def main():
    """Main execution function"""
    print("=" * 60)
    print("Oilseed Data Validation")
    print("=" * 60)
    
    # Load data
    data_path = Path(r"d:\FINAL PROJECT\TESTING-APP\ml-model\data\processed")
    combined_file = data_path / "combined_oilseed_data.csv"
    
    if not combined_file.exists():
        print(f"Error: {combined_file} not found!")
        print("Please run data_processor.py first.")
        return
    
    print(f"\nLoading data from: {combined_file}")
    df = pd.read_csv(combined_file)
    print(f"Loaded {len(df)} records")
    
    # Validate
    validator = OilseedDataValidator()
    results = validator.validate_dataset(df)
    
    # Save report
    validator.save_validation_report(data_path)
    
    # Display errors and warnings
    if results['errors']:
        print("\n❌ ERRORS:")
        for error in results['errors']:
            print(f"  - {error}")
    
    if results['warnings']:
        print("\n⚠️  WARNINGS:")
        for warning in results['warnings']:
            print(f"  - {warning}")
    
    print("\n" + "=" * 60)
    print("Validation complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
