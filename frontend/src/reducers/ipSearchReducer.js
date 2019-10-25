const initialState = {
    ip_address_value : "192.168.114.4"
}


const ipSearchBarReducer = (state=initialState,action) => {
    switch (action.type) {
        case "SEARCHING":
            return {
                ...state,
                ip_address_value: action.payload.ip_address_value
            }
        default:
            return state;
    }
}


export default ipSearchBarReducer;

