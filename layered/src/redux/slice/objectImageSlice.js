import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    objectChosen: false,
    objectName: 'none chosen',
    objectID: 0,
    objectMaterial: 'string',
}


// these are the reducers
const objectImageSlice = createSlice({
  name: "objectImage",
  initialState,
  reducers: {
    SET_OBJECT_IMAGE: (state, action) => {
        state.objectChosen = true;
        state.objectName = action.payload.objectName;
        state.objectID = action.payload.objectID;
        state.objectMaterial = action.payload.objectMaterial;
    },
  }
});


// these are the actions
export const {SET_OBJECT_IMAGE} = objectImageSlice.actions

export const selectObjectChosen = (state) => state.objectImage.objectChosen;
export const selectObjectName = (state) => state.objectImage.objectName;
export const selectObjectID = (state) => state.objectImage.objectID;
export const selectObjectMaterial = (state) => state.objectImage.objectMaterial;

export default objectImageSlice.reducer