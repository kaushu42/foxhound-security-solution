import {TOGGLE_SIDEBAR} from "../actionTypes/layoutActionType";

const initialState = {
    sideBarCollapsed : true
}


const layoutReducer = (state=initialState,action) => {
    switch(action.type){
        case TOGGLE_SIDEBAR:
            return {
                ...state,
                sideBarCollapsed: !state.sideBarCollapsed
            }
        default:
            return initialState;
    }
}

export default layoutReducer;