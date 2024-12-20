import * as Actions from '../actions/ActionTypes'
const BookingReducer = (state = { initial_lat: undefined, initial_lng: undefined, initial_region: undefined, gth_lat: undefined, gth_lng: undefined, gth_region: undefined }, action) => {
    switch (action.type) {
        case Actions.INITIAL_LAT:
            return Object.assign({}, state, {
                initial_lat: action.data
            });
        case Actions.INITIAL_LNG:
            return Object.assign({}, state, {
                initial_lng: action.data
            });
        case Actions.INITIAL_REGION:
            return Object.assign({}, state, {
                initial_region: action.data
            });
        case Actions.GTH_LAT:
            return Object.assign({}, state, {
                gth_lat: action.data
            });
        case Actions.GTH_LNG:
            return Object.assign({}, state, {
                gth_lng: action.data
            });
        case Actions.GTH_REGION:
            return Object.assign({}, state, {
                gth_region: action.data
            });
        default:
            return state;
    }
}

export default BookingReducer;

