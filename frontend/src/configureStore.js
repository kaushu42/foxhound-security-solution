import { applyMiddleware, compose, createStore } from 'redux';
import thunkMiddleware,{thunk} from 'redux-thunk';
import loggerMiddleware from "./middleware/logger";
import monitorReducerEnhancer from "./enhancers/monitorReducer";
import rootReducer from "./rootReducer";


export default function configureStore(preloadedState) {
    const middlewares = [loggerMiddleware, thunkMiddleware]
    const middlewareEnhancer = applyMiddleware(...middlewares)

    const enhancers = [middlewareEnhancer, monitorReducerEnhancer]
    const composedEnhancers = compose(...enhancers)


    const store = createStore(rootReducer, preloadedState, composedEnhancers);
    const dev_store = createStore(rootReducer, applyMiddleware(thunk));

    return store;
}