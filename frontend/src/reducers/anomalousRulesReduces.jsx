import {
    ANOMALOUS_RULES_DATA_FETCH_BEGIN,
    ANOMALOUS_RULES_DATA_FETCH_COMPLETE,
    ANOMALOUS_RULES_DATA_FETCH_ERROR,
    ANOMALOUS_RULES_DATA_FETCH_SUCCESS,
} from "../actionTypes/anomalousRulesActionType";

const initialState = {
    anomalousRulesLoading : false,
    anomalousRulesData : null,
    anomalousRulesSuccess : false,
    anomalousRulesError: false,
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
        default:
            return state
    }

}

export default anomalousRulesReducer;