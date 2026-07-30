// Node
import { readFile } from "fs/promises";
import path from "path";

// Response shape served to the client. Mirror this field-for-field in the
// app's `lib/types/` (there is no shared package — the contract is maintained
// by hand on both sides).
export interface Temperature {
  current: {
    time: string;
    interval: number;
    temperature_2m: number;
  };
  current_units: {
    time: string;
    interval: string;
    temperature_2m: string;
  };
  elevation: number;
  generationtime_ms: number;
  latitude: number;
  longitude: number;
  timezone: string;
  timezone_abbreviation: string;
  utc_offset_seconds: number;
}

export class DataService {
  private readonly dataPath: string;
  private temperatureCache: Temperature | null = null;

  constructor() {
    this.dataPath = path.resolve(__dirname, "../data");
  }

  // Generic JSON reader — resolve, read, parse. Reused by every method below.
  async read<T = unknown>(filename: string): Promise<T> {
    const file = await readFile(path.join(this.dataPath, filename), "utf-8");
    return JSON.parse(file) as T;
  }

  // Cache the parsed reading in a private field; return it on repeat calls.
  async temperature(): Promise<Temperature> {
    if (this.temperatureCache) return this.temperatureCache;
    this.temperatureCache = await this.read<Temperature>("temperature.json");
    return this.temperatureCache;
  }
}

// Singleton: the class carries the logic, the instance carries the cache.
export const DataStore = new DataService();
