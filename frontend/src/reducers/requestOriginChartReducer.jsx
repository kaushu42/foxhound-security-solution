import {
    COUNTRY_LIST_DATA_FETCH_COMPLETE,
    COUNTRY_LIST_DATA_FETCH_ERROR,
    COUNTRY_LIST_DATA_FETCH_SUCCESS,
    EXCLUDE_COUNTRY_UPDATED,
    MAP_CHART_DATA_FETCH_COMPLETE,
    MAP_CHART_DATA_FETCH_SUCCESS,
    MAP_CHART_ERROR,
    MAP_CHART_LOADING,
    MAP_CHART_COUNTRY_SELECTED,
    MAP_CHART_DRAWER_VISIBLE,
    MAP_CHART_COUNTRY_LOG_FETCH_ERROR,
    CLOSE_MAP_CHART_LOG_DRAWER,
    OPEN_MAP_CHART_LOG_DRAWER,
    MAP_CHART_LOG_FETCH_SUCCESS,
    REQUEST_ORIGIN_MAP_PAGINATION_UPDATE,
    COUNTRY_LOG_DATA_FETCH_LOADING
} from "../actionTypes/RequestOriginChartActionType";

const initialState = {
    mapChartLoading : false,
    mapChartData : null,
    countrySelectListData : null,
    errorMessage : "",
    excludeCountries : [],
    mapChartSelectedCountryCode : null,
    mapChartSelectedCountryName :null,
    mapSelectedCountryLogData : null,
    mapChartLogDrawerVisible: false,
    requestOriginMapPagination : {},
    countryLogDataLoading : false,
    mapSelectedCountryTotalBytesReceived: null,
    mapSelectedCountryTotalBytesSent: null,
    mapSelectedCountryTotalBytesEvents: null,
    mapSelectedCountryTotalBytesReceivedUnit: "",
    mapSelectedCountryTotalBytesSentUnit: ""
}

const requestOriginChartReducer = (state=initialState,action) => {
    switch (action.type) {
        case MAP_CHART_LOADING:
            return {
                ...state,
                mapChartLoading: true
            };
        case MAP_CHART_DATA_FETCH_COMPLETE:
            return {
                ...state,
                mapChartLoading: false
            }
        case MAP_CHART_DATA_FETCH_SUCCESS:
            return {
                ...state,
                mapChartData : action.payload.data
            }
        case MAP_CHART_ERROR:
            return {
                ...state,
                mapChartLoading: false,
                errorMessage: action.payload
            }
        case COUNTRY_LIST_DATA_FETCH_COMPLETE:
            return {
                ...state,
                mapChartLoading: false
            }
        case COUNTRY_LIST_DATA_FETCH_SUCCESS :
            return {
                ...state,
                countrySelectListData: action.payload
            }
        case COUNTRY_LIST_DATA_FETCH_ERROR :
            return {
                ...state,
                errorMessage: action.payload
            }
        case EXCLUDE_COUNTRY_UPDATED:
            return {
                ...state,
                excludeCountries:action.payload
            }
        case MAP_CHART_COUNTRY_SELECTED:
            return {
                ...state,
                mapChartSelectedCountryCode:action.payload.country_code,
                mapChartSelectedCountryName:action.payload.country_name
            }
        case MAP_CHART_DRAWER_VISIBLE:
            return{
                ...state,
                mapChartLogDrawerVisible : true
            }
        case MAP_CHART_COUNTRY_LOG_FETCH_ERROR:
            return {
                ...state,
                errorMessage:action.payload
            }
        case CLOSE_MAP_CHART_LOG_DRAWER:
                return{
                    ...state,
                    mapSelectedCountryLogData : null,
                    mapChartLogDrawerVisible : false
                }
        case OPEN_MAP_CHART_LOG_DRAWER:
            return {
                ...state,
                mapChartLogDrawerVisible : true
            }
        case MAP_CHART_LOG_FETCH_SUCCESS :
            let mapSelectedCountryTotalBytesSentUnit = ""
            let mapSelectedCountryTotalBytesReceivedUnit = ""
            if (action.payload.bytes_sent > 1000000000){
                action.payload.bytes_sent = (action.payload.bytes_sent/(1024*1024*1024))
                mapSelectedCountryTotalBytesSentUnit = "GB"
            }
            else if (action.payload.bytes_sent > 1000000 && action.payload.bytes_sent < 1000000000){
                action.payload.bytes_sent = (action.payload.bytes_sent/(1024*1024))
                mapSelectedCountryTotalBytesSentUnit = "MB"
            }
            else if (action.payload.bytes_sent > 1000 && action.payload.bytes_sent < 1000000){
                action.payload.bytes_sent = (action.payload.bytes_sent/(1024))
                mapSelectedCountryTotalBytesSentUnit = "KB"
            }
            else{
                action.payload.bytes_sent = (action.payload.bytes_sent)
                mapSelectedCountryTotalBytesSentUnit = "Bytes"
            }

            if (action.payload.bytes_received > 1000000000){
                action.payload.bytes_received = (action.payload.bytes_received/(1024*1024*1024))
                mapSelectedCountryTotalBytesReceivedUnit = "GB"
            }
            else if (action.payload.bytes_received > 1000000 && action.payload.bytes_received < 1000000000){
                action.payload.bytes_received = (action.payload.bytes_received/(1024*1024))
                mapSelectedCountryTotalBytesReceivedUnit = "MB"
            }
            else if (action.payload.bytes_received > 1000 && action.payload.bytes_received < 1000000){
                action.payload.bytes_received = (action.payload.bytes_received/(1024))
                mapSelectedCountryTotalBytesReceivedUnit = "KB"
            }
            else{
                action.payload.bytes_received = (action.payload.bytes_received)
                mapSelectedCountryTotalBytesReceivedUnit = "Bytes"
            }
            return{
                ...state,
                mapSelectedCountryLogData : action.payload.results,
                mapSelectedCountryTotalBytesReceived : action.payload.bytes_received,
                mapSelectedCountryTotalBytesSent : action.payload.bytes_sent,
                mapSelectedCountryTotalBytesEvents : action.payload.rows,
                mapSelectedCountryTotalBytesSentUnit: mapSelectedCountryTotalBytesSentUnit,
                mapSelectedCountryTotalBytesReceivedUnit: mapSelectedCountryTotalBytesReceivedUnit,
                countryLogDataLoading: false
            }
        case REQUEST_ORIGIN_MAP_PAGINATION_UPDATE :
            return {
                ...state,
                requestOriginMapPagination: action.payload
            }
        case COUNTRY_LOG_DATA_FETCH_LOADING:
            return {
                ...state,
                countryLogDataLoading: true
            }
        default:
            return state;
    }
}

export default requestOriginChartReducer;