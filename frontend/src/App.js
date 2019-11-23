import React, { Component } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import "antd/dist/antd.css";
import Login from "./views/auth/Login";
import AuthenticatedRoute from "./providers/AuthenticatedRoute";
import { connect } from "react-redux";
import IpAddressProfile from "./views/Ip";
import Logout from "./views/auth/Logout";
import Dashboard from "./views/Dashboard";
import Test from "./views/Test";
import "./App.css";
import ProcessedLogs from "./views/ProcessedLogs";
import VerifiedRules from "./views/VerifiedRules";
import ChangePassword from "./views/layout/ChangePassword";

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/auth/login" component={Login} />
          <Route path="/auth/logout" component={Logout} />
          <Route path="/test" component={Test} />
          <AuthenticatedRoute
              auth_token={this.props.auth_token}
              exact
              path="/auth/changepassword"
              component={ChangePassword}
          />
          <AuthenticatedRoute
              auth_token={this.props.auth_token}
              exact
              path="/rules/verified"
              component={VerifiedRules}
          />
          <AuthenticatedRoute
            auth_token={this.props.auth_token}
            exact
            path="/"
          >
            <Dashboard activePageKey={"dashboard"}/>
          </AuthenticatedRoute>
          <AuthenticatedRoute
            auth_token={this.props.auth_token}
            path="/ip"
            component={IpAddressProfile}
          />
          <AuthenticatedRoute path="/logs"><ProcessedLogs activePageKey={"logs"}/></AuthenticatedRoute>
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
