import {
    COUNTRY_LIST_DATA_FETCH_COMPLETE, COUNTRY_LIST_DATA_FETCH_ERROR, COUNTRY_LIST_DATA_FETCH_SUCCESS,
    MAP_CHART_DATA_FETCH_COMPLETE,
    MAP_CHART_DATA_FETCH_SUCCESS, MAP_CHART_ERROR,
    MAP_CHART_LOADING
} from "../actionTypes/RequestOriginChartActionType";

const initialState = {
    mapChartLoading : false,
    mapChartData : [],
    countrySelectListData : [],
    errorMessage : ""
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
                countrySelectListData: [{id:"1",name:"np",code:"nepal"}]
            }
        case COUNTRY_LIST_DATA_FETCH_ERROR :
            return {
                ...state,
                errorMessage: action.payload
            }
        default:
            return state;
    }
}

export default requestOriginChartReducer;