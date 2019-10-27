import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import {createStore, combineReducers} from 'redux';
import {Provider} from 'react-redux';
import layoutReducer from "./reducers/layoutReducer";


const rootReducer = combineReducers({
    layout : layoutReducer
})

const store = createStore(rootReducer);

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);