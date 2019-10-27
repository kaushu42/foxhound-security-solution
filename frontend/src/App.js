import React, { Component} from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import "antd/dist/antd.css";

class App extends Component {
    render() {
        return (
            <BrowserRouter>
                <Switch>
                    <Route exact path="/" component={IpAddr} />
                </Switch>
            </BrowserRouter>
        );
    }
}

export default App;