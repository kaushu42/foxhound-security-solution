import {
    ACCEPT_RULE_DRAWER_TOGGLE,
    ACCEPT_UNVERIFIED_RULE_BEGIN,
    ACCEPT_UNVERIFIED_RULE_COMPLETE,
    ACCEPT_UNVERIFIED_RULE_ERROR,
    ACCEPT_UNVERIFIED_RULE_SUCCESS, CLEAN_ALL_STATE,
    CLOSE_ALL_DRAWER,
    REJECT_RULE_DRAWER_TOGGLE,
    REJECT_UNVERIFIED_RULE_BEGIN,
    REJECT_UNVERIFIED_RULE_COMPLETE,
    REJECT_UNVERIFIED_RULE_ERROR,
    REJECT_UNVERIFIED_RULE_SUCCESS,
    RULE_SELECTED_TO_ACCEPT,
    RULE_SELECTED_TO_REJECT,
    RULE_SELECTED_TO_UPDATE,
    UNVERIFIED_RULES_DATA_FETCH_BEGIN,
    UNVERIFIED_RULES_DATA_FETCH_COMPLETE,
    UNVERIFIED_RULES_DATA_FETCH_ERROR,
    UNVERIFIED_RULES_DATA_FETCH_SUCCESS,
    UPDATE_RULE_DRAWER_TOGGLE,
    UPDATE_UNVERIFIED_RULE_BEGIN, UPDATE_UNVERIFIED_RULE_COMPLETE, UPDATE_UNVERIFIED_RULE_ERROR,
    UPDATE_UNVERIFIED_RULE_SUCCESS,
    PAGINATION_UPDATE, UNVERIFIED_RULES_TABLE_PAGINATION_UPDATE,
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

    selectedRecordToUpdate : null,
    updateUnverifiedRuleLoading:false,
    updateUnverifiedRuleSuccess:false,
    updateUnverifiedRuleError:false,
    updateUnverifiedRuleSuccessMessage : "Unknown Rule Update Successfully",
    updateUnverifiedRuleErrorMessage: "Unknown Rule Update Error",

    unverifiedRulePagination : {},

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
        case RULE_SELECTED_TO_UPDATE :
            return {
                ...state,
                selectedRecordToUpdate : action.payload
            }
        case ACCEPT_UNVERIFIED_RULE_BEGIN:
            return {
                ...state,
                acceptUnverifiedRuleLoading : true
            }
        case ACCEPT_UNVERIFIED_RULE_SUCCESS:
            return{
                ...state,
                acceptUnverifiedRuleSuccess: true,
                acceptUnverifiedRuleError: false
            }
        case ACCEPT_UNVERIFIED_RULE_ERROR :
            return {
                ...state,
                acceptUnverifiedRuleError: true,
                acceptUnverifiedRuleSuccess: false,
                acceptUnverifiedRuleLoading: false
            }
        case ACCEPT_UNVERIFIED_RULE_COMPLETE:
            return{
                ...state,
                unverifiedRulesData: state.unverifiedRulesData.filter(function(value, index, arr){
                    return value.id != action.payload.id
                }),
                selectedRecordToAccept:null,
                acceptUnverifiedRuleLoading: false
            }
        case REJECT_UNVERIFIED_RULE_BEGIN:
            return {
                ...state,
                rejectUnverifiedRuleLoading : true
            }
        case REJECT_UNVERIFIED_RULE_SUCCESS:
            return{
                ...state,
                rejectUnverifiedRuleSuccess: true,
                rejectUnverifiedRuleError: false
            }
        case REJECT_UNVERIFIED_RULE_ERROR :
            return {
                ...state,
                rejectUnverifiedRuleError: true,
                rejectUnverifiedRuleSuccess: false,
                rejectUnverifiedRuleLoading: false
            }
        case REJECT_UNVERIFIED_RULE_COMPLETE:
            return{
                ...state,
                unverifiedRulesData: state.unverifiedRulesData.filter(function(value, index, arr){
                    return value.id != action.payload.id
                }),
                selectedRecordToReject:null,
                rejectUnverifiedRuleLoading: false
            }
        case UPDATE_UNVERIFIED_RULE_BEGIN:
            return {
                ...state,
                updateUnverifiedRuleLoading : true
            }
        case UPDATE_UNVERIFIED_RULE_SUCCESS:
            return{
                ...state,
                updateUnverifiedRuleSuccess: true,
                updateUnverifiedRuleError: false
            }
        case UPDATE_UNVERIFIED_RULE_ERROR :
            return {
                ...state,
                updateUnverifiedRuleError: true,
                updateUnverifiedRuleSuccess: false,
                updateUnverifiedRuleLoading: false
            }
        case UPDATE_UNVERIFIED_RULE_COMPLETE:
            return{
                ...state,
                selectedRecordToUpdate:null,
                updateUnverifiedRuleLoading: false
            }
        case CLEAN_ALL_STATE :
            return {
                ...state,
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

                selectedRecordToUpdate : null,
                updateUnverifiedRuleLoading:false,
                updateUnverifiedRuleSuccess:false,
                updateUnverifiedRuleError:false,
                updateUnverifiedRuleSuccessMessage : "Unknown Rule Update Successfully",
                updateUnverifiedRuleErrorMessage: "Unknown Rule Update Error"
            }
        case UNVERIFIED_RULES_TABLE_PAGINATION_UPDATE :
            return {
                ...state,
                unverifiedRulePagination: action.payload
            }
        default:
            return state
    }

}

export default unverifiedRulesReducer;