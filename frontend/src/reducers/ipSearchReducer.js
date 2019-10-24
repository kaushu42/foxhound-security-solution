const initialState = {
    ip_address : "192.168.114.4"
}


const ipSearchReducer = (state=initialState,action) => {
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


export default ipSearchReducer;

