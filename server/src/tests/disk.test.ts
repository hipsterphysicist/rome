// Service under test
import { DataService } from "@/lib/services/disk";

// The service layer is the primary test target: it reads, parses, and caches.
// Drive the class directly — no HTTP, no mounting the app.
describe("DataService.temperature", () => {
  it("reads the on-disk reading and returns the app-ready shape", async () => {
    const service = new DataService();
    const reading = await service.temperature();

    expect(reading.current.temperature_2m).toBe(98.4);
    expect(reading.current_units.temperature_2m).toBe("°F");
    expect(reading.latitude).toBe(30.26715);
  });

  it("caches the parsed reading — a second call returns the same instance", async () => {
    const service = new DataService();

    const first = await service.temperature();
    const second = await service.temperature();

    expect(second).toBe(first); // same reference: served from the cache
  });
});
