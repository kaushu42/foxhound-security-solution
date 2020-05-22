import { applyMiddleware, compose, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';
import loggerMiddleware from "./middleware/logger";
import monitorReducerEnhancer from "./enhancers/monitorReducer";
import rootReducer from "./rootReducer";


export default function configureStore(preloadedState) {
    
    let middleware;
    if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
        // dev code
        middleware = [loggerMiddleware, thunkMiddleware]
      } else {
        // production code
        middleware = [thunkMiddleware]
    }

    const middlewares = middleware
    const middlewareEnhancer = applyMiddleware(...middlewares)

    const enhancers = [middlewareEnhancer, monitorReducerEnhancer]
    const composedEnhancers = compose(...enhancers)


    const store = createStore(rootReducer, preloadedState, composedEnhancers);

    return store;
}