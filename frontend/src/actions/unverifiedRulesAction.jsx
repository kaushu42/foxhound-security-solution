import {axiosHeader, ROOT_URL} from "../utils";
import axios from 'axios';
import {
    ACCEPT_UNVERIFIED_RULE_DRAWER_TOGGLE,
    ACCEPT_UNVERIFIED_RULE_BEGIN,
    ACCEPT_UNVERIFIED_RULE_COMPLETE,
    ACCEPT_UNVERIFIED_RULE_ERROR,
    ACCEPT_UNVERIFIED_RULE_SUCCESS,
    CLEAN_ALL_STATE,
    CLOSE_ALL_DRAWER,
    REJECT_RULE_DRAWER_TOGGLE,
    REJECT_UNVERIFIED_RULE_BEGIN,
    REJECT_UNVERIFIED_RULE_COMPLETE,
    REJECT_UNVERIFIED_RULE_ERROR,
    REJECT_UNVERIFIED_RULE_SUCCESS,
    UNVERIFIED_RULE_SELECTED_TO_ACCEPT,
    UNVERIFIED_RULE_SELECTED_TO_REJECT,
    UNVERIFIED_RULE_SELECTED_TO_UPDATE,
    UNVERIFIED_RULES_DATA_FETCH_BEGIN,
    UNVERIFIED_RULES_DATA_FETCH_COMPLETE,
    UNVERIFIED_RULES_DATA_FETCH_ERROR,
    UNVERIFIED_RULES_DATA_FETCH_SUCCESS,
    UPDATE_RULE_DRAWER_TOGGLE,
    UPDATE_UNVERIFIED_RULE_BEGIN,
    UPDATE_UNVERIFIED_RULE_COMPLETE,
    UPDATE_UNVERIFIED_RULE_ERROR,
    UPDATE_UNVERIFIED_RULE_SUCCESS,
    UNVERIFIED_RULES_TABLE_UPDATE_PAGINATION_PAGE_COUNT,
    UNVERIFIED_RULES_TABLE_PAGINATION_UPDATE,
} from "../actionTypes/unverifiedRulesActionType";
import {fetchAnomalousRulesData} from "./anomalousRulesAction";
import { search } from "./ipSearchAction";


const FETCH_API  = `${ROOT_URL}rules/unverified/`;

const VERIFY_RULE_API = `${ROOT_URL}rules/verify/`;
const FLAG_RULE_API = `${ROOT_URL}rules/flag/`;
const UPDATE_API = `${ROOT_URL}rules/edit/`;

export function fetchUnverifiedRulesDataBegin(){
    return {
        type : UNVERIFIED_RULES_DATA_FETCH_BEGIN
    }

}
export function fetchUnverifiedRulesDataSuccess(response){
    return {
        type : UNVERIFIED_RULES_DATA_FETCH_SUCCESS,
        payload:response
    }
}

export function fetchUnverifiedRulesDataComplete(){
    return {
        type: UNVERIFIED_RULES_DATA_FETCH_COMPLETE
    }
}

export function fetchUnverifiedRulesDataFailure(error) {
    return {
        type:UNVERIFIED_RULES_DATA_FETCH_ERROR,
        payload:error
    }
}

export function toggleAcceptDrawer(){
    return {
        type:ACCEPT_UNVERIFIED_RULE_DRAWER_TOGGLE
    }
}

export function toggleRejectDrawer(){
    return {
        type:REJECT_RULE_DRAWER_TOGGLE
    }
}

export function toggleUpdateDrawer(){
    return {
        type:UPDATE_RULE_DRAWER_TOGGLE
    }
}


export function handleDrawerClose(){
    return {
        type: CLOSE_ALL_DRAWER
    }
}

export function selectRecordToAccept(record){
    return {
        type : UNVERIFIED_RULE_SELECTED_TO_ACCEPT,
        payload: record
    }
}

export function selectRecordToReject(record){
    return {
        type : UNVERIFIED_RULE_SELECTED_TO_REJECT,
        payload: record
    }
}


export function selectRecordToUpdate(record){
    return {
        type : UNVERIFIED_RULE_SELECTED_TO_UPDATE,
        payload: record
    }
}



export function acceptRuleSuccess(){
    return {
        type:ACCEPT_UNVERIFIED_RULE_SUCCESS
    }
}

export function acceptRuleBegin(){
    return {
        type:ACCEPT_UNVERIFIED_RULE_BEGIN
    }
}

export function acceptRuleComplete(record){
    return{
        type:ACCEPT_UNVERIFIED_RULE_COMPLETE,
        payload:record
    }
}

export function acceptRuleError(error){
    return {
        type:ACCEPT_UNVERIFIED_RULE_ERROR,
        payload:error
    }
}


export function rejectRuleSuccess(){
    return {
        type:REJECT_UNVERIFIED_RULE_SUCCESS
    }
}

export function rejectRuleBegin(){
    return {
        type:REJECT_UNVERIFIED_RULE_BEGIN
    }
}

export function rejectRuleComplete(record){
    return{
        type:REJECT_UNVERIFIED_RULE_COMPLETE,
        payload:record
    }
}

export function rejectRuleError(error){
    return {
        type:REJECT_UNVERIFIED_RULE_ERROR,
        payload:error
    }
}



export function updateRuleSuccess(){
    return {
        type:UPDATE_UNVERIFIED_RULE_SUCCESS
    }
}

export function updateRuleBegin(){
    return {
        type:UPDATE_UNVERIFIED_RULE_BEGIN
    }
}

export function updateRuleComplete(record){
    return{
        type:UPDATE_UNVERIFIED_RULE_COMPLETE,
        payload:record
    }
}

export function updateRuleError(error){
    return {
        type:UPDATE_UNVERIFIED_RULE_ERROR,
        payload:error
    }
}




export function acceptUnverifiedRule(auth_token,record){
    return(dispatch) => {
        dispatch(selectRecordToAccept(record));
        dispatch(toggleAcceptDrawer());

    }

}

export function rejectUnverifiedRule(auth_token,record){
    return(dispatch) => {
        dispatch(selectRecordToReject(record));
        dispatch(toggleRejectDrawer());

    }
}

export function updateUnverifiedRule(auth_token,record){
    return(dispatch) => {
        dispatch(selectRecordToUpdate(record));
        dispatch(toggleUpdateDrawer());
    }
}


export function cleanAllDrawerState(){
    return {
        type: CLEAN_ALL_STATE
    }
}

export function acceptRule(auth_token,description,record){
    return (dispatch) => {

        const url = VERIFY_RULE_API + record.id + '/';
        let headers = axiosHeader(auth_token);

        const formData = new FormData();
        formData.set('description', description);
        
        dispatch(acceptRuleBegin());
        setTimeout(()=>{
            axios.post(url,formData,{headers})
                .then(res =>{
                    const response = res.data;
                    dispatch(acceptRuleSuccess());
                })
                .then(res => {
                    dispatch(acceptRuleComplete(record));
                    setTimeout(()=>{dispatch(cleanAllDrawerState())},2500);
                    dispatch(toggleAcceptDrawer());
                })
                .catch(error => dispatch(acceptRuleError(error)));
        },2500);
    }
}



export function updateRule(auth_token,source_ip,destination_ip,application,description,params,pagination,searchSourceIP, searchDestinationIP, searchAlias, searchApplication){
    return (dispatch) => {
        let headers = axiosHeader(auth_token);

        const formData = new FormData();
        formData.set('source_address', source_ip);
        formData.set('destination_address', destination_ip);
        formData.set('application', application);
        formData.set('description', description);
        dispatch(updateRuleBegin());
        setTimeout(()=>{
            axios.post(UPDATE_API,formData,{headers})
            .then(res =>{
                const response = res.data;
                dispatch(updateRuleSuccess());
            })
            .then(res => {
                dispatch(updateRuleComplete());
                dispatch(fetchUnverifiedRulesData(auth_token,params,searchSourceIP, searchDestinationIP, searchAlias, searchApplication,pagination,));
                setTimeout(()=>{dispatch(cleanAllDrawerState())},5000);
                dispatch(toggleUpdateDrawer());

            })
            .catch(error => dispatch(updateRuleError(error)));
        },2500);
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
                dispatch(fetchAnomalousRulesData(auth_token,{},{}));
                setTimeout(()=>{dispatch(cleanAllDrawerState())},5000);
                dispatch(toggleRejectDrawer());

            })
            .catch(error => dispatch(rejectRuleError(error)));

    }
}

export function fetchUnverifiedRulesData(auth_token, params, searchSourceIP, searchDestintaionIP, searchAlias, searchApplication, pagination){
    return(dispatch)=>{
        let headers = axiosHeader(auth_token);
        let bodyFormData = new FormData();
        bodyFormData.set("source_ip", searchSourceIP);
        bodyFormData.set("destination_ip", searchDestintaionIP);
        bodyFormData.set("alias", searchAlias);
        bodyFormData.set("application", searchApplication);

        dispatch(fetchUnverifiedRulesDataBegin());
        axios.post(FETCH_API,bodyFormData,{headers, params})
            .then(res => {
                const response = res.data;
                const page = pagination;
                page.total  = response.count;
                updatePagination(page);
                dispatch(fetchUnverifiedRulesDataSuccess(response.results));
                dispatch(updatePaginationPageCount(response.count));
            })
            .then(res => dispatch(fetchUnverifiedRulesDataComplete()))
            .catch(error => {
                if(error.response.status ==503){
                    dispatch(fetchUnverifiedRulesDataBegin());
                    dispatch(fetchUnverifiedRulesData(auth_token, params, pagination));
                }
                dispatch(fetchUnverifiedRulesDataFailure(error))
            });

    }
}

export function updatePagination(pagination){
    return {
        type : UNVERIFIED_RULES_TABLE_PAGINATION_UPDATE,
        payload: pagination
    }
}

export function updatePaginationPageCount(pageCount){
    return {
        type : UNVERIFIED_RULES_TABLE_UPDATE_PAGINATION_PAGE_COUNT,
        payload: pageCount
    }
}