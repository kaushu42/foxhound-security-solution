import {SESSION_LOG_IN,SESSION_LOG_OUT} from '../actionTypes/authActionType';

export const sessionLogIn = (auth_response) => {
    return {
        type : SESSION_LOG_IN,
        payload : {
            auth_response : auth_response
        }
    }
}

export const sessionLogOut = () => {
    return {
        type : SESSION_LOG_OUT,
    }
}

