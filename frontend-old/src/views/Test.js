import React, { Component, Fragment } from "react";
import IpUsageActivityChart from "../components/IpUsageActivityChart";
import IpConnectionWiseUsagesankeyChart from "../components/IpConnectionWiseUsagesankeyChart";
import IpSearchBar from "../components/IpSearchBar";
import { connect } from "react-redux";
import Sidebar from "./layout/SideBar";

class Test extends Component {
  render() {
    return (
      <Fragment>
        <Sidebar />
        <IpSearchBar />
        <h1>{this.props.ip_address}</h1>
        <IpConnectionWiseUsagesankeyChart
          search_address={this.props.ip_address}
        />
      </Fragment>
    );
  }
}

const mapStateToProps = state => {
  return {
    ip_address: state.ipSearchBar.ip_address_value
  };
};

export default connect(
  mapStateToProps,
  null
)(Test);
