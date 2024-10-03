import * as ActionTypes from './ActionTypes';

export const initialLat = (data) => ({
    type: ActionTypes.INITIAL_LAT,
    data: data
})

export const initialLng = (data) => ({
    type: ActionTypes.INITIAL_LNG,
    data: data
})

export const initialRegion = (data) => ({
    type: ActionTypes.INITIAL_REGION,
    data: data
})

export const GthLat = (data) => ({
    type: ActionTypes.GTH_LAT,
    data: data
})

export const GthLng = (data) => ({
    type: ActionTypes.GTH_LNG,
    data: data
})

export const GthRegion = (data) => ({
    type: ActionTypes.GTH_REGION,
    data: data
})

