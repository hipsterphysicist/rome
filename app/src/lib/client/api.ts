// Types
import { type TemperatureT } from "../types/data";

export const FetchTemperature = async (): Promise<TemperatureT> => {
    /**
     * Returns the weather in Austin
     */

    const params = new URLSearchParams({
        latitude: "30.26715",
        longitude: "-97.74306",
        current: "temperature_2m",
        temperature_units: "fahrenheit",
    })
    
    const data: TemperatureT = await fetch(
        `https://api.open-meteo.com/v1/forecast?${params}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        },
    ).then(async (response) => {
        return await response.json();
    })

    return data;
}