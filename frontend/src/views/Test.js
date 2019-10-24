import React, {Component, Fragment} from 'react';
import IpUsageActivityChart from "../components/IpUsageActivityChart";
import IpConnectionWiseUsageShankeyChart from "../components/IpConnectionWiseUsageShankeyChart";
import IpSearchBar from "../components/IpSearchBar";
import {connect} from "react-redux";

class Test extends  Component {
    render() {
        return (
            <Fragment>
                <IpSearchBar />
                <h1>{this.props.ip_search}</h1>
                {/*<IpUsageActivityChart search_address={this.props.ip_search}/>*/}
                <IpConnectionWiseUsageShankeyChart search_address={this.props.ip_search}/>
            </Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        ip_search : state.ipSearch.ip_address

    }
}

export default connect(mapStateToProps,null)(Test);
