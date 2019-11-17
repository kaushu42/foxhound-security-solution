import {axiosHeader, ROOT_URL} from "../utils";
import axios from 'axios';
import {
    ACCEPT_RULE_DRAWER_OPEN,
    ACCEPT_RULE_DRAWER_TOGGLE,
    ACCEPT_UNVERFIED_RULE_BEGIN,
    ACCEPT_UNVERFIED_RULE_COMPLETE,
    ACCEPT_UNVERFIED_RULE_ERROR,
    ACCEPT_UNVERFIED_RULE_SUCCESS,
    CLOSE_ALL_DRAWER,
    RULE_SELECTED_TO_ACCEPT,
    UNVERIFIED_RULES_DATA_FETCH_BEGIN,
    UNVERIFIED_RULES_DATA_FETCH_COMPLETE,
    UNVERIFIED_RULES_DATA_FETCH_ERROR,
    UNVERIFIED_RULES_DATA_FETCH_SUCCESS
} from "../actionTypes/unverifiedRulesActionType";


const FETCH_API  = `${ROOT_URL}rules/unverified/`;

const VERIFY_RULE_API = `${ROOT_URL}rules/verify/`;

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



export function acceptUnverifiedRule(auth_token,record){
    return(dispatch) => {
        dispatch(selectRecordToAccept(record));
        dispatch(toggleAcceptDrawer());

    }

}

export function rejectUnverifiedRule(auth_token,record){


}

export function updateUnverifiedRule(auth_token,record){

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

export function fetchUnverifiedRulesData(auth_token){
    return(dispatch)=>{

        let headers = axiosHeader(auth_token);

        let bodyFormData = new FormData();
        // bodyFormData.set('country', mapChartSelectedCountryCode);
        // bodyFormData.set('except_countries', excludeCountries);
        // bodyFormData.set('start_date', start_date);
        // bodyFormData.set('end_date', end_date);
        // bodyFormData.set('firewall_rule', firewall_rule);
        // bodyFormData.set('application', application);
        // bodyFormData.set('protocol', protocol);
        // bodyFormData.set('source_zone', source_zone);
        // bodyFormData.set('destination_zone', destination_zone);
        // bodyFormData.set('page', params.page ? params.page : 1);
        // bodyFormData.set('offset', 10);


        dispatch(fetchUnverifiedRulesDataBegin());
        axios.post(FETCH_API,bodyFormData,{headers})
            .then(res => {
                const response = res.data;
                console.log(response);
                dispatch(fetchUnverifiedRulesDataSuccess(response));
            })
            .then(res => dispatch(fetchUnverifiedRulesDataComplete()))
            .catch(error => dispatch(fetchUnverifiedRulesDataFailure(error)));

    }
}