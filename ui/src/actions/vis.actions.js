import * as types from './types/vis.types';

export const updateCy = (cy) => {
  return {
    type: types.UPDATE_CY,
    cy,
  }
};
