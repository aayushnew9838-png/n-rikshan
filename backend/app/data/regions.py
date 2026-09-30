import pandas as pd
from app.inference.loader import get_reference_data
_regions_cache: list[dict] | None = None

def get_regions() -> list[dict]:
    global _regions_cache
    if _regions_cache is not None:
        return _regions_cache
    ref_data = get_reference_data()
    if ref_data is None or ref_data.empty:
        _regions_cache = [
            {'region_id': '1253405', 'name': 'Delhi NCR', 'lat': 28.6139, 'lon': 77.209, 'admin1': 'National Capital Territory of Delhi'},
            {'region_id': '1255364', 'name': 'Surat', 'lat': 21.1959, 'lon': 72.8302, 'admin1': 'Gujarat'},
            {'region_id': '1257629', 'name': 'Salem', 'lat': 11.6538, 'lon': 78.1554, 'admin1': 'Tamil Nadu'},
            {'region_id': 'REG_MUMBAI', 'name': 'Mumbai', 'lat': 19.076, 'lon': 72.8777, 'admin1': 'Maharashtra'},
            {'region_id': 'REG_KOLKATA', 'name': 'Kolkata', 'lat': 22.5726, 'lon': 88.3639, 'admin1': 'West Bengal'},
            {'region_id': 'REG_CHENNAI', 'name': 'Chennai', 'lat': 13.0827, 'lon': 80.2707, 'admin1': 'Tamil Nadu'},
            {'region_id': 'REG_BENGALURU', 'name': 'Bengaluru', 'lat': 12.9716, 'lon': 77.5946, 'admin1': 'Karnataka'},
            {'region_id': 'REG_HYDERABAD', 'name': 'Hyderabad', 'lat': 17.385, 'lon': 78.4867, 'admin1': 'Telangana'},
            {'region_id': 'REG_AHMEDABAD', 'name': 'Ahmedabad', 'lat': 23.0225, 'lon': 72.5714, 'admin1': 'Gujarat'},
            {'region_id': 'REG_JAIPUR', 'name': 'Jaipur', 'lat': 26.9124, 'lon': 75.7873, 'admin1': 'Rajasthan'},
            {'region_id': 'REG_LUCKNOW', 'name': 'Lucknow', 'lat': 26.8467, 'lon': 80.9462, 'admin1': 'Uttar Pradesh'},
            {'region_id': 'REG_BHOPAL', 'name': 'Bhopal', 'lat': 23.2599, 'lon': 77.4126, 'admin1': 'Madhya Pradesh'},
            {'region_id': 'REG_PATNA', 'name': 'Patna', 'lat': 25.5941, 'lon': 85.1376, 'admin1': 'Bihar'},
            {'region_id': 'REG_GUWAHATI', 'name': 'Guwahati', 'lat': 26.1445, 'lon': 91.7362, 'admin1': 'Assam'},
            {'region_id': 'REG_BHUBANESWAR', 'name': 'Bhubaneswar', 'lat': 20.2961, 'lon': 85.8245, 'admin1': 'Odisha'},
            {'region_id': 'REG_PUNE', 'name': 'Pune', 'lat': 18.5204, 'lon': 73.8567, 'admin1': 'Maharashtra'},
            {'region_id': 'REG_NAGPUR', 'name': 'Nagpur', 'lat': 21.1458, 'lon': 79.0882, 'admin1': 'Maharashtra'},
            {'region_id': 'REG_VISAKHAPATNAM', 'name': 'Visakhapatnam', 'lat': 17.6868, 'lon': 83.2185, 'admin1': 'Andhra Pradesh'},
            {'region_id': 'REG_SRINAGAR', 'name': 'Srinagar', 'lat': 34.0837, 'lon': 74.7973, 'admin1': 'Jammu and Kashmir'},
            {'region_id': 'REG_SHIMLA', 'name': 'Shimla', 'lat': 31.1048, 'lon': 77.1734, 'admin1': 'Himachal Pradesh'},
            {'region_id': 'REG_LEH', 'name': 'Leh', 'lat': 34.1526, 'lon': 77.5771, 'admin1': 'Ladakh'},
            {'region_id': 'REG_TRIVANDRUM', 'name': 'Thiruvananthapuram', 'lat': 8.5241, 'lon': 76.9366, 'admin1': 'Kerala'},
            {'region_id': 'REG_CHANDIGARH', 'name': 'Chandigarh', 'lat': 30.7333, 'lon': 76.7794, 'admin1': 'Chandigarh'},
            {'region_id': 'REG_RAIPUR', 'name': 'Raipur', 'lat': 21.2514, 'lon': 81.6296, 'admin1': 'Chhattisgarh'},
            {'region_id': 'REG_RANCHI', 'name': 'Ranchi', 'lat': 23.3441, 'lon': 85.3096, 'admin1': 'Jharkhand'},
            {'region_id': 'REG_DEHRADUN', 'name': 'Dehradun', 'lat': 30.3165, 'lon': 78.0322, 'admin1': 'Uttarakhand'},
            {'region_id': 'REG_SHILLONG', 'name': 'Shillong', 'lat': 25.5788, 'lon': 91.8933, 'admin1': 'Meghalaya'},
            {'region_id': 'REG_AIZAWL', 'name': 'Aizawl', 'lat': 23.7271, 'lon': 92.7176, 'admin1': 'Mizoram'},
            {'region_id': 'REG_IMPHAL', 'name': 'Imphal', 'lat': 24.817, 'lon': 93.9368, 'admin1': 'Manipur'},
            {'region_id': 'REG_AGARTALA', 'name': 'Agartala', 'lat': 23.8315, 'lon': 91.2868, 'admin1': 'Tripura'},
            {'region_id': 'REG_KOHIMA', 'name': 'Kohima', 'lat': 25.6751, 'lon': 94.1086, 'admin1': 'Nagaland'},
            {'region_id': 'REG_PUDUCHERRY', 'name': 'Puducherry', 'lat': 11.9416, 'lon': 79.8083, 'admin1': 'Puducherry'},
            {'region_id': 'REG_PORTBLAIR', 'name': 'Port Blair', 'lat': 11.6234, 'lon': 92.7265, 'admin1': 'Andaman and Nicobar'},
            {'region_id': 'REG_KOCHI', 'name': 'Kochi', 'lat': 9.9312, 'lon': 76.2673, 'admin1': 'Kerala'},
            {'region_id': 'REG_INDORE', 'name': 'Indore', 'lat': 22.7196, 'lon': 75.8577, 'admin1': 'Madhya Pradesh'},
        ]
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
