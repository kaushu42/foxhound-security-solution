import {
    DATE_RANGE_PICKER_FILTER_UPDATED,
    FIREWALL_RULE_FILTER_UPDATED,
    APPLICATION_FILTER_UPDATED,
    PROTOCOL_FILTER_UPDATED,
    SOURCE_ZONE_FILTER_UPDATED,
    DESTINATION_ZONE_FILTER_UPDATED,
    // IP_ADDRESS_FILTER_UPDATED
} from '../actionTypes/filterActionType'


export const updateDateRangePickerFilter = (value, defaultDate) => {
          
    return {
        type: DATE_RANGE_PICKER_FILTER_UPDATED,
        payload : {
            date_range: value,
        }
    }
}
export const updateFirewallRuleFilter = (value) => {
    return {
        type: FIREWALL_RULE_FILTER_UPDATED,
        payload : {
            firewall_rule: value
        }
    }
}
export const updateApplicationFilter = (value) => {
    return {
        type: APPLICATION_FILTER_UPDATED,
        payload : {
            application: value
        }
    }
}
export const updateProtocolFilter = (value) => {
    return {
        type: PROTOCOL_FILTER_UPDATED,
        payload : {
            protocol: value
        }
    }
}

export const updateSourceZoneFilter = (value) => {
    return {
        type: SOURCE_ZONE_FILTER_UPDATED,
        payload : {
            source_zone: value
        }
    }
}

export const updateDestinationZoneFilter = (value) => {
    return {
        type: DESTINATION_ZONE_FILTER_UPDATED,
        payload : {
            destination_zone: value
        }
    }
}

// export const updateIpAddressFilter = (value) =>{
//     return {
//         type: IP_ADDRESS_FILTER_UPDATED,
//         payload: {
//             ip_address: value
//         }
//     }
// }