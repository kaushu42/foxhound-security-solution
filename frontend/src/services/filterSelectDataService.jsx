import { ROOT_URL } from "../utils";
import axios from "axios";

const FETCH_API = `${ROOT_URL}dashboard/filters/`;

export const filterSelectDataServiceAsync = (auth_token) => {
  const authorization = `Token ${auth_token}`;

  let headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: authorization
  };

  let bodyFormData = new FormData();
  bodyFormData.set('domain_url');

  return axios.post(
    FETCH_API,
    bodyFormData,
    {
      headers: headers
    }
  );
};
