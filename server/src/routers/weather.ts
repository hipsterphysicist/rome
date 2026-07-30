// Express
import express, { Request, Response } from "express";

// Services
import { DataStore } from "../lib/services/disk";

export const weather = express.Router();

weather.get("/current", async (req: Request, res: Response) => {
  try {
    const temperature = await DataStore.temperature();
    res.send(temperature);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});
