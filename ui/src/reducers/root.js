import { combineReducers } from 'redux';
import vis from './vis.reducer';

const reducers = {
  vis,
}

export default combineReducers(reducers);
