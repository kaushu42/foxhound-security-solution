import {
    ACCEPT_RULE_DRAWER_TOGGLE,
    ACCEPT_UNVERFIED_RULE_BEGIN,
    ACCEPT_UNVERFIED_RULE_COMPLETE,
    ACCEPT_UNVERFIED_RULE_ERROR,
    ACCEPT_UNVERFIED_RULE_SUCCESS,
    CLOSE_ALL_DRAWER, REJECT_RULE_DRAWER_TOGGLE,
    REJECT_UNVERFIED_RULE_BEGIN,
    REJECT_UNVERFIED_RULE_COMPLETE,
    REJECT_UNVERFIED_RULE_ERROR,
    REJECT_UNVERFIED_RULE_SUCCESS,
    RULE_SELECTED_TO_ACCEPT, RULE_SELECTED_TO_REJECT,
    UNVERIFIED_RULES_DATA_FETCH_BEGIN,
    UNVERIFIED_RULES_DATA_FETCH_COMPLETE,
    UNVERIFIED_RULES_DATA_FETCH_ERROR,
    UNVERIFIED_RULES_DATA_FETCH_SUCCESS, UPDATE_RULE_DRAWER_TOGGLE
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

    selectedRecordToReject : null,
    rejectUnverifiedRuleLoading:false,
    rejectUnverifiedRuleSuccess:false,
    rejectUnverifiedRuleError:false,
    rejectUnverifiedRuleSuccessMessage : "Unknown Rule Flagged Successfully",
    rejectUnverifiedRuleErrorMessage: "Unknown Rule Flag Error",



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
        case REJECT_RULE_DRAWER_TOGGLE :
            return {
                ...state,
                unverifiedRuleRejectDrawerLoading : !state.unverifiedRuleRejectDrawerLoading
            }
        case UPDATE_RULE_DRAWER_TOGGLE :
            return {
                ...state,
                unverifiedRuleUpdateDrawerLoading : !state.unverifiedRuleUpdateDrawerLoading
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

        case RULE_SELECTED_TO_REJECT :
            return {
                ...state,
                selectedRecordToReject : action.payload
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

        case REJECT_UNVERFIED_RULE_BEGIN:
            return {
                ...state,
                rejectUnverifiedRuleLoading : true
            }
        case REJECT_UNVERFIED_RULE_SUCCESS:
            return{
                ...state,
                rejectUnverifiedRuleSuccess: true,
                rejectUnverifiedRuleError: false
            }
        case REJECT_UNVERFIED_RULE_ERROR :
            return {
                ...state,
                rejectUnverifiedRuleError: true,
                rejectUnverifiedRuleSuccess: false,
                rejectUnverifiedRuleLoading: false
            }
        case REJECT_UNVERFIED_RULE_COMPLETE:
            return{
                ...state,
                unverifiedRulesData: state.unverifiedRulesData.filter(function(value, index, arr){
                    return value.id != action.payload.id
                }),
                selectedRecordToReject:null,
                rejectUnverifiedRuleLoading: false
            }


        default:
            return state
    }

}

export default unverifiedRulesReducer;