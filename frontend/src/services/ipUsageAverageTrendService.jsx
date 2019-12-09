import { ROOT_URL } from "../utils";
import axios from "axios";

const FETCH_AVERAGE_TREND_API = `${ROOT_URL}profile/average-daily/`;
const FETCH_CURRENT_USAGE_API = `${ROOT_URL}profile/date/`;

export const ipUsageAverageTrendDataService = (auth_token,ip_address,date) => {
    const authorization = `Token ${auth_token}`;

    let headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: authorization
    };

    let bodyFormDataForAverageDaily = new FormData();
    bodyFormDataForAverageDaily.set('ip', ip_address);

    let bodyFormData = new FormData();
    bodyFormData.set('ip', ip_address);
    bodyFormData.set('date', date);

    return axios.all([axios.post(FETCH_AVERAGE_TREND_API,bodyFormDataForAverageDaily,{headers: headers}), 
        axios.post(FETCH_CURRENT_USAGE_API,bodyFormData,{headers: headers})]
);
};
