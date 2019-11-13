import {
    PASSWORD_CHANGE_BEGIN,
    PASSWORD_CHANGE_COMPLETE, PASSWORD_CHANGE_ERROR,
    PASSWORD_CHANGE_SUCCESS
} from "../actionTypes/accountActionType";

const initialState = {
    passwordChangeLoading : false,
    passwordChangeSuccess : false,
    passwordChangeError:false
}

const accountReducer = (state=initialState, action) => {
    switch (action.type) {
        case PASSWORD_CHANGE_BEGIN:
            return {
                ...state,
                passwordChangeLoading:true
            };
        case PASSWORD_CHANGE_COMPLETE:
            return {
                ...state,
                passwordChangeLoading : false,
            };
        case PASSWORD_CHANGE_SUCCESS:
            return {
                ...state,
                passwordChangeSuccess:true
            };
        case PASSWORD_CHANGE_ERROR:
            return {
                ...state,
                passwordChangeError: true,
            };
        default:
            return state;
    }

}

export default accountReducer;