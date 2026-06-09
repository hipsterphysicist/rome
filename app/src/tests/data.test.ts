import reducer, { dataActions } from "@/lib/store/features/data";

const initialState = {
  string: "ROME",
  temperature: undefined,
};

describe("data slice", () => {
  it("returns the initial state", () => {
    const state = reducer(undefined, { type: "unknown" });
    expect(state).toEqual(initialState);
  });

  it("sets the string value", () => {
    const state = reducer(initialState, dataActions.string("hello"));
    expect(state.string).toBe("hello");
    expect(state.temperature).toBeUndefined();
  });

  it("sets the temperature value", () => {
    const state = reducer(initialState, dataActions.temperature(72.5));
    expect(state.temperature).toBe(72.5);
    expect(state.string).toBe("ROME");
  });

  it("does not lose existing state on partial updates", () => {
    const withTemp = reducer(initialState, dataActions.temperature(85));
    const withBoth = reducer(withTemp, dataActions.string("updated"));
    expect(withBoth).toEqual({ string: "updated", temperature: 85 });
  });
});
