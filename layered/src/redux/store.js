import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice";
import projectReducer from "./slice/projectSlice"
import projectsReducer from "./slice/projectsSlice"

const rootReducer = combineReducers({
    auth: authReducer,
    project: projectReducer,
    projects: projectsReducer,
});


const store = configureStore({
    reducer: rootReducer,
})

export default store;