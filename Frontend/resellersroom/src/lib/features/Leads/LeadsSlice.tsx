import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { labeltype } from "@/app/Components/Small comps/Types";

interface LabelState {
  labels: labeltype[];
}

const initialState: LabelState = {
  labels: [],
};

const labelSlice = createSlice({
  name: "labels",
  initialState,
  reducers: {
    setLabels: (state, action: PayloadAction<labeltype[]>) => {
      console.log("okkkkh")
      state.labels = action.payload;
    },
    addLabel: (state, action: PayloadAction<labeltype[]>) => {
      state.labels=action.payload;
    },
    updateLabel: (state, action: PayloadAction<labeltype>) => {
      const index = state.labels.findIndex(label => label._id === action.payload._id);
      if (index !== -1) {
        state.labels[index] = action.payload;
      }
    },
    deleteLabel: (state, action: PayloadAction<string>) => {
      state.labels = state.labels.filter(label => label._id !== action.payload);
    },
  },
});

export const { setLabels, addLabel, updateLabel, deleteLabel } = labelSlice.actions;

export default labelSlice.reducer;
