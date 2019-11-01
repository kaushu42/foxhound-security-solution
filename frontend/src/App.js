import React, { Component } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import "antd/dist/antd.css";
import Login from "./views/auth/Login";
import PrivateRoute from "./providers/AuthenticatedRouter";
import { connect } from "react-redux";
import IpAddressProfile from "./views/IpAddressProfile";
import Logout from "./views/auth/Logout";
import Dashboard from "./views/Dashboard";
import Test from "./views/Test";
import "./App.css";

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/auth/login" component={Login} />
          <Route path="/auth/logout" component={Logout} />
          <Route path="/test" component={Test} />
          <PrivateRoute
            auth_token={this.props.auth_token}
            exact
            path="/"
            component={Dashboard}
          />
          <PrivateRoute
            auth_token={this.props.auth_token}
            path="/ip"
            component={IpAddressProfile}
          />
        </Switch>
      </BrowserRouter>
    );
  }
}

const mapStateToProps = state => {
  return {
    auth_token: state.auth.auth_token
  };
};

const mapDispatchToProps = dispatch => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
