import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    userProjectsExist: false,
    userProjectList: {},
    userHelper: 'goodbye',
}


// these are the reducers
const projectsSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    SET_USER_PROJECTS: (state, action) => {

        console.log("action payload");
        console.log(action.payload.userProjectList)


        state.userProjectsExist = true;
        state.userProjectList = action.payload.userProjectList;
        state.userHelper = 'hello'
    },
    REMOVE_USER_PROJECTS: (state, action) => {
        state.userProjectsExist = false;
        state.userProjectList = null;
    }
  }
});


// these are the actions
export const {SET_USER_PROJECTS, REMOVE_USER_PROJECTS} = projectsSlice.actions

export const selectUserProjectExist = (state) => state.project.userProjectsExist;
export const selectUserProjectList = (state) => state.project.userProjectList;


export default projectsSlice.reducer