import {
    APPLICATION_FILTER_UPDATED,
    DATE_RANGE_FILTER_UPDATED,
    FIREWALL_RULE_FILTER_UPDATED
} from "../actionTypes/filterActionTypes";

const initialState = {
    date_range : [],
    firewall_rule : [],
    application : [],
    protocol : [],
    source_zone : [],
    destination_zone : []
}

const filterReducer = (state=initialState,action) => {
    switch(action.type){
        case DATE_RANGE_FILTER_UPDATED :
            return {
             ...state,
                date_range: action.payload.date_range
            }
        case FIREWALL_RULE_FILTER_UPDATED:
            return {
                ...state,
                firewall_rule: action.payload.firewall_rule
            }
        case APPLICATION_FILTER_UPDATED:
            return {
                ...state,
                application: action.payload.application
            }

        default:
            return state;
    }
}

export default filterReducer;