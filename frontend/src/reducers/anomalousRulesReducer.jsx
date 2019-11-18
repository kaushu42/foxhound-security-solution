import {
    ANOMALOUS_RULES_DATA_FETCH_BEGIN,
    ANOMALOUS_RULES_DATA_FETCH_COMPLETE,
    ANOMALOUS_RULES_DATA_FETCH_ERROR,
    ANOMALOUS_RULES_DATA_FETCH_SUCCESS,
    ACCEPT_RULE_DRAWER_TOGGLE,
    CLOSE_ALL_DRAWER,
    RULE_SELECTED_TO_ACCEPT,
    ACCEPT_ANOMALOUS_RULE_BEGIN,
    ACCEPT_ANOMALOUS_RULE_SUCCESS,
    ACCEPT_ANOMALOUS_RULE_COMPLETE,
    ACCEPT_ANOMALOUS_RULE_ERROR,
    TOGGLE_FLAGGED_RULE_BEGIN,
    TOGGLE_FLAGGED_RULE_COMPLETE,
    TOGGLE_FLAGGED_RULE_ERROR,
    TOGGLE_FLAGGED_RULE_SUCCESS,
    CLEAN_ALL_STATE,
    PAGINATION_UPDATE
} from "../actionTypes/anomalousRulesActionType";

const initialState = {
    anomalousRulesLoading : false,
    anomalousRulesData : null,
    anomalousRulesSuccess : false,
    anomalousRulesError: false,

    anomalousRuleAcceptDrawerLoading : false,

    selectedRecordToAccept : null,
    acceptAnomalousRuleLoading:false,
    acceptAnomalousRuleSuccess:false,
    acceptAnomalousRuleError:false,
    acceptAnomalousRuleSuccessMessage : "Anomalous Rule Verified Successfully",
    acceptAnomalousRuleErrorMessage: "Anomalous Rule Verify Error",

    selectedRecordToToggle : null,
    toggleFlaggedRuleLoading:false,
    toggleFlaggedRuleSuccess:false,
    toggleFlaggedRuleError:false,

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
        case ACCEPT_RULE_DRAWER_TOGGLE :
            return {
                ...state,
                anomalousRuleAcceptDrawerLoading : !state.anomalousRuleAcceptDrawerLoading
            }
        case CLOSE_ALL_DRAWER:
            return{
                ...state,
                anomalousRuleAcceptDrawerLoading: false
            }
        case RULE_SELECTED_TO_ACCEPT :
            return {
                ...state,
                selectedRecordToAccept : action.payload
            }
        case ACCEPT_ANOMALOUS_RULE_BEGIN:
            return {
                ...state,
                acceptAnomalousRuleLoading : true
            }
        case ACCEPT_ANOMALOUS_RULE_SUCCESS:
            return{
                ...state,
                acceptAnomalousRuleSuccess: true,
                acceptAnomalousRuleError: false
            }
        case ACCEPT_ANOMALOUS_RULE_ERROR :
            return {
                ...state,
                acceptAnomalousRuleError: true,
                acceptAnomalousRuleSuccess: false,
                acceptAnomalousRuleLoading: false
            }
        case ACCEPT_ANOMALOUS_RULE_COMPLETE:
            return{
                ...state,
                anomalousRulesData: state.anomalousRulesData.filter(function(value, index, arr){
                    return value.id != action.payload.id
                }),
                selectedRecordToAccept:null,
                acceptAnomalousRuleLoading: false
            }
        case TOGGLE_FLAGGED_RULE_BEGIN:
            return {
                ...state,
                toggleFlaggedRuleLoading : true
            }
        case TOGGLE_FLAGGED_RULE_SUCCESS:
            return{
                ...state,
                toggleFlaggedRuleSuccess: true,
                toggleFlaggedRuleError: false
            }
        case TOGGLE_FLAGGED_RULE_ERROR :
            return {
                ...state,
                toggleFlaggedRuleError: true,
                toggleFlaggedRuleSuccess: false,
                toggleFlaggedRuleLoading: false
            }
        case TOGGLE_FLAGGED_RULE_COMPLETE:
            return{
                ...state,
                unverifiedRulesData: state.unverifiedRulesData.filter(function(value, index, arr){
                    return value.id != action.payload.id
                }),
                selectedRecordToReject:null,
                rejectUnverifiedRuleLoading: false
            }
        case CLEAN_ALL_STATE :
            return {
                ...state,
                selectedRecordToAccept : null,
                acceptAnomalousRuleLoading:false,
                acceptAnomalousRuleSuccess:false,
                acceptAnomalousRuleError:false,
                acceptAnomalousRuleSuccessMessage : "Anomalous Rule Verified Successfully",
                acceptAnomalousRuleErrorMessage: "Anomalous Rule Verify Error",
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