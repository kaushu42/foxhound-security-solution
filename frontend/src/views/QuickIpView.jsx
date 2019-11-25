//--core packages
import React, {Component, Fragment} from "react";
import {connect} from "react-redux";

//--ant.design
import {Col, PageHeader, Row} from "antd";


//--components
import Filter from "../components/Filter";
import IpSearchBar from "../components/IpSearchBar";
import IpUsageAverageDailyTrendChart from "../components/charts/IpUsageAverageLineChart";
import IpUsageTimeSeriesChart from "../components/charts/IpUsageTimeSeriesChart";
import IpProfileStats from "../components/stats/IpProfileStats";
import IpAsSourceSankeyChart from "../components/charts/IpAsSourceSankeyChart";
import IpAsDestinationSankeyChart from "../components/charts/IpAsDestinationSankeyChart";

//--layouts and styles
import MasterLayout from "./layout/MasterLayout";
import {contentLayout} from "../utils";

class QuickIpView extends Component{
    render(){
        return(
            <Fragment>
                <Row style={contentLayout}>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                        <IpUsageAverageDailyTrendChart/>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                        <IpUsageTimeSeriesChart />
                    </Col>
                </Row>
                <Row style={contentLayout}>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                        <IpAsSourceSankeyChart />
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                        <IpAsDestinationSankeyChart />
                    </Col>
                </Row>
            </Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        auth_token : state.auth.auth_token

    }
}
const mapDispatchToProps = dispatch => {
    return {

    }
}
export default connect(mapStateToProps,mapDispatchToProps)(QuickIpView);