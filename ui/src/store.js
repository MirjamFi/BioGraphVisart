import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers/root';

const initialState = {
  vis: {
    cy: null,
  },
};

const middleware = [thunk];

const store = createStore(rootReducer, initialState, applyMiddleware(...middleware));

export default store;
