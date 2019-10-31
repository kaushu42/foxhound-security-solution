import { ROOT_URL } from "../utils";
import axios from "axios";

const FETCH_API = `${ROOT_URL}dashboard/filters/`;

export const filterSelectDataServiceAsync = auth_token => {
  const authorization = `Token ${auth_token}`;

  let headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Headers": "*",
    Authorization: authorization
  };
  return axios.post(
    FETCH_API,
    {},
    {
      headers: headers
    }
  );
};
