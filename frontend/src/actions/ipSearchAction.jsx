export const search = (value) => {
    return {
        type: "SEARCHING",
        payload : {
            ip_address: value
        }
    }
}