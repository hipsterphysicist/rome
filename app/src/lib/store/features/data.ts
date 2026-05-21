// Redux
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type DataState = {
  string: string | undefined;
  temperature: number | undefined;
};

const initialState: DataState = {
    string: "Atomic Semi",
    temperature: undefined
};

const dataSlice = createSlice({
  name: "data",
  initialState: initialState,
  reducers: {
    string: (state, action: PayloadAction<string>) => {
      return { ...state, string: action.payload };
    },
    temperature: (state, action: PayloadAction<number>) => {
      return { ...state, temperature: action.payload };
    }
  },
});

export const dataActions = dataSlice.actions;

export default dataSlice.reducer;