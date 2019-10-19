import React, { Component, Fragment } from 'react';
import Dashboard from "./views/Dashboard";
import "antd/dist/antd.css";

class App extends Component {
  render() {
    return (
        <Fragment>
            <Dashboard/>
        </Fragment>
    );
  }
}

export default App;
