// Hooks
import { createContext, useEffect } from "react";

// Store
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { dataActions } from "../store/features/data";

// Client
import { FetchTemperature } from "../client/api";

const TemperatureContext = createContext<number | undefined>(undefined);

export const DataProvider = () => {
  const temperature: number | undefined = useAppSelector(
    (state) => state.data.temperature
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetch = async () => {
      const temperature = await FetchTemperature();
      dispatch(dataActions.temperature(temperature.current.temperature_2m));
    };

    if (!temperature) {
      fetch();
    }
  }, [temperature, dispatch]);

  return <TemperatureContext.Provider value={temperature} />;
};
