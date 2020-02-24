import { ROOT_URL } from "../utils";
import axios from "axios";

const FETCH_API = `${ROOT_URL}dashboard/filters/`;
const FETCH_IP_ADDRESSES = `${ROOT_URL}dashboard/ip-address/`
const FETCH_TRAFFIC_LOG_LATEST_DATE = `${ROOT_URL}log/latest/traffic/`;
const FETCH_THREAT_LOG_LATEST_DATE = `${ROOT_URL}log/latest/threat/`;

export const filterSelectDataServiceAsync = (auth_token) => {
  const authorization = `Token ${auth_token}`;

  let headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: authorization
  };
  
  return axios.all([axios.post(FETCH_API,null,{headers: headers}),
    axios.post(FETCH_TRAFFIC_LOG_LATEST_DATE,null,{headers: headers}),
    axios.post(FETCH_THREAT_LOG_LATEST_DATE,null,{headers: headers})
  ])

  // return axios.post(FETCH_API,null,{headers: headers})
          // axios.post(FETCH_IP_ADDRESSES,null,{headers: headers})

};
