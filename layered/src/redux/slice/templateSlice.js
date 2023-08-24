import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    templateChosen: false,
    template: 'blank',
    templateInteger: 0,
}


// these are the reducers
const templateSlice = createSlice({
  name: "template",
  initialState,
  reducers: {
    SET_ACTIVE_TEMPLATE: (state, action) => {
        state.templateChosen = true;
        state.template = action.payload.template;
        state.template = action.payload.templateInteger;
    },
  }
});


// these are the actions
export const {SET_ACTIVE_TEMPLATE} = templateSlice.actions

export const selectTemplateChosen = (state) => state.template.templateChosen;
export const selectTemplate = (state) => state.template.selectTemplate;
export const selectTemplateInteger = (state) => state.template.selectTemplateInteger;

export default templateSlice.reducer