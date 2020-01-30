import { ROOT_URL } from "../utils";
import axios from "axios";

const FETCH_AVERAGE_TREND_API = `${ROOT_URL}profile/average-daily/`;

export const ipUsageAverageTrendDataService = (auth_token,ip_address,basis,date) => {
    console.log("*******FETCHING AVERAGE AND CURRENT DATA******")
    const authorization = `Token ${auth_token}`;
    console.log(authorization)
    let headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: authorization
    };

    let bodyFormData = new FormData();
    bodyFormData.set('ip', ip_address);
    bodyFormData.set('date', date);
    bodyFormData.set('basis', basis);

    return axios.post(FETCH_AVERAGE_TREND_API,bodyFormData,{ headers })
};
