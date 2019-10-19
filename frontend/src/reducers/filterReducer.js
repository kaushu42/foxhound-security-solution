import {DATE_RANGE_FILTER_UPDATED,FIREWALL_RULE_FILTER_UPDATED} from "../actionTypes/filterActionTypes";

const initialState = {
    date_range : [],
    firewall_rule : [],
    application : [],
    protocol : [],
    source_zone : [],
    destination_zone : []
}

const filterReducer = (state=initialState,action) => {
    switch(action.Type){
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
        default:
            return state;
    }
}

export default filterReducer;