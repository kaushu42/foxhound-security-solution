import React, {Component} from 'react';
import {Redirect, Route} from "react-router-dom";



function AuthenticatedRoute ({component: Component, auth_token, ...rest}) {
    return (
        <Route
            {...rest}
            render={(props) => auth_token!==null
                ? <Component {...props}/>
                : <Redirect to={{pathname: '/auth/login', state: {from: props.location}}} />}
        />
    )
}

export default AuthenticatedRoute;
