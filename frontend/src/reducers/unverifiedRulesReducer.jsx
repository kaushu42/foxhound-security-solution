import {
    UNVERIFIED_RULES_DATA_FETCH_BEGIN, UNVERIFIED_RULES_DATA_FETCH_COMPLETE, UNVERIFIED_RULES_DATA_FETCH_ERROR,
    UNVERIFIED_RULES_DATA_FETCH_SUCCESS
} from "../actionTypes/unverifiedRulesActionType";

const initialState = {
    unverifiedRulesLoading : false,
    unverifiedRulesData : null,
    unverifiedRulesSuccess : false,
    unverifiedRulesError: false
}

const unverifiedRulesReducer = (state=initialState,action)=>{
    switch(action.type){
        case UNVERIFIED_RULES_DATA_FETCH_BEGIN :
            return {
                ...state,
                unverifiedRulesLoading: true
            }
        case UNVERIFIED_RULES_DATA_FETCH_SUCCESS :
            return {
                ...state,
                unverifiedRulesData: action.payload,
                unverifiedRulesSuccess: true
            }
        case UNVERIFIED_RULES_DATA_FETCH_ERROR :
            return {
                ...state,
                unverifiedRulesLoading: false,
                unverifiedRulesError: true,
                unverifiedRulesErrorMessage: action.payload
            }
        case UNVERIFIED_RULES_DATA_FETCH_COMPLETE:
            return {
                ...state,
                unverifiedRulesLoading: false
            }
        default:
            return state
    }

}

export default unverifiedRulesReducer;