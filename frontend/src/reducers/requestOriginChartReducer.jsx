import {
    COUNTRY_LIST_DATA_FETCH_COMPLETE,
    COUNTRY_LIST_DATA_FETCH_ERROR,
    COUNTRY_LIST_DATA_FETCH_SUCCESS,
    EXCLUDE_COUNTRY_UPDATED,
    MAP_CHART_DATA_FETCH_COMPLETE,
    MAP_CHART_DATA_FETCH_SUCCESS,
    MAP_CHART_ERROR,
    MAP_CHART_LOADING,
    MAP_CHART_COUNTRY_SELECTED
} from "../actionTypes/RequestOriginChartActionType";

const initialState = {
    mapChartLoading : false,
    mapChartData : null,
    countrySelectListData : null,
    errorMessage : "",
    excludeCountries : [],
    mapChartSelectedCountryCode : null,
    mapChartSelectedCountryName :null,
    mapSelectedCountryLogData : [],
    mapChartLogDrawerVisible: false
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
        default:
            return state;
    }
}

export default requestOriginChartReducer;