# FoxHound Backend

### API usage

- Most APIs support POST and GET request.
- First, you need to obtain the Authorization Token from the login API.
- Every api url starts with the format /api/v1/

---

#### Users API

##### Login API:

**URL**: `/api/v1/users/login/`

- Send a POST request to the url.
- The body must be of the format:

```
{
	"username":<username>,
	"password":<password>
}
```

**REPLY:** Token information

- Save the token, you need to always send it to other APIs.
- Send the token in the Authorization header, in the format \* Authorization: Token <your_token_here>

---

#### Dashboard API

##### Usage API:

**URL**: `/api/v1/dashboard/usage/`

- Send a POST/GET request to the url.
- Include a Authorization Header with the request.
- No body required

**REPLY:** JSON of the format:

```
	{
    	n_items: 'The number of data points',
        bytes_sent: [
        	{
            	"x": Value for the x-axis point,
                "y": Value for the y-axis point
            }
        ],
        bytes_received: [
        	{
            	"x": Value for the x-axis point,
                "y": Value for the y-axis point
            }
        ],
    }
```

- **bytes_sent** is the data for the total data sent by the virtual system
- - **bytes_received** is the data for the total data received by the virtual system.

---

##### Activity API:

**URL**: `/api/v1/dashboard/activity/`

- Send a POST/GET request to the url.
- Include a Authorization Header with the request.
- No body required

**REPLY:** JSON of the format:

```
	{
    	n_items: 'The number of data points',
        activity_bytes_sent: [
        	{
            	"day": A day,
                "value": Total megabytes sent for that day
            }
        ],
        activity_bytes_received: [
        	{
            	"day": A day,
                "value": Total megabytes received for that day
            }
        ],
    }
```

- **activity_bytes_sent** is the data for the total data sent by the virtual system
- - **activity_bytes_received** is the data for the total data received by the virtual system.

---

##### Stats API:

**URL**: `/api/v1/dashboard/stats/`

- Send a POST/GET request to the url.
- Include a Authorization Header with the request.
- No body required

**REPLY:** JSON of the format:

```
	{
      "uplink": Total uplink in bytes,
      "downlink": Total downlink in bytes,
      "opened_tt": The number of open trouble tickets,
      "new_rules": null
	}
```

---

##### Filters API:

**URL**: `/api/v1/dashboard/filters/`

- Send a POST/GET request to the url.
- Include a Authorization Header with the request.
- No body required

**REPLY:** JSON of the format:

```
	{
    	"firewall_rule": ['All firewall rules'],
        "application: ['All applications'],
        "protocol": ['All protocols'],
        "source_zone":['All source zones'],
        "destination_zone":['Add destination zones']
    }
```

---

##### Rules API:

**URL**: `/api/v1/dashboard/rules/` \*_Not implemented_

---

#### Profiles API

##### Usage API:

**URL**: `/api/v1/profile/usage/`

- Send a POST/GET request to the url.
- Include a Authorization Header with the request.
- Send a request body with

```
	{
		"ip": "the required ip"
    }
```

**REPLY:** JSON of the format:

```
	{
    	n_items: 'The number of data points',
        bytes_sent: [
        	{
            	"x": Value for the x-axis point,
                "y": Value for the y-axis point
            }
        ],
        bytes_received: [
        	{
            	"x": Value for the x-axis point,
                "y": Value for the y-axis point
            }
        ],
    }
```

- **bytes_sent** is the data for the total data sent by the IP
- - **bytes_received** is the data for the total data received by the IP.

---

##### Activity API:

**URL**: `/api/v1/profile/activity/`

- Send a POST/GET request to the url.
- Include a Authorization Header with the request.
- Send a request body with

```
	{
		"ip": "the required ip"
    }
```

**REPLY:** JSON of the format:

```
	{
    	n_items: 'The number of data points',
        activity_bytes_sent: [
        	{
            	"day": A day,
                "value": Total megabytes sent for that day
            }
        ],
        activity_bytes_received: [
        	{
            	"day": A day,
                "value": Total megabytes received for that day
            }
        ],
    }
```

- **activity_bytes_sent** is the data for the total data sent by the IP
- - **activity_bytes_received** is the data for the total data received by the IP.

---

##### Stats API:

**URL**: `/api/v1/profile/stats/`

- Send a POST/GET request to the url.
- Include a Authorization Header with the request.
- Send a request body with

```
	{
		"ip": "the required ip"
    }
```

**REPLY:** JSON of the format:

```
	{
      "uplink": Total uplink in bytes,
      "downlink": Total downlink in bytes,
      "opened_tt": The number of open trouble tickets,
      "new_rules": null
	}
```

---
