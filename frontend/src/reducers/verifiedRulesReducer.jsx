import {
    VERIFIED_RULES_DATA_FETCH_BEGIN,
    VERIFIED_RULES_DATA_FETCH_COMPLETE,
    VERIFIED_RULES_DATA_FETCH_ERROR,
    VERIFIED_RULES_DATA_FETCH_SUCCESS,
    PAGINATION_UPDATE
} from "../actionTypes/verifiedRulesActionType";

const initialState = {
    verifiedRulesLoading : false,
    verifiedRulesData : null,
    verifiedRulesSuccess : false,
    verifiedRulesError: false,

    pagination : {},
}

const verifiedRulesReducer = (state=initialState,action)=>{
    switch(action.type){
        case VERIFIED_RULES_DATA_FETCH_BEGIN :
            return {
                ...state,
                verifiedRulesLoading: true
            }
        case VERIFIED_RULES_DATA_FETCH_SUCCESS :
            return {
                ...state,
                verifiedRulesData: action.payload,
                verifiedRulesSuccess: true
            }
        case VERIFIED_RULES_DATA_FETCH_ERROR :
            return {
                ...state,
                verifiedRulesLoading: false,
                verifiedRulesError: true,
                verifiedRulesErrorMessage: action.payload
            }
        case VERIFIED_RULES_DATA_FETCH_COMPLETE:
            return {
                ...state,
                verifiedRulesLoading: false
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

export default verifiedRulesReducer;