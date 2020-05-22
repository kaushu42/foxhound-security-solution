import {
    VERIFIED_RULES_DATA_FETCH_BEGIN,
    VERIFIED_RULES_DATA_FETCH_COMPLETE,
    VERIFIED_RULES_DATA_FETCH_ERROR,
    VERIFIED_RULES_DATA_FETCH_SUCCESS,
    VERIFIED_RULE_PAGINATION_UPDATE,
    VERIFIED_RULE_SELECTED_TO_REJECT,
    VERIFIED_RULE_SELECTED_TO_DISCARD,
    VERIFIED_REJECT_RULE_DRAWER_TOGGLE,
    VERIFIED_DISCARD_RULE_DRAWER_TOGGLE,
    REJECT_VERIFIED_RULE_BEGIN,
    REJECT_VERIFIED_RULE_COMPLETE,
    REJECT_VERIFIED_RULE_ERROR,
    REJECT_VERIFIED_RULE_SUCCESS,
    DISCARD_VERIFIED_RULE_BEGIN,
    DISCARD_VERIFIED_RULE_COMPLETE,
    DISCARD_VERIFIED_RULE_ERROR,
    DISCARD_VERIFIED_RULE_SUCCESS,
    CLOSE_ALL_DRAWER,
    CLEAN_ALL_STATE
} from "../actionTypes/verifiedRulesActionType";

const initialState = {
    verifiedRulesLoading : false,
    verifiedRulesData : null,
    verifiedRulesSuccess : false,
    verifiedRulesError: false,

    verifiedRulePagination : {},

    selectedVerifiedRecordToReject : null,
    rejectVerifiedRuleLoading:false,
    rejectVerifiedRuleSuccess:false,
    rejectVerifiedRuleError:false,
    rejectVerifiedRuleSuccessMessage : "Verified Rule Flagged Successfully",
    rejectVerifiedRuleErrorMessage: "Verified Rule Flag Error",

    selectedVerifiedRecordToDiscard : null,
    discardVerifiedRuleLoading:false,
    discardVerifiedRuleSuccess:false,
    discardVerifiedRuleError:false,
    discardVerifiedRuleSuccessMessage : "Verified Rule Discarded Successfully",
    discardVerifiedRuleErrorMessage: "Verified Rule Discard Error",
    

    verifiedRuleRejectDrawerLoading : false,
    verifiedRuleDiscardDrawerLoading : false
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
        case VERIFIED_RULE_PAGINATION_UPDATE :
            return {
                ...state,
                verifiedRulePagination: action.payload
            }
        case VERIFIED_RULE_SELECTED_TO_REJECT :
            return {
                ...state,
                selectedVerifiedRecordToReject : action.payload
            }
        case VERIFIED_RULE_SELECTED_TO_DISCARD :
            return {
                ...state,
                selectedVerifiedRecordToDiscard : action.payload
            }
        case VERIFIED_REJECT_RULE_DRAWER_TOGGLE :
            return {
                ...state,
                verifiedRuleRejectDrawerLoading : !state.verifiedRuleRejectDrawerLoading
            }
        case VERIFIED_DISCARD_RULE_DRAWER_TOGGLE :
            return {
                ...state,
                verifiedRuleDiscardDrawerLoading : !state.verifiedRuleDiscardDrawerLoading
            }
        case CLOSE_ALL_DRAWER:
            return{
                ...state,
                selectedVerifiedRecordToReject:null,
                verifiedRuleRejectDrawerLoading: false,
            }
        case REJECT_VERIFIED_RULE_BEGIN:
            return {
                ...state,
                rejectVerifiedRuleLoading : true
            }
        case REJECT_VERIFIED_RULE_SUCCESS:
            return{
                ...state,
                rejectVerifiedRuleSuccess: true,
                rejectVerifiedRuleError: false
            }
        case REJECT_VERIFIED_RULE_ERROR :
            return {
                ...state,
                rejectVerifiedRuleError: true,
                rejectVerifiedRuleSuccess: false,
                rejectVerifiedRuleLoading: false
            }
        case REJECT_VERIFIED_RULE_COMPLETE:
            return{
                ...state,
                verifiedRulesData: state.verifiedRulesData.filter(function(value, index, arr){
                    return value.id != action.payload.id
                }),
                selectedVerifiedRecordToReject:null,
                rejectVerifiedRuleLoading: false
            }
        case DISCARD_VERIFIED_RULE_BEGIN:
            return {
                ...state,
                discardVerifiedRuleLoading : true
            }
        case DISCARD_VERIFIED_RULE_SUCCESS:
            return{
                ...state,
                discardVerifiedRuleSuccess: true,
                discardVerifiedRuleError: false
            }
        case DISCARD_VERIFIED_RULE_ERROR :
            return {
                ...state,
                discardVerifiedRuleError: true,
                discardVerifiedRuleSuccess: false,
                discardVerifiedRuleLoading: false
            }
        case DISCARD_VERIFIED_RULE_COMPLETE:
            return{
                ...state,
                verifiedRulesData: state.verifiedRulesData.filter(function(value, index, arr){
                    return value.id != action.payload.id
                }),
                selectedVerifiedRecordToDiscard:null,
                discardVerifiedRuleLoading: false
            }
        case CLEAN_ALL_STATE :
            return {
                ...state,

                selectedVerifiedRecordToReject : null,
                rejectVerifiedRuleLoading:false,
                rejectVerifiedRuleSuccess:false,
                rejectVerifiedRuleError:false,
                rejectVerifiedRuleSuccessMessage : "Verified Rule Flagged Successfully",
                rejectVerifiedRuleErrorMessage: "Verified Rule Flag Error",
            }
        default:
            return state
    }

}

export default verifiedRulesReducer;