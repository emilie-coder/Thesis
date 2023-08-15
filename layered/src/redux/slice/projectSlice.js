import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    projectID: null,
    projectTitle: 'untitled',
    projectTemplate: null,
    projectTimeCreated: null,
    projectTimeLastSaved: null,
    projectAuthor: null,
}


// these are the reducers
const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    SET_ACTIVE_PROJECT: (state, action) => {
        state.isLoggedIn = true;
        const { projectID, projectTitle, projectTemplate, projectTimeCreated, projectTimeLastSaved, projectAuthor } = action.payload;
        state.projectID = projectID;
        // Set projectTitle to "untitled" if it's empty or null
        state.projectTitle = projectTitle || 'untitled';
        state.projectTemplate = projectTemplate;
        state.projectTimeCreated = projectTimeCreated;
        state.projectTimeLastSaved = projectTimeLastSaved;
        state.projectAuthor = projectAuthor;
    },
    REMOVE_ACTIVE_PROJECT: (state, action) => {
        state.projectID = null;
        state.projectTitle = 'untitled';
        state.projectTemplate = null;
        state.projectTimeCreated = null;
        state.projectTimeLastSaved = null;
        state.projectAuthor = null;
    }
  }
});


// these are the actions
export const {SET_ACTIVE_PROJECT, REMOVE_ACTIVE_PROJECT} = projectSlice.actions

export const selectProjectID = (state) => state.project.projectID;
export const selectProjectTitle = (state) => state.project.projectTitle;
export const selectProjectTemplate = (state) => state.project.projectTemplate;
export const selectProjectTimeCreated = (state) => state.project.projectTimeCreated;
export const selectProjectTimeLastSaved = (state) => state.project.projectTimeLastSaved;
export const selectProjectAuthor = (state) => state.project.projectAuthor;


export default projectSlice.reducer