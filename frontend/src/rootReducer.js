import {combineReducers} from "redux";
import authReducer from "./reducers/authReducer";
import filterReducer from "./reducers/filterReducer";
import layoutReducer from "./reducers/layoutReducer";
import ipSearchBarReducer from "./reducers/ipSearchReducer";
import accountReducer from "./reducers/accountReducer";
import requestOriginChartReducer from "./reducers/requestOriginChartReducer";
import unverifiedRulesReducer from "./reducers/unverifiedRulesReducer";
import verifiedRulesReducer from "./reducers/verifiedRulesReducer";
import anomalousRulesReducer from "./reducers/anomalousRulesReducer";

const rootReducer = combineReducers({
    auth : authReducer,
    filter : filterReducer,
    layout : layoutReducer,
    ipSearchBar : ipSearchBarReducer,
    account : accountReducer,
    requestOriginChart : requestOriginChartReducer,
    unverifiedRule : unverifiedRulesReducer,
    verifiedRule : verifiedRulesReducer,
    anomalousRule: anomalousRulesReducer
})

export default rootReducer;