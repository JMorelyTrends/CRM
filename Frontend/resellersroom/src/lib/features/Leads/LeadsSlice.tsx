import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { labeltype,Task } from "@/app/Components/Small comps/Types";

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

interface MergeState {
  showMergeConfirm: boolean;
  showMergePopup: boolean;
  mergeTask: any | null;
  mergeLineData: any[];
  Mtasks:Task[]|null
}

const initialMergeState: MergeState = {
  showMergeConfirm: false,
  showMergePopup: false,
  mergeTask: null,
  mergeLineData: [],
  Mtasks:null,
};

const mergeSlice = createSlice({
  name: "mergeLeads",
  initialState: initialMergeState,
  reducers: {
    openMergeConfirm: (state, action: PayloadAction<any>) => {
      state.showMergeConfirm = true;
      state.mergeTask = action.payload;
    },
    closeMergeConfirm: (state) => {
      state.showMergeConfirm = false;
    },
    openMergePopup: (state, action: PayloadAction<any[]>) => {
      state.showMergePopup = true;
      state.mergeLineData = action.payload;
    },
    closeMergePopup: (state) => {
      state.showMergePopup = false;
      state.mergeLineData = [];
    },
    Addtasks:(state,action)=>{
     state.Mtasks=action.payload
    }
  },
});

export const { openMergeConfirm, closeMergeConfirm, openMergePopup, closeMergePopup,Addtasks } = mergeSlice.actions;
export const mergeLeadsReducer = mergeSlice.reducer;
