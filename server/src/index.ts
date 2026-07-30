// Express
import express, { Express, Request, Response } from "express";

// Middleware
import cors from "cors";

// Routers
import { weather } from "./routers/weather";

export const app: Express = express();

app.use(cors());
app.use(express.json());
app.use("/weather", weather);

app.get("/healthcheck", (req: Request, res: Response) => {
  res.send("Hello, world!");
});

// Only listen when run directly (`yarn dev`/`start`), so tests can import
// `app` and drive it in-process without opening a port.
if (require.main === module) {
  const host = "0.0.0.0";
  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`Server is running on ${host}:${port}`);
  });
}
