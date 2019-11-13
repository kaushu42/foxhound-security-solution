import {combineReducers} from "redux";
import authReducer from "./reducers/authReducer";
import filterReducer from "./reducers/filterReducer";
import layoutReducer from "./reducers/layoutReducer";
import ipSearchBarReducer from "./reducers/ipSearchReducer";
import accountReducer from "./reducers/accountReducer";

const rootReducer = combineReducers({
    auth : authReducer,
    filter : filterReducer,
    layout : layoutReducer,
    ipSearchBar : ipSearchBarReducer,
    account : accountReducer
})

export default rootReducer;