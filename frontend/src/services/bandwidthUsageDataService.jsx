import { ROOT_URL } from "../utils";
import axios from "axios";

const FETCH_API = `${ROOT_URL}dashboard/usage/`;

export const bandwidthUsageDataService = (auth_token) => {
    const authorization = `Token ${auth_token}`;

    let headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: authorization
    };


    return axios.post(
        FETCH_API,
        bodyFormData,
        {
            headers: headers
        }
    );
};
