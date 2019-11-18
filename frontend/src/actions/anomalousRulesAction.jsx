import {axiosHeader, ROOT_URL} from "../utils";
import axios from 'axios';
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
    CLEAN_ALL_STATE,
    PAGINATION_UPDATE, 
    UPDATE_PAGINATION_PAGE_COUNT,
} from "../actionTypes/anomalousRulesActionType";

const FETCH_API  = `${ROOT_URL}rules/anomalous/`;
const VERIFY_RULE_API = `${ROOT_URL}rules/verify/`;
const FLAG_RULE_API = `${ROOT_URL}rules/flag/`;
const UPDATE_API = `${ROOT_URL}rules/edit/`;

export function fetchAnomalousRulesDataBegin(){
    return {
        type : ANOMALOUS_RULES_DATA_FETCH_BEGIN
    }

}
export function fetchAnomalousRulesDataSuccess(response){
    return {
        type : ANOMALOUS_RULES_DATA_FETCH_SUCCESS,
        payload:response
    }
}

export function fetchAnomalousRulesDataComplete(){
    return {
        type: ANOMALOUS_RULES_DATA_FETCH_COMPLETE
    }
}

export function fetchAnomalousRulesDataFailure(error) {
    return {
        type:ANOMALOUS_RULES_DATA_FETCH_ERROR,
        payload:error
    }
}

export function toggleAcceptDrawer(){
    return {
        type:ACCEPT_RULE_DRAWER_TOGGLE
    }
}

export function handleDrawerClose(){
    return {
        type: CLOSE_ALL_DRAWER
    }
}

export function selectRecordToAccept(record){
    return {
        type : RULE_SELECTED_TO_ACCEPT,
        payload: record
    }
}

export function acceptRuleSuccess(){
    return {
        type:ACCEPT_ANOMALOUS_RULE_SUCCESS
    }
}

export function acceptRuleBegin(){
    return {
        type:ACCEPT_ANOMALOUS_RULE_BEGIN
    }
}

export function acceptRuleComplete(record){
    return{
        type:ACCEPT_ANOMALOUS_RULE_COMPLETE,
        payload:record
    }
}

export function acceptRuleError(error){
    return {
        type:ACCEPT_ANOMALOUS_RULE_ERROR,
        payload:error
    }
}

export function acceptAnomalousRule(auth_token,record){
    return(dispatch) => {
        dispatch(selectRecordToAccept(record));
        dispatch(toggleAcceptDrawer());

    }
}

export function cleanAllDrawerState(){
    return {
        type: CLEAN_ALL_STATE
    }
}

export function acceptRule(auth_token,record){
    return (dispatch) => {
        const url = VERIFY_RULE_API + record.id + '/';
        let headers = axiosHeader(auth_token);
        dispatch(acceptRuleBegin());
        axios.post(url,null,{headers})
            .then(res =>{
                const response = res.data;
                console.log(response);
                dispatch(acceptRuleSuccess());
            })
            .then(res => {
                dispatch(acceptRuleComplete(record));
                dispatch(toggleAcceptDrawer());
                setTimeout(()=>{dispatch(cleanAllDrawerState())},5000);
            })
            .catch(error => dispatch(acceptRuleError(error)));
    }
}



export function fetchAnomalousRulesData(auth_token, params, pagination){
    return(dispatch)=>{

        let headers = axiosHeader(auth_token);

        let bodyFormData = new FormData();

        dispatch(fetchAnomalousRulesDataBegin());
        axios.post(FETCH_API,bodyFormData,{headers, pagination})
            .then(res => {
                const response = res.data;
                console.log("anomalous rules",response);
                const page = pagination;
                page.total  = response.count;
                updatePagination(page);
                dispatch(fetchAnomalousRulesDataSuccess(response.results));
                dispatch(updatePaginationPageCount(response.count));
            })
            .then(res => dispatch(fetchAnomalousRulesDataComplete()))
            .catch(error => dispatch(fetchAnomalousRulesDataFailure(error)));
    }
}

export function updatePagination(pagination){
    return {
        type : PAGINATION_UPDATE,
        payload: pagination
    }
}

export function updatePaginationPageCount(pageCount){
    return {
        type : UPDATE_PAGINATION_PAGE_COUNT,
        payload: pageCount
    }
}