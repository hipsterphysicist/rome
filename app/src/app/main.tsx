// React
import { createRoot } from "react-dom/client";

// Styles
import "./index.css";

// Provider
import { RootProvider } from "../lib/context/RootProvider";

createRoot(document.getElementById("root")!).render(<RootProvider />);
