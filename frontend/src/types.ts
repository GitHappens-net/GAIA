export interface Node {
  node_id: number;
  temp: number;
  humidity: number;
  moisture: number;
  Nlevel: number;
  Plevel: number;
  Klevel: number;
  is_open: boolean;      // actual pump state reported by ESP
  sprinkler_status: boolean; // command sent to ESP
  last_seen: number; // Unix timestamp (seconds)
}

