import {axiosHeader, ROOT_URL} from "../utils";
import axios from 'axios';
import {
    VERIFIED_RULES_DATA_FETCH_BEGIN,
    VERIFIED_RULES_DATA_FETCH_COMPLETE,
    VERIFIED_RULES_DATA_FETCH_ERROR,
    VERIFIED_RULES_DATA_FETCH_SUCCESS,
    CLOSE_ALL_DRAWER,
    RULE_SELECTED_TO_UPDATE
} from "../actionTypes/verifiedRulesActionType";

const FETCH_API  = `${ROOT_URL}rules/verified/`;

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


export function handleDrawerClose(){
    return {
        type: CLOSE_ALL_DRAWER
    }
}

export function updateVerifiedRule(auth_token,record){

}


export function fetchVerifiedRulesData(auth_token){
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


        dispatch(fetchVerifiedRulesDataBegin());
        axios.post(FETCH_API,bodyFormData,{headers})
            .then(res => {
                const response = res.data;
                console.log(response);
                dispatch(fetchVerifiedRulesDataSuccess(response));
            })
            .then(res => dispatch(fetchVerifiedRulesDataComplete()))
            .catch(error => dispatch(fetchVerifiedRulesDataFailure(error)));
    }
}