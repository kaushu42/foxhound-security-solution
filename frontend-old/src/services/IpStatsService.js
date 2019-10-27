import {ROOT_URL} from "../utils";
import axios from "axios";

const FETCH_URL = `${ROOT_URL}profile/usage/`

export const IpStatsServiceAsync = (ip_address,auth_token) => {

    const authorization = `Token ${auth_token}`;

    let headers = {
        "authorization": authorization
    };

    let data = {
        ip: ip_address
    }

    return  axios.post(FETCH_URL, data,{
        headers: headers,
    });

}