import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    previousCameraPos: [0, 0, 0],
    currentCameraPos: [0,0,0],
    focused: false,
}


// these are the reducers
const cameraSlice = createSlice({
  name: "camera",
  initialState,
  reducers: {
    SET_FOCUS_CAMERA: (state, action) => {
        // state.templateChosen = true;
        // state.template = action.payload.template;
        // state.template = action.payload.templateInteger;
    },
    SET_UNFOCUS_CAMERA:  (state, action) => {
    },
  }
});


// these are the actions
export const {SET_FOCUS_CAMERA, SET_UNFOCUS_CAMERA } = cameraSlice.actions

// export const selectTemplateChosen = (state) => state.template.templateChosen;
// export const selectTemplate = (state) => state.template.selectTemplate;
// export const selectTemplateInteger = (state) => state.template.selectTemplateInteger;

export default cameraSlice.reducer