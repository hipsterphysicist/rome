// HTTP driver
import request from "supertest";

// App under test — imported without listening (index.ts only listens when run
// directly, see its require.main guard)
import { app } from "@/index";

// Integration test for the transport layer: drive the real Express app
// in-process and assert on the HTTP response.
describe("GET /weather/current", () => {
  it("responds 200 with the temperature reading", async () => {
    const res = await request(app).get("/weather/current");

    expect(res.status).toBe(200);
    expect(res.body.current.temperature_2m).toBe(98.4);
    expect(res.body.current_units.temperature_2m).toBe("°F");
  });
});

describe("GET /healthcheck", () => {
  it("responds 200 for smoke checks", async () => {
    const res = await request(app).get("/healthcheck");

    expect(res.status).toBe(200);
  });
});
