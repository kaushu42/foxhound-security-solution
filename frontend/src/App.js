import React, { Component} from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import "antd/dist/antd.css";
import IpAddressProfile from "./views/IpAddressProfile";

class App extends Component {
    render() {
        return (
            <BrowserRouter>
                <Switch>
                    <Route exact path="/" component={IpAddressProfile} />
                </Switch>
            </BrowserRouter>
        );
    }
}

export default App;