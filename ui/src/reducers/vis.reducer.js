import * as types from '../actions/types/vis.types';

const DEFAULT_VIEWER_STATE = {
  cy: null,
  graph: null,
};

const visReducer = (state = DEFAULT_VIEWER_STATE, action) => {
  const newState = { ...state };
  switch (action.type) {
    case types.UPDATE_CY:
      newState.cy = action.cy;
      return newState;
    default:
      return state;
  }
}

export default visReducer;
