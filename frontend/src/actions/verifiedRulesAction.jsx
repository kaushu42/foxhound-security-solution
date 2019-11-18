import {axiosHeader, ROOT_URL} from "../utils";
import axios from 'axios';
import {
    VERIFIED_RULES_DATA_FETCH_BEGIN,
    VERIFIED_RULES_DATA_FETCH_COMPLETE,
    VERIFIED_RULES_DATA_FETCH_ERROR,
    VERIFIED_RULES_DATA_FETCH_SUCCESS,
    PAGINATION_UPDATE, 
    UPDATE_PAGINATION_PAGE_COUNT,
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


export function fetchVerifiedRulesData(auth_token, params, pagination){
    return(dispatch)=>{

        let headers = axiosHeader(auth_token);

        let bodyFormData = new FormData();

        dispatch(fetchVerifiedRulesDataBegin());
        axios.post(FETCH_API,bodyFormData,{headers, params})
            .then(res => {
                const response = res.data;
                console.log("verified rules data", response.results);
                const page = pagination;
                page.total  = response.count;
                updatePagination(page);
                dispatch(fetchVerifiedRulesDataSuccess(response.results));
                dispatch(updatePaginationPageCount(response.count));
            })
            .then(res => dispatch(fetchVerifiedRulesDataComplete()))
            .catch(error => dispatch(fetchVerifiedRulesDataFailure(error)));
    }
}

export function updatePagination(pagination){
    return {
        type : PAGINATION_UPDATE,
        payload: pagination
    }
}

export function updatePaginationPageCount(pageCount){
    return {
        type : UPDATE_PAGINATION_PAGE_COUNT,
        payload: pageCount
    }
}