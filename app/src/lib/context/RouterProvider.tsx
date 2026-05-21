// React Router
import {
  createBrowserRouter,
  RouterProvider as ReactRouter,
} from "react-router";

// Components
import { App } from "@/app/App.tsx";
import { LandingPage } from "@/app/components/LandingPage";
import { About } from "@/app/components/About";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <LandingPage />,
      },
      {
        path: "/about",
        element: <About />,
      },
    ],
  },
]);

export const RouterProvider = () => {
  return <ReactRouter router={router} />;
};
