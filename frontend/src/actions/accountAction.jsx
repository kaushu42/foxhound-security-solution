import axios from 'axios';
import {ROOT_URL} from "../utils";
import {
    PASSWORD_CHANGE_BEGIN,
    PASSWORD_CHANGE_COMPLETE,
    PASSWORD_CHANGE_ERROR,
    PASSWORD_CHANGE_SUCCESS
} from "../actionTypes/accountActionType";


const FETCH_API = `${ROOT_URL}users/change-password/`;

export function passwordChangeBegin(){
    return {
        type: PASSWORD_CHANGE_BEGIN
    }
}


export function passwordChangeSuccess(){
   return {
       type: PASSWORD_CHANGE_SUCCESS,
   }
}

export function passwordChangeFailure(){
    return {
        type: PASSWORD_CHANGE_ERROR
    }
}

export function passwordChangeComplete(){
    return {
        type: PASSWORD_CHANGE_COMPLETE
    }
}

export function handlePasswordChange(auth_token,old_password, new_password,confirm_new_password) {
    return (dispatch) => {
        dispatch(passwordChangeBegin());
        const formData = new FormData();
        formData.set('old_password', old_password);
        formData.set('new_password', new_password);
        let headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Authorization" : `Token ${auth_token}`
        };
        axios.post(FETCH_API,formData,{headers})
            .then(res => dispatch(passwordChangeSuccess()))
            .then(res => dispatch(passwordChangeComplete()))
            .catch(e => dispatch(passwordChangeFailure()))
    }
}