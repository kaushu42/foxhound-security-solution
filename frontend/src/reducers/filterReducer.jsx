import {
    DATE_RANGE_PICKER_FILTER_UPDATED,
    FIREWALL_RULE_FILTER_UPDATED,
    APPLICATION_FILTER_UPDATED,
    PROTOCOL_FILTER_UPDATED,
    SOURCE_ZONE_FILTER_UPDATED,
    DESTINATION_ZONE_FILTER_UPDATED,
    IP_ADDRESS_FILTER_UPDATED
} from "../actionTypes/filterActionType";

const initialState = {
    date_range : [],
    firewall_rule : [],
    application : [],
    protocol : [],
    source_zone : [],
    destination_zone : [],
    ip_address : []
}

const filterReducer = (state=initialState,action) => {
    switch(action.type){
        case DATE_RANGE_PICKER_FILTER_UPDATED :
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
        case PROTOCOL_FILTER_UPDATED:
            return {
                ...state,
                protocol: action.payload.protocol
            }
        case SOURCE_ZONE_FILTER_UPDATED:
            return {
                ...state,
                source_zone: action.payload.source_zone
            }
        case DESTINATION_ZONE_FILTER_UPDATED:
            return {
                ...state,
                destination_zone: action.payload.destination_zone
            }
        // case IP_ADDRESS_FILTER_UPDATED:
        //     return{
        //         ...state,
        //         ip_address: action.payload.ip_address
        //     }
        default:
            return state;
    }
}

export default filterReducer;