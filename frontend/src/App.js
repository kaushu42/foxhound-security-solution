import React, { Component} from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import "antd/dist/antd.css";
import IpAddressProfile from "./views/IpAddressProfile";
import Login from "./views/auth/Login";

class App extends Component {
    render() {
        return (
            <BrowserRouter>
                <Switch>
                    <Route exact path="/" component={IpAddressProfile} />
                    <Route path="/auth/login" component={Login} />

                </Switch>
            </BrowserRouter>
        );
    }
}

export default App;