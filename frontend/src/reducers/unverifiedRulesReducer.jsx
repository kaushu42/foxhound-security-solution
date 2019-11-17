import {
    ACCEPT_RULE_DRAWER_TOGGLE,
    ACCEPT_UNVERFIED_RULE_BEGIN, ACCEPT_UNVERFIED_RULE_COMPLETE, ACCEPT_UNVERFIED_RULE_ERROR,
    ACCEPT_UNVERFIED_RULE_SUCCESS,
    CLOSE_ALL_DRAWER,
    RULE_SELECTED_TO_ACCEPT,
    UNVERIFIED_RULES_DATA_FETCH_BEGIN,
    UNVERIFIED_RULES_DATA_FETCH_COMPLETE,
    UNVERIFIED_RULES_DATA_FETCH_ERROR,
    UNVERIFIED_RULES_DATA_FETCH_SUCCESS
} from "../actionTypes/unverifiedRulesActionType";

const initialState = {
    unverifiedRulesLoading : false,
    unverifiedRulesData : null,
    unverifiedRulesSuccess : false,
    unverifiedRulesError: false,
    unverifiedRuleAcceptDrawerLoading : false,
    unverifiedRuleRejectDrawerLoading : false,
    unverifiedRuleUpdateDrawerLoading : false,
    selectedRecordToAccept : null,
    acceptUnverifiedRuleLoading:false,
    acceptUnverifiedRuleSuccess:false,
    acceptUnverifiedRuleError:false,
    acceptUnverifiedRuleSuccessMessage : "Unknown Rule Verified Successfully",
    acceptUnverifiedRuleErrorMessage: "Unknown Rule Verify Error",
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
        case ACCEPT_RULE_DRAWER_TOGGLE :
            return {
                ...state,
                unverifiedRuleAcceptDrawerLoading : !state.unverifiedRuleAcceptDrawerLoading
            }
        case CLOSE_ALL_DRAWER:
            return{
                ...state,
                unverifiedRuleAcceptDrawerLoading: false,
                unverifiedRuleRejectDrawerLoading: false,
                unverifiedRuleUpdateDrawerLoading: false
            }
        case RULE_SELECTED_TO_ACCEPT :
            return {
                ...state,
                selectedRecordToAccept : action.payload
            }
        case ACCEPT_UNVERFIED_RULE_BEGIN:
            return {
                ...state,
                acceptUnverifiedRuleLoading : true
            }
        case ACCEPT_UNVERFIED_RULE_SUCCESS:
            return{
                ...state,
                acceptUnverifiedRuleSuccess: true,
                acceptUnverifiedRuleError: false
            }
        case ACCEPT_UNVERFIED_RULE_ERROR :
            return {
                ...state,
                acceptUnverifiedRuleError: true,
                acceptUnverifiedRuleSuccess: false,
                acceptUnverifiedRuleLoading: false
            }
        case ACCEPT_UNVERFIED_RULE_COMPLETE:
            return{
                ...state,
                unverifiedRulesData: state.unverifiedRulesData.filter(function(value, index, arr){
                    return value.id != action.payload.id
                }),
                selectedRecordToAccept:null,
                acceptUnverifiedRuleLoading: false
            }
        default:
            return state
    }

}

export default unverifiedRulesReducer;