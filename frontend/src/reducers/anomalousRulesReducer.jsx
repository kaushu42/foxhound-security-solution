import {
    ANOMALOUS_RULES_DATA_FETCH_BEGIN,
    ANOMALOUS_RULES_DATA_FETCH_COMPLETE,
    ANOMALOUS_RULES_DATA_FETCH_ERROR,
    ANOMALOUS_RULES_DATA_FETCH_SUCCESS,
    PAGINATION_UPDATE
} from "../actionTypes/anomalousRulesActionType";

const initialState = {
    anomalousRulesLoading : false,
    anomalousRulesData : null,
    anomalousRulesSuccess : false,
    anomalousRulesError: false,
    pagination: {}
}

const anomalousRulesReducer = (state=initialState,action)=>{
    switch(action.type){
        case ANOMALOUS_RULES_DATA_FETCH_BEGIN :
            return {
                ...state,
                anomalousRulesLoading: true
            }
        case ANOMALOUS_RULES_DATA_FETCH_SUCCESS :
            return {
                ...state,
                anomalousRulesData: action.payload,
                anomalousRulesSuccess: true
            }
        case ANOMALOUS_RULES_DATA_FETCH_ERROR :
            return {
                ...state,
                anomalousRulesLoading: false,
                anomalousRulesError: true,
                anomalousRulesErrorMessage: action.payload
            }
        case ANOMALOUS_RULES_DATA_FETCH_COMPLETE:
            return {
                ...state,
                anomalousRulesLoading: false
            }
        case PAGINATION_UPDATE :
                return {
                    ...state,
                    pagination: action.payload
                }
        default:
            return state
    }

}

export default anomalousRulesReducer;