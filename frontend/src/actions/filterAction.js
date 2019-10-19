import {FIREWALL_RULE_FILTER_UPDATED,APPLICATION_FILTER_UPDATED} from '../actionTypes/filterActionTypes'

export const updateApplicationFilter = (value) => {
    return {
        type:APPLICATION_FILTER_UPDATED,
        payload : {
            application : value
        }
    }
}