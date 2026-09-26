import pandas as pd
from app.inference.loader import get_reference_data
_regions_cache: list[dict] | None = None

def get_regions() -> list[dict]:
    global _regions_cache
    if _regions_cache is not None:
        return _regions_cache
    ref_data = get_reference_data()
    if ref_data is None or ref_data.empty:
        _regions_cache = [{'region_id': 'REG001', 'name': 'North Region', 'lat': 35.0, 'lon': -100.0}, {'region_id': 'REG002', 'name': 'South Region', 'lat': 30.0, 'lon': -95.0}, {'region_id': 'REG003', 'name': 'East Region', 'lat': 32.0, 'lon': -85.0}, {'region_id': 'REG004', 'name': 'West Region', 'lat': 34.0, 'lon': -110.0}]
        return _regions_cache
    if 'region_id' in ref_data.columns:
        region_cols = ['region_id']
        for col in ['name', 'lat', 'lon', 'latitude', 'longitude']:
            if col in ref_data.columns:
                region_cols.append(col)
        regions_df = ref_data[region_cols].drop_duplicates(subset=['region_id'])
        regions_list = []
        for _, row in regions_df.iterrows():
            region = {'region_id': row['region_id'], 'name': row.get('name', row['region_id']), 'lat': float(row.get('lat', row.get('latitude', 0.0))), 'lon': float(row.get('lon', row.get('longitude', 0.0)))}
            regions_list.append(region)
        _regions_cache = regions_list
    else:
        _regions_cache = []
    return _regions_cache

def get_region_by_id(region_id: str) -> dict | None:
    for region in get_regions():
        if region['region_id'] == region_id:
            return region
    return None

def region_exists(region_id: str) -> bool:
    return get_region_by_id(region_id) is not None

def get_reference_rows(region_id: str, lead_day: int) -> pd.DataFrame:
    ref_data = get_reference_data()
    if ref_data is None or ref_data.empty:
        return pd.DataFrame()
    mask = (ref_data['region_id'] == region_id) & (ref_data['lead_day'] == lead_day)
    return ref_data[mask].copy()
