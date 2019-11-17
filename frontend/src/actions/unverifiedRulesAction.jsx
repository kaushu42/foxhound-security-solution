import {axiosHeader, ROOT_URL} from "../utils";
import axios from 'axios';
import {
    ACCEPT_RULE_DRAWER_OPEN,
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


const FETCH_API  = `${ROOT_URL}rules/unverified/`;

const VERIFY_RULE_API = `${ROOT_URL}rules/verify/`;
const FLAG_RULE_API = `${ROOT_URL}rules/flag/`;

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
        type:ACCEPT_RULE_DRAWER_TOGGLE
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
        type : RULE_SELECTED_TO_ACCEPT,
        payload: record
    }
}

export function selectRecordToReject(record){
    return {
        type : RULE_SELECTED_TO_REJECT,
        payload: record
    }
}


export function acceptRuleSuccess(){
    return {
        type:ACCEPT_UNVERFIED_RULE_SUCCESS
    }
}

export function acceptRuleBegin(){
    return {
        type:ACCEPT_UNVERFIED_RULE_BEGIN
    }
}

export function acceptRuleComplete(record){
    return{
        type:ACCEPT_UNVERFIED_RULE_COMPLETE,
        payload:record
    }
}

export function acceptRuleError(error){
    return {
        type:ACCEPT_UNVERFIED_RULE_ERROR,
        payload:error
    }
}


export function rejectRuleSuccess(){
    return {
        type:REJECT_UNVERFIED_RULE_SUCCESS
    }
}

export function rejectRuleBegin(){
    return {
        type:REJECT_UNVERFIED_RULE_BEGIN
    }
}

export function rejectRuleComplete(record){
    return{
        type:REJECT_UNVERFIED_RULE_COMPLETE,
        payload:record
    }
}

export function rejectRuleError(error){
    return {
        type:REJECT_UNVERFIED_RULE_ERROR,
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
            })
            .catch(error => dispatch(acceptRuleError(error)));

    }
}





export function rejectRule(auth_token,record){
    return (dispatch) => {

        const url = FLAG_RULE_API + record.id + '/';
        let headers = axiosHeader(auth_token);
        dispatch(rejectRuleBegin());
        axios.post(url,null,{headers})
            .then(res =>{
                const response = res.data;
                console.log(response);
                dispatch(rejectRuleSuccess());
            })
            .then(res => {
                dispatch(rejectRuleComplete(record));
                dispatch(toggleRejectDrawer());
            })
            .catch(error => dispatch(rejectRuleError(error)));

    }
}




export function fetchUnverifiedRulesData(auth_token){
    return(dispatch)=>{

        let headers = axiosHeader(auth_token);

        dispatch(fetchUnverifiedRulesDataBegin());
        axios.post(FETCH_API,null,{headers})
            .then(res => {
                const response = res.data;
                console.log(response);
                dispatch(fetchUnverifiedRulesDataSuccess(response));
            })
            .then(res => dispatch(fetchUnverifiedRulesDataComplete()))
            .catch(error => dispatch(fetchUnverifiedRulesDataFailure(error)));

    }
}