// import { createSlice } from '@reduxjs/toolkit'

// const initialState = {
//     objectID: null,
//     objectMaterial: 'tranlate',
// }


// // these are the reducers
// const editSlice = createSlice({
//     name: "objectImage",
//     initialState,
//     reducers: {
//       SET_OBJECT_IMAGE: (state, action) => {
//         return {
//           ...state,
//           objectChosen: true,
//           objectName: action.payload.objectName,
//           objectID: action.payload.objectID,
//           objectMaterial: action.payload.objectMaterial,
//         };
//       },
//       SET_OBJECT_MATERIAL: (state, action) => {
//         return {
//           ...state,
//           objectMaterial: action.payload.objectMaterial,
//         };
//       }
//     }
//   });
  

// // these are the actions
// export const {SET_OBJECT_IMAGE, SET_OBJECT_MATERIAL} = objectImageSlice.actions

// export const selectObjectChosen = (state) => state.objectImage.objectChosen;
// export const selectObjectName = (state) => state.objectImage.objectName;
// export const selectObjectID = (state) => state.objectImage.objectID;
// export const selectObjectMaterial = (state) => state.objectImage.objectMaterial;

// export default objectImageSlice.reducer