import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import {createStore, combineReducers} from 'redux';
import {Provider} from 'react-redux';
import filterReducer from './reducers/filterReducer';

// "token": "67e9965410297c949312bbcf17447a94cb19e242"


const rootReducer = combineReducers({
    filter: filterReducer
})

const store = createStore(rootReducer);



ReactDOM.render(
  <Provider store={store}>
      <App />
  </Provider>,
  document.getElementById('root')
);
