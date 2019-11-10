//--core packages
import React, {Component, Fragment} from "react";
import {connect} from "react-redux";

//--ant.design
import {Col, PageHeader, Row} from "antd";


//--components
import Filter from "../components/Filter";
import IpSearchBar from "../components/IpSearchBar";
import IpUsageAverageDailyTrendChart from "../components/IpUsageAverageLineChart";
import IpUsageTimeSeriesChart from "../components/IpUsageTimeSeriesChart";
import IpProfileStats from "../components/stats/IpProfileStats";
import IpAsSourceSankeyChart from "../components/charts/IpAsSourceSankeyChart";
import IpAsDestinationSankeyChart from "../components/charts/IpAsDestinationSankeyChart";

//--layouts and styles
import MasterLayout from "./layout/MasterLayout";
import {contentLayout} from "../utils";

class Ip extends Component{
    render(){
        return(
            <Fragment>
                <MasterLayout>
                    <PageHeader
                        style={{background: '#fff'}}
                        title={"IP Address Profile"}
                        onBack={() => window.history.back()} />
                    <IpProfileStats />
                    <Row style={contentLayout}>
                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <IpSearchBar />
                        </Col>
                    </Row>
                    <Row style={contentLayout}>
                        <Filter />
                    </Row>
                    <Row style={contentLayout}>
                        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                            <IpUsageAverageDailyTrendChart/>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                            <IpUsageTimeSeriesChart />
                        </Col>
                    </Row>
                    <Row style={contentLayout}>
                        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                            <IpAsSourceSankeyChart />
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                            <IpAsDestinationSankeyChart />
                        </Col>

                    </Row>
                </MasterLayout>
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
export default connect(mapStateToProps,mapDispatchToProps)(Ip);