import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    templateChosen: false,
    template: 'blank',
}


// these are the reducers
const templateSlice = createSlice({
  name: "template",
  initialState,
  reducers: {
    SET_ACTIVE_TEMPLATE: (state, action) => {
        state.templateChosen = true;
        state.template = action.payload.template;
    },
  }
});


// these are the actions
export const {SET_ACTIVE_TEMPLATE} = templateSlice.actions

export const selectTemplateChosen = (state) => state.template.templateChosen;
export const selectTemplate = (state) => state.template.selectTemplate;

export default templateSlice.reducer