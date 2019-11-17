import {axiosHeader, ROOT_URL} from "../utils";
import axios from 'axios';
import {
    UNVERIFIED_RULES_DATA_FETCH_BEGIN, UNVERIFIED_RULES_DATA_FETCH_COMPLETE, UNVERIFIED_RULES_DATA_FETCH_ERROR,
    UNVERIFIED_RULES_DATA_FETCH_SUCCESS
} from "../actionTypes/unverifiedRulesActionType";


const FETCH_API  = `${ROOT_URL}rules/unverified/`;

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
        type :UNVERIFIED_RULES_DATA_FETCH_ERROR,
        payload : error
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