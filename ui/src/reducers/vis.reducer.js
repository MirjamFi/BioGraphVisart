import * as types from '../actions/types/vis.types';

const visReducer = (state = null, action) => {
  switch (action.type) {
    case types.UPDATE_CY:
      return {
        cy: action.cy
      };
    default:
      return state;
  }
}

export default visReducer;
