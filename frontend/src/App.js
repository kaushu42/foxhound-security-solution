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
import UnverifiedRules from "./views/rules/UnverifiedRules";
import AnomalousRules from "./views/rules/AnomalousRules";
import ActiveTickets from "./views/troubletickets/ActiveTickets";
import ClosedTickets from "./views/troubletickets/ClosedTickets";
import MyTickets from "./views/troubletickets/MyTickets";
import VerifiedRules from "./views/rules/VerifiedRules";
import ChangePassword from "./views/layout/ChangePassword";
import TrafficLogs from "./views/processedlogs/TrafficLogs";
import ThreatLogs from "./views/processedlogs/ThreatLogs";
import ChangeAlias from "./views/ChangeAlias"

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/auth/login" component={Login} />
          <Route path="/auth/logout" component={Logout} />
          <Route path="/test" component={Test} />
          {/*Dashboard*/}
          <AuthenticatedRoute
            auth_token={this.props.auth_token}
            exact
            path="/"
            activePageKey={"dashboard"}
            component={Dashboard}
          />
          <AuthenticatedRoute
            auth_token={this.props.auth_token}
            path="/ip"
            activePageKey={"ip"}
            component={IpAddressProfile}
          />
          <AuthenticatedRoute
            auth_token={this.props.auth_token}
            path="/changealias"
            activePageKey={"changealias"}
            component={ChangeAlias}
          />

          {/*Processed Logs*/}

          <AuthenticatedRoute
            auth_token={this.props.auth_token}
            path="/logs/traffic"
            component={TrafficLogs}
            activePageKey={"traffic-processedlogs"}
          />
          <AuthenticatedRoute
            auth_token={this.props.auth_token}
            path="/logs/threat"
            component={ThreatLogs}
            activePageKey={"threat-processedlogs"}
          />

          {/*Rules*/}
          <AuthenticatedRoute
            auth_token={this.props.auth_token}
            path="/rules/verified"
            component={VerifiedRules}
            activePageKey={"verified-rules"}
          />
          <AuthenticatedRoute
            auth_token={this.props.auth_token}
            path="/rules/unverified"
            component={UnverifiedRules}
            activePageKey={"unverified-rules"}
          />
          <AuthenticatedRoute
            auth_token={this.props.auth_token}
            path="/rules/anomalous"
            component={AnomalousRules}
            activePageKey={"anomalous-rules"}
          />

          {/*Trouble Tickets*/}
          <AuthenticatedRoute
            auth_token={this.props.auth_token}
            path="/tt/active"
            component={ActiveTickets}
            activePageKey={"active-tt"}
          />
          <AuthenticatedRoute
            auth_token={this.props.auth_token}
            path="/tt/closed"
            component={ClosedTickets}
            activePageKey={"closed-tt"}
          />
          <AuthenticatedRoute
            auth_token={this.props.auth_token}
            path="/tt/my"
            component={MyTickets}
            activePageKey={"my-tt"}
          />
          {/*Account*/}
          <AuthenticatedRoute
            auth_token={this.props.auth_token}
            path="/auth/changepassword"
            activePageKey={"change-password"}
            component={ChangePassword}
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

export default connect(mapStateToProps, mapDispatchToProps)(App);
