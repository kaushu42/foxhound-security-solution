import React, {Component} from 'react';
import {Redirect, Route} from "react-router-dom";
import TokenChecker from "./TokenChecker";



function AuthenticatedRoute ({component: Component, auth_token, ...rest}) {
    return (
        <Route
            {...rest}
            render={(props) => auth_token!==null
                ? (<TokenChecker><Component {...props}/></TokenChecker>)
                : <Redirect to={{pathname: '/auth/login', state: {from: props.location}}} />}
        />
    )
}

export default AuthenticatedRoute;
