import { combineReducers } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import reactFlowDiagramReducer from "./reactFlowDiagram";

const persistConfig = {
  key: "root",
  storage,
  whitelist: [],
  blacklist: [],
};

const reducer = (state, action) => {
  return combineReducers({
    reactFlowDiagram: reactFlowDiagramReducer,
  })(state, action);
};

export default persistReducer(persistConfig, reducer);
