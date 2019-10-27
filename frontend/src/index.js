import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import {createStore, combineReducers} from 'redux';
import {Provider} from 'react-redux';
import layoutReducer from "./reducers/layoutReducer";
import filterReducer from "./reducers/filterReducer";
import authReducer from "./reducers/authReducer";


const rootReducer = combineReducers({
    auth : authReducer,
    filter : filterReducer,
    layout : layoutReducer
})

const store = createStore(rootReducer);

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);