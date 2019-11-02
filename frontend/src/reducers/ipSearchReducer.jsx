const initialState = {
    ip_address : "172.16.232.5"
}


const ipSearchBarReducer = (state=initialState,action) => {
    switch (action.type) {
        case "SEARCHING":
            return {
                ...state,
                ip_address: action.payload.ip_address
            }
        default:
            return state;
    }
}


export default ipSearchBarReducer;

