import axios from "axios";
import {axiosHeader, ROOT_URL} from "../utils";
import {
    MAP_CHART_ERROR,
    MAP_CHART_DATA_FETCH_COMPLETE,
    MAP_CHART_DATA_FETCH_SUCCESS,
    MAP_CHART_LOADING,
    COUNTRY_LIST_DATA_FETCH_SUCCESS,
    COUNTRY_LIST_DATA_FETCH_COMPLETE,
    COUNTRY_LIST_DATA_FETCH_ERROR,
    EXCLUDE_COUNTRY_UPDATED,
    MAP_CHART_COUNTRY_SELECTED,
    MAP_CHART_DRAWER_VISIBLE,
    MAP_CHART_COUNTRY_LOG_FETCH_ERROR,
    CLOSE_MAP_CHART_LOG_DRAWER,
    OPEN_MAP_CHART_LOG_DRAWER,
    MAP_CHART_LOG_FETCH_SUCCESS, 
    REQUEST_ORIGIN_MAP_PAGINATION_UPDATE, 
    REQUEST_ORIGIN_MAP_UPDATE_PAGINATION_PAGE_COUNT, 
    COUNTRY_LOG_DATA_FETCH_LOADING
} from "../actionTypes/RequestOriginChartActionType";

const FETCH_API = `${ROOT_URL}dashboard/map/`;
const FETCH_API_COUNTRY_NAMES = `${ROOT_URL}dashboard/countries/`;
const FETCH_API_COUNTRY_LOGS = `${ROOT_URL}log/request-origin/`;

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

export function updateExcludingCountryList(excluding_countries){
    return {
        type : EXCLUDE_COUNTRY_UPDATED,
        payload: excluding_countries
    }
}

export function mapChartCountrySelected(selected_country_code,selected_country_name){
    return {
        type: MAP_CHART_COUNTRY_SELECTED,
        payload : {
            country_code : selected_country_code,
            country_name : selected_country_name
        }
    }
}

export function closeMapChartLogDrawer(){
    return {
        type: CLOSE_MAP_CHART_LOG_DRAWER
    }
}

export function openMapChartLogDrawer(){
    return {
        type: OPEN_MAP_CHART_LOG_DRAWER
    }
}


export function fetchMapChartLogDataError(error){
    return {
        type: MAP_CHART_COUNTRY_LOG_FETCH_ERROR,
        payload:error
    }
}

export function fetchSelectedCountryLogSuccess(response){
    return {
        type: MAP_CHART_LOG_FETCH_SUCCESS,
        payload: response
    }
}

export function updatePaginationPageCount(pageCount){
    return {
        type : REQUEST_ORIGIN_MAP_UPDATE_PAGINATION_PAGE_COUNT,
        payload: pageCount
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
export function updateMapAfterExcludingCountries(excluding_countries){
 return (dispatch)=> {
     dispatch(updateExcludingCountryList(excluding_countries));
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

export function countrySelectedInMapChart(event,auth_token,start_date,end_date,firewall_rule,application,protocol,source_zone,destination_zone,excludeCountries,params,pagination){
    return (dispatch) => {

        dispatch(mapChartCountrySelected(event.point['hc-key'],event.point.name));
        dispatch(fetchSelectedCountryLog(auth_token,start_date,end_date,firewall_rule,application,protocol,source_zone,destination_zone,excludeCountries,params,pagination,event.point['hc-key']));
        dispatch(openMapChartLogDrawer());
    }
}


export function countryLogDataFetchLoading(){
    return {
        type: COUNTRY_LOG_DATA_FETCH_LOADING
    }
}
export function fetchSelectedCountryLog(auth_token,start_date,end_date,firewall_rule,application,protocol,source_zone,destination_zone,excludeCountries,params,pagination,mapChartSelectedCountryCode){
    return(dispatch)=>{
        let headers = axiosHeader(auth_token);

        let bodyFormData = new FormData();
        bodyFormData.set('country', mapChartSelectedCountryCode);
        bodyFormData.set('except_countries', excludeCountries);
        bodyFormData.set('start_date', start_date);
        bodyFormData.set('end_date', end_date);
        bodyFormData.set('firewall_rule', firewall_rule);
        bodyFormData.set('application', application);
        bodyFormData.set('protocol', protocol);
        bodyFormData.set('source_zone', source_zone);
        bodyFormData.set('destination_zone', destination_zone);
        bodyFormData.set('page', params.page ? params.page : 1);
        bodyFormData.set('offset', 10);

        axios.post(FETCH_API_COUNTRY_LOGS,bodyFormData,{headers,params})
         .then(res => {
             const response = res.data;
             console.log('response count',response.count);
             const page = pagination;
             page.total  = response.count;
             updatePagination(page);
             dispatch(countryLogDataFetchLoading());
             dispatch(updatePaginationPageCount(response.count));
             dispatch(fetchSelectedCountryLogSuccess(response.results));

         })
         .catch(e => dispatch(fetchMapChartLogDataError(e)))
    }
}

export function updatePagination(pagination){
    return {
        type : REQUEST_ORIGIN_MAP_PAGINATION_UPDATE,
        payload: pagination
    }
}