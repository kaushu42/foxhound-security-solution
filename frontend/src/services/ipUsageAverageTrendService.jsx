import { ROOT_URL } from "../utils";
import axios from "axios";

const FETCH_AVERAGE_TREND_API = `${ROOT_URL}profile/average-daily/`;
const FETCH_CURRENT_USAGE_API = `${ROOT_URL}profile/time-series/`;

export const ipUsageAverageTrendDataService = (auth_token,ip_address,props) => {
    const authorization = `Token ${auth_token}`;

    let headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: authorization
    };

    let bodyFormData = new FormData();
    bodyFormData.set('ip', ip_address);
    // bodyFormData.set('start_date', props.date_range[0]);
    // bodyFormData.set('end_date', props.date_range[1]);
    // bodyFormData.set('firewall_rule', props.firewall_rule);
    // bodyFormData.set('application', props.application);
    // bodyFormData.set('protocol', props.protocol);
    // bodyFormData.set('source_zone', props.source_zone);
    // return axios.post(
    //     FETCH_API,
    //     bodyFormData,
    //     {
    //         headers: headers
    //     }
    // );
    return axios.all([axios.post(FETCH_AVERAGE_TREND_API,bodyFormData,{headers: headers}), 
        axios.post(FETCH_CURRENT_USAGE_API,bodyFormData,{headers: headers})]
);
};
