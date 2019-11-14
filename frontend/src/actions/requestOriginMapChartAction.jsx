import axios from "axios";
import {axiosHeader, ROOT_URL} from "../utils";
import {
    MAP_CHART_ERROR,
    MAP_CHART_DATA_FETCH_COMPLETE,
    MAP_CHART_DATA_FETCH_SUCCESS,
    MAP_CHART_LOADING,
    UPDATE_MAP_CHART, COUNTRY_LIST_DATA_FETCH_SUCCESS, COUNTRY_LIST_DATA_FETCH_COMPLETE, COUNTRY_LIST_DATA_FETCH_ERROR
} from "../actionTypes/RequestOriginChartActionType";

const FETCH_API = `${ROOT_URL}dashboard/map/`;
const FETCH_API_COUNTRY_NAMES = `${ROOT_URL}dashboard/countries/`;


export function fetchMapChartError(error) {
    return{
        type: MAP_CHART_ERROR,
        payload:error
    }

}

export function fetchMapChartDataComplete() {
    return{
        type: MAP_CHART_DATA_FETCH_COMPLETE
    }

}

export function fetchMapChartDataSuccess(response){
    return {
        type: MAP_CHART_DATA_FETCH_SUCCESS,
        payload: response
    }
}

export function mapChartLoading() {
    return {
        type:MAP_CHART_LOADING
    }

}

export function fetchCountryListSuccess(response){
    return {
        type: COUNTRY_LIST_DATA_FETCH_SUCCESS,
        payload : response
    }

}

export function fetchCountryListDataComplete() {
    return {
        type: COUNTRY_LIST_DATA_FETCH_COMPLETE,
    }
}

export function fetchCountryListDataError(error){
    return {
        type: COUNTRY_LIST_DATA_FETCH_ERROR,
        payload:error
    }

}

export function fetchCountryListData(auth_token,start_date,end_date,firewall_rule,application,protocol,source_zone,destination_zone,except_countries){
    return (dispatch) => {

        let headers = axiosHeader(auth_token);

        let bodyFormData = new FormData();
        bodyFormData.set('except_countries', except_countries);
        bodyFormData.set('start_date', start_date);
        bodyFormData.set('end_date', end_date);
        bodyFormData.set('firewall_rule', firewall_rule);
        bodyFormData.set('application', application);
        bodyFormData.set('protocol', protocol);
        bodyFormData.set('source_zone', source_zone);
        bodyFormData.set('destination_zone', destination_zone);

        axios.post(FETCH_API_COUNTRY_NAMES,bodyFormData,{headers})
            .then(res => {
                const response = res.data;
                console.log('fetched country select List data ',response);
                dispatch(fetchCountryListSuccess(response))})
            .then(res => dispatch(fetchCountryListDataComplete()))
            .catch(e => dispatch(fetchCountryListDataError(e)))

    }
}

export function fetchRequestOriginMapData(auth_token,start_date,end_date,firewall_rule,application,protocol,source_zone,destination_zone,except_countries){
 return (dispatch) => {

    let headers = axiosHeader(auth_token);

     let bodyFormData = new FormData();
     bodyFormData.set('except_countries', except_countries);
     bodyFormData.set('start_date', start_date);
     bodyFormData.set('end_date', end_date);
     bodyFormData.set('firewall_rule', firewall_rule);
     bodyFormData.set('application', application);
     bodyFormData.set('protocol', protocol);
     bodyFormData.set('source_zone', source_zone);
     bodyFormData.set('destination_zone', destination_zone);

     axios.post(FETCH_API,bodyFormData,{headers})
         .then(res => {
             const response = res.data;
             dispatch(mapChartLoading());
             console.log('fetched request origin map chart data ',response);
             dispatch(fetchMapChartDataSuccess(response));
         })
         .then(res => dispatch(fetchMapChartDataComplete()))
         .catch(e => dispatch(fetchMapChartError(e)))

    }
}
