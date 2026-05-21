// Providers
import { StrictMode } from "react";
import { RouterProvider } from "./RouterProvider";
import { StoreProvider } from "./StoreProvider";
import { DataProvider } from "./DataProvider";

export const RootProvider = () => {
  return (
    <StrictMode>
      <StoreProvider>
        <RouterProvider />
        <DataProvider />
      </StoreProvider>
    </StrictMode>
  );
};
