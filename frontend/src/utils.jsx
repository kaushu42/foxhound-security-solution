let URL = "";
if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
  // dev code
  URL = "http://127.0.0.1:8000/api/v2/";
} else {
  // production code
  URL = "http://202.51.3.65/api/v2/";
}

export const ROOT_URL = URL;
//export const ROOT_URL = "http://202.51.3.65/api/v1/";;
//export const ROOT_URL = "http://127.0.0.1:8000/api/v1/"

export const contentLayout = {
  paddingLeft: 24,
  paddingRight: 24,
  paddingTop: 12
};

export const drawerInfoStyle = {
  paddingBottom: 10,
  paddingTop: 10,
  border: "1px solid rgb(235, 237, 240)"
};

export const axiosHeader = auth_token => {
  let token = `Token ${auth_token}`;
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: token
  };
};

export const bytesToSize = bytes => {
  let sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes == 0) return "0 Byte";
  let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
};


export const getDivisionFactorUnitsFromBasis = (max_data,basis) => {
  let division_factor = 1;
  let unit = "";
  if(basis=="bytes"){
    if (max_data > 1000000000) {
      division_factor = 1024*1024*1024;
      unit = "GB"
    }
    else if (max_data > 1000000 && max_data < 1000000000) {
      division_factor = 1024*1024;
      unit = "MB"
    }
    else if (max_data > 1000 && max_data < 1000000) {
      division_factor = 1024;
      unit = "KB"
    }
    else {
      division_factor = 1;
      unit = "B"
    }
  }
  else if (basis=="packets"){
    if (max_data > 1000000000) {
      division_factor = 1000*1000*1000;
      unit = "B packets"
    }
    else if (max_data > 1000000 && max_data < 1000000000) {
      division_factor = 1000*1000;
      unit = "M packets"
    }
    else if (max_data > 1000 && max_data < 1000000) {
      division_factor = 1000;
      unit = "K packets"
    }
    else {
      division_factor = 1;
      unit = "packets"
    }
  }
  else {
    if (max_data > 1000000000) {
      division_factor = 1000*1000*1000;
      unit = "B events"
    }
    else if (max_data > 1000000 && max_data < 1000000000) {
      division_factor = 1000*1000;
      unit = "M events"
    }
    else if (max_data > 1000 && max_data < 1000000) {
      division_factor = 1000;
      unit = "K events"
    }
    else {
      division_factor = 1;
      unit = "events"
    }
  }
  return {"division_factor":division_factor,"unit":unit,"basis":basis};
};


export const arrayMin = (arr) => {
  return arr.reduce(function (p, v) {
    return ( p < v ? p : v );
  });
};

export const arrayMax = (arr) => {
  return arr.reduce(function (p, v) {
    return ( p > v ? p : v );
  });
};