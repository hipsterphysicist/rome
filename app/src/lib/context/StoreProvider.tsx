// Hooks
import { useMemo } from "react";

// Store
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "@/lib/store/store";

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const store: AppStore = useMemo(() => makeStore(), []);

  return <Provider store={store}>{children}</Provider>;
};
