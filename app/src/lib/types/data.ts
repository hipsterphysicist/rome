export type TemperatureT = {
    current: {
        time: Date;
        interval: number;
        temperature_2m: number;
    },
    current_units: {
        time: string;
        interval: "seconds" | "minutes" | "hours";
        temperature_2m: "°F" | "°C";
    };
    elevation: number;
    generationtime_ms: number;
    latitude: number;
    longitude: number;
    timezone: string;
    timezone_abbreviation: string;
    utc_offset_seconds: number;
}