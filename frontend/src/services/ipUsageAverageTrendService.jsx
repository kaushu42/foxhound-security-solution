import { ROOT_URL } from "../utils";
import axios from "axios";

const FETCH_API = `${ROOT_URL}profile/average-daily/`;

export const ipUsageAverageTrendDataService = (auth_token,ip_address) => {
    const authorization = `Token ${auth_token}`;

    let headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: authorization
    };

    let bodyFormData = new FormData();
    bodyFormData.set('ip', ip_address);

    return axios.post(
        FETCH_API,
        bodyFormData,
        {
            headers: headers
        }
    );
};
