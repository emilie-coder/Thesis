import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    nonIndexStateChosen: false,
    nonIndexState: '',
}


// these are the reducers
const editorSlice = createSlice({
  name: "edit",
  initialState,
  reducers: {
    SET_EDITOR_STATE: (state, action) => {
        state.nonIndexStateChosen =  true;
        state.nonIndexState = action.payload.state;
    },
    REMOVE_EDITOR_STATE: (state, action) => {
        state.nonIndexStateChosen =  false;
        state.nonIndexState = '';
    }
  }
});


// these are the actions
export const {SET_EDITOR_STATE, REMOVE_EDITOR_STATE} = editorSlice.actions

export const selectNonIndexStateBool = (state) => state.edit.nonIndexStateChosen;
export const selectNonIndexState = (state) => state.edit.nonIndexState;

export default editorSlice.reducer