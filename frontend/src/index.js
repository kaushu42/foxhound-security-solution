import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import {createStore, combineReducers} from 'redux';
import {Provider} from 'react-redux';
import layoutReducer from "./reducers/layoutReducer";
import filterReducer from "./reducers/filterReducer";
import authReducer from "./reducers/authReducer";
import ipSearchBarReducer from "./reducers/ipSearchReducer";
import 'pace-js'
import 'pace-js/themes/blue/pace-theme-minimal.css'




const rootReducer = combineReducers({
    auth : authReducer,
    filter : filterReducer,
    layout : layoutReducer,
    ipSearchBar : ipSearchBarReducer
})

const store = createStore(rootReducer);

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);