import {SESSION_LOG_IN,SESSION_LOG_OUT} from '../actionTypes/authActionType';

const initialState = {
    is_authenticated : localStorage.getItem("is_authenticated"),
    auth_token : localStorage.getItem("auth_token"),
    current_session_user_id : localStorage.getItem("current_session_user_id"),
    current_session_user_name : localStorage.getItem("current_session_user_name"),
    current_session_user_full_name : localStorage.getItem("current_session_user_full_name"),
    current_session_tenant_name : localStorage.getItem("current_session_tenant_name"),
    tenant_id : localStorage.getItem("tenant_id"),
    expires_in : localStorage.getItem("expires_in"),
}


const authReducer = (state = initialState,action) => {
    switch (action.type) {
        case SESSION_LOG_IN:
            localStorage.setItem('is_authenticated',"true");
            localStorage.setItem('auth_token', action.payload.auth_response.token);
            localStorage.setItem('current_session_user_id', action.payload.auth_response.user.id);
            localStorage.setItem('current_session_user_name', action.payload.auth_response.username);
            localStorage.setItem('current_session_user_full_name', action.payload.auth_response.full_name);
            localStorage.setItem('current_session_tenant_name', action.payload.auth_response.tenant_name);
            localStorage.setItem('tenant_id', action.payload.auth_response.tenant_id);
            localStorage.setItem('expires_in', action.payload.auth_response.expires_in);
            return {
                ...state,
                is_authenticated: true,
                auth_token: action.payload.auth_response.token,
                current_session_user_id : action.payload.auth_response.user.id,
                current_session_user_name : action.payload.auth_response.username,
                current_session_user_full_name : action.payload.auth_response.full_name,
                current_session_tenant_name : action.payload.auth_response.tenant_name,
                tenant_id : action.payload.auth_response.tenant_id,
                expires_in : action.payload.auth_response.expires_in
            }

        case SESSION_LOG_OUT:{
            localStorage.removeItem('is_authenticated');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('current_session_user_id');
            localStorage.removeItem('current_session_user_name');
            localStorage.removeItem('tenant_id');
            localStorage.removeItem('expires_in');
            localStorage.removeItem('current_session_user_full_name');
            localStorage.removeItem('current_session_tenant_name');
            return {
                ...state,
                is_authenticated: false,
                auth_token: null,
                current_session_user_id: null,
                current_session_user_name: null,
                tenant_id: null,
                expires_in: null

            }
        }
        default:
            return state;
    }

}


export default authReducer;