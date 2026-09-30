/**
 * DEMO REGION CATALOGUE.
 *
 * Coordinates are real geographic coordinates for Indian state / city locations.
 * `loc_id` values marked `verified: true` are the actual location identifiers that
 * appear in the Nirikshan ML artifacts (`ml/reports/case_studies.json`,
 * `ml/artifacts/demo_prediction.json`, `docs/ML_API_CONTRACT.md`).
 * Other ids use the `REG_*` namespace because the repository does not publish a
 * geonames mapping for them — they are NOT fabricated geonames ids.
 *
 * This catalogue is only ever used as the offline snapshot when the analysis
 * service is unreachable; when the service responds, `/forecast/regions` is
 * always preferred.
 */
import type { RegionInfo } from '../../types';

export interface DemoRegion extends RegionInfo {
  /** Real regional base bust rate from `evaluation_summary.json` when available. */
  regionalBaseRate?: number;
  verified?: boolean;
}

export const DEMO_REGIONS: DemoRegion[] = [
  { region_id: '1253405', name: 'Delhi NCR', lat: 28.6139, lon: 77.209, admin1: 'National Capital Territory of Delhi', verified: true },
  { region_id: '1255364', name: 'Surat', lat: 21.1959, lon: 72.8302, admin1: 'Gujarat', verified: true, regionalBaseRate: 0.3882865646258503 },
  { region_id: '1257629', name: 'Salem', lat: 11.6538, lon: 78.1554, admin1: 'Tamil Nadu', verified: true, regionalBaseRate: 0.21758078231292516 },
  { region_id: 'REG_MUMBAI', name: 'Mumbai', lat: 19.076, lon: 72.8777, admin1: 'Maharashtra' },
  { region_id: 'REG_KOLKATA', name: 'Kolkata', lat: 22.5726, lon: 88.3639, admin1: 'West Bengal' },
  { region_id: 'REG_CHENNAI', name: 'Chennai', lat: 13.0827, lon: 80.2707, admin1: 'Tamil Nadu', regionalBaseRate: 0.21758078231292516 },
  { region_id: 'REG_BENGALURU', name: 'Bengaluru', lat: 12.9716, lon: 77.5946, admin1: 'Karnataka' },
  { region_id: 'REG_HYDERABAD', name: 'Hyderabad', lat: 17.385, lon: 78.4867, admin1: 'Telangana' },
  { region_id: 'REG_AHMEDABAD', name: 'Ahmedabad', lat: 23.0225, lon: 72.5714, admin1: 'Gujarat', regionalBaseRate: 0.3882865646258503 },
  { region_id: 'REG_JAIPUR', name: 'Jaipur', lat: 26.9124, lon: 75.7873, admin1: 'Rajasthan' },
  { region_id: 'REG_LUCKNOW', name: 'Lucknow', lat: 26.8467, lon: 80.9462, admin1: 'Uttar Pradesh' },
  { region_id: 'REG_BHOPAL', name: 'Bhopal', lat: 23.2599, lon: 77.4126, admin1: 'Madhya Pradesh' },
  { region_id: 'REG_PATNA', name: 'Patna', lat: 25.5941, lon: 85.1376, admin1: 'Bihar' },
  { region_id: 'REG_GUWAHATI', name: 'Guwahati', lat: 26.1445, lon: 91.7362, admin1: 'Assam' },
  { region_id: 'REG_BHUBANESWAR', name: 'Bhubaneswar', lat: 20.2961, lon: 85.8245, admin1: 'Odisha' },
  { region_id: 'REG_PUNE', name: 'Pune', lat: 18.5204, lon: 73.8567, admin1: 'Maharashtra' },
  { region_id: 'REG_NAGPUR', name: 'Nagpur', lat: 21.1458, lon: 79.0882, admin1: 'Maharashtra' },
  { region_id: 'REG_VISAKHAPATNAM', name: 'Visakhapatnam', lat: 17.6868, lon: 83.2185, admin1: 'Andhra Pradesh' },
  { region_id: 'REG_SRINAGAR', name: 'Srinagar', lat: 34.0837, lon: 74.7973, admin1: 'Jammu and Kashmir' },
  { region_id: 'REG_SHIMLA', name: 'Shimla', lat: 31.1048, lon: 77.1734, admin1: 'Himachal Pradesh' },
  { region_id: 'REG_LEH', name: 'Leh', lat: 34.1526, lon: 77.5771, admin1: 'Ladakh' },
  { region_id: 'REG_TRIVANDRUM', name: 'Thiruvananthapuram', lat: 8.5241, lon: 76.9366, admin1: 'Kerala' },
  { region_id: 'REG_CHANDIGARH', name: 'Chandigarh', lat: 30.7333, lon: 76.7794, admin1: 'Chandigarh' },
  { region_id: 'REG_RAIPUR', name: 'Raipur', lat: 21.2514, lon: 81.6296, admin1: 'Chhattisgarh' },
  { region_id: 'REG_RANCHI', name: 'Ranchi', lat: 23.3441, lon: 85.3096, admin1: 'Jharkhand' },
  { region_id: 'REG_DEHRADUN', name: 'Dehradun', lat: 30.3165, lon: 78.0322, admin1: 'Uttarakhand' },
  { region_id: 'REG_SHILLONG', name: 'Shillong', lat: 25.5788, lon: 91.8933, admin1: 'Meghalaya' },
  { region_id: 'REG_AIZAWL', name: 'Aizawl', lat: 23.7271, lon: 92.7176, admin1: 'Mizoram' },
  { region_id: 'REG_IMPHAL', name: 'Imphal', lat: 24.817, lon: 93.9368, admin1: 'Manipur' },
  { region_id: 'REG_AGARTALA', name: 'Agartala', lat: 23.8315, lon: 91.2868, admin1: 'Tripura' },
  { region_id: 'REG_KOHIMA', name: 'Kohima', lat: 25.6751, lon: 94.1086, admin1: 'Nagaland' },
  { region_id: 'REG_PUDUCHERRY', name: 'Puducherry', lat: 11.9416, lon: 79.8083, admin1: 'Puducherry' },
  { region_id: 'REG_PORTBLAIR', name: 'Port Blair', lat: 11.6234, lon: 92.7265, admin1: 'Andaman and Nicobar' },
  { region_id: 'REG_KOCHI', name: 'Kochi', lat: 9.9312, lon: 76.2673, admin1: 'Kerala' },
  { region_id: 'REG_INDORE', name: 'Indore', lat: 22.7196, lon: 75.8577, admin1: 'Madhya Pradesh' },
];
