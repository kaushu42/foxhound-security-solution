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


export function fetchAnomalousRulesData(auth_token){
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


        dispatch(fetchAnomalousRulesDataBegin());
        axios.post(FETCH_API,bodyFormData,{headers})
            .then(res => {
                const response = res.data;
                console.log(response);
                dispatch(fetchAnomalousRulesDataSuccess(response));
            })
            .then(res => dispatch(fetchAnomalousRulesDataComplete()))
            .catch(error => dispatch(fetchAnomalousRulesDataFailure(error)));
    }
}