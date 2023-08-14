import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice";
import projectReducer from "./slice/projectSlice"

const rootReducer = combineReducers({
    auth: authReducer,
    project: projectReducer,
});


const store = configureStore({
    reducer: rootReducer,
})

export default store;