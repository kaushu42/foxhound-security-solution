import { ROOT_URL } from "../utils";
import axios from "axios";

const FETCH_API = `${ROOT_URL}profile/usage/`;

export const ipUsageDataService = (auth_token,ip_address,basis,props) => {
    const authorization = `Token ${auth_token}`;

    let headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: authorization
    };

    let bodyFormData = new FormData();
    bodyFormData.set('ip', ip_address);
    bodyFormData.set('start_date', props.date_range[0]);
    bodyFormData.set('end_date', props.date_range[1]);
    bodyFormData.set('firewall_rule', props.firewall_rule);
    bodyFormData.set('application', props.application);
    bodyFormData.set('protocol', props.protocol);
    bodyFormData.set('source_zone', props.source_zone);
    bodyFormData.set('destination_zone', props.destination_zone);
    bodyFormData.set('basis', basis);
    
    return axios.post(
        FETCH_API,
        bodyFormData,
        {
            headers: headers
        }
    );
};
