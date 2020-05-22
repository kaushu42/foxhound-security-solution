import {axiosHeader, ROOT_URL} from "../utils";
import axios from 'axios';
import {
    VERIFIED_RULES_DATA_FETCH_BEGIN,
    VERIFIED_RULES_DATA_FETCH_COMPLETE,
    VERIFIED_RULES_DATA_FETCH_ERROR,
    VERIFIED_RULES_DATA_FETCH_SUCCESS,
    VERIFIED_RULE_PAGINATION_UPDATE, 
    VERIFIED_RULE_UPDATE_PAGINATION_PAGE_COUNT,
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

const FETCH_API  = `${ROOT_URL}rules/verified/`;
const FLAG_RULE_API = `${ROOT_URL}rules/flag/`;
const DISCARD_RULE_API = `${ROOT_URL}rules/delete/`;

export function fetchVerifiedRulesDataBegin(){
    return {
        type : VERIFIED_RULES_DATA_FETCH_BEGIN
    }

}
export function fetchVerifiedRulesDataSuccess(response){
    return {
        type : VERIFIED_RULES_DATA_FETCH_SUCCESS,
        payload:response
    }
}

export function fetchVerifiedRulesDataComplete(){
    return {
        type: VERIFIED_RULES_DATA_FETCH_COMPLETE
    }
}

export function fetchVerifiedRulesDataFailure(error) {
    return {
        type:VERIFIED_RULES_DATA_FETCH_ERROR,
        payload:error
    }
}

export function rejectVerifiedRule(auth_token,record){
    return(dispatch) => {
        dispatch(selectRecordToReject(record));
        dispatch(toggleRejectDrawer());

    }
}

export function discardVerifiedRule(auth_token,record){
    return(dispatch) => {
        dispatch(selectRecordToDiscard(record));
        dispatch(toggleDiscardDrawer());

    }
}

export function selectRecordToReject(record){
    return {
        type : VERIFIED_RULE_SELECTED_TO_REJECT,
        payload: record
    }
}

export function selectRecordToDiscard(record){
    return {
        type : VERIFIED_RULE_SELECTED_TO_DISCARD,
        payload: record
    }
}

export function toggleRejectDrawer(){
    return {
        type:VERIFIED_REJECT_RULE_DRAWER_TOGGLE
    }
}

export function toggleDiscardDrawer(){
    return {
        type:VERIFIED_DISCARD_RULE_DRAWER_TOGGLE
    }
}

export function handleDrawerClose(){
    return {
        type: CLOSE_ALL_DRAWER
    }
}

export function fetchVerifiedRulesData(auth_token, params, searchSourceIP, searchDestinationIP, searchAlias, searchApplication, pagination){
    return(dispatch)=>{

        let headers = axiosHeader(auth_token);

        let bodyFormData = new FormData();
        bodyFormData.set("source_ip", searchSourceIP);
        bodyFormData.set("destination_ip", searchDestinationIP);
        bodyFormData.set("alias", searchAlias);
        bodyFormData.set("application", searchApplication);

        dispatch(fetchVerifiedRulesDataBegin());
        axios.post(FETCH_API,bodyFormData,{headers, params})
            .then(res => {
                const response = res.data;
                const page = pagination;
                page.total  = response.count;
                dispatch(updatePagination(page));
                dispatch(fetchVerifiedRulesDataSuccess(response.results));
                dispatch(updatePaginationPageCount(response.count));
            })
            .then(res => dispatch(fetchVerifiedRulesDataComplete()))
            .catch(error => dispatch(fetchVerifiedRulesDataFailure(error)));
    }
}

export function rejectRule(auth_token,description,record){
    return (dispatch) => {

        const url = FLAG_RULE_API + record.id + '/';
        let headers = axiosHeader(auth_token);

        const formData = new FormData();
        formData.set('description', description);

        dispatch(rejectRuleBegin());
        axios.post(url,formData,{headers})
            .then(res =>{
                const response = res.data;
                dispatch(rejectRuleSuccess());
            })
            .then(res => {
                dispatch(rejectRuleComplete(record));
                setTimeout(()=>{dispatch(cleanAllDrawerState())},5000);
                dispatch(toggleRejectDrawer());

            })
            .catch(error => dispatch(rejectRuleError(error)));

    }
}

export function discardRule(auth_token,description,record){
    return (dispatch) => {

        const url = DISCARD_RULE_API + record.id + '/';
        let headers = axiosHeader(auth_token);
        console.log("discard url", url)
        dispatch(discardRuleBegin());
        axios.post(url,null,{headers})
            .then(res =>{
                const response = res.data;
                dispatch(discardRuleSuccess());
            })
            .then(res => {
                dispatch(discardRuleComplete(record));
                setTimeout(()=>{dispatch(cleanAllDrawerState())},5000);
                dispatch(toggleDiscardDrawer());

            })
            .catch(error => dispatch(discardRuleError(error)));

    }
}

export function rejectRuleBegin(){
    return {
        type:REJECT_VERIFIED_RULE_BEGIN
    }
}

export function rejectRuleSuccess(){
    return {
        type:REJECT_VERIFIED_RULE_SUCCESS
    }
}

export function rejectRuleComplete(record){
    return{
        type:REJECT_VERIFIED_RULE_COMPLETE,
        payload:record
    }
}

export function rejectRuleError(error){
    return {
        type:REJECT_VERIFIED_RULE_ERROR,
        payload:error
    }
}

export function discardRuleBegin(){
    return {
        type:DISCARD_VERIFIED_RULE_BEGIN
    }
}

export function discardRuleSuccess(){
    return {
        type:DISCARD_VERIFIED_RULE_SUCCESS
    }
}

export function discardRuleComplete(record){
    return{
        type:DISCARD_VERIFIED_RULE_COMPLETE,
        payload:record
    }
}

export function discardRuleError(error){
    return {
        type:DISCARD_VERIFIED_RULE_ERROR,
        payload:error
    }
}

export function cleanAllDrawerState(){
    return {
        type: CLEAN_ALL_STATE
    }
}


export function updatePagination(pagination){
    return {
        type : VERIFIED_RULE_PAGINATION_UPDATE,
        payload: pagination
    }
}

export function updatePaginationPageCount(pageCount){
    return {
        type : VERIFIED_RULE_UPDATE_PAGINATION_PAGE_COUNT,
        payload: pageCount
    }
}