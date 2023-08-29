import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice";
import projectReducer from "./slice/projectSlice";
import templateReducer from "./slice/templateSlice";
import objectImageReducer from "./slice/objectImageSlice";


const rootReducer = combineReducers({
    auth: authReducer,
    project: projectReducer,
    template: templateReducer,
    objectImage: objectImageReducer,

});


const store = configureStore({
    reducer: rootReducer,
})

export default store;