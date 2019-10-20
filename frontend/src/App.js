import React, { Component, Fragment } from 'react';
import Dashboard from "./views/Dashboard";
import IpProfile from "./views/IpProfile";
import {BrowserRouter,Route,Switch} from 'react-router-dom';
import "antd/dist/antd.css";
import ProcessedLog from "./views/ProcessedLog";

class App extends Component {
  render() {
    return (
        <BrowserRouter>
            <Switch>
                <Route exact path="/"component={Dashboard}  />
                <Route path="/ipprofile"component={IpProfile}  />
                <Route path="/processedlogs"component={ProcessedLog}  />
            </Switch>
        </BrowserRouter>
    );
  }
}

export default App;
