import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import {Col, PageHeader, Row, Statistic} from "antd";
import MasterLayout from "./layout/MasterLayout";
import Filter from "../components/Filter";
import IpSearchBar from "../components/IpSearchBar";
import IpUsageAverageDailyTrendChart from "../components/IpUsageAverageLineChart";
import IpUsageTimeSeriesChart from "../components/IpUsageTimeSeriesChart";
import SankeyChart from "../charts/SankeyChart";
import CalendarChart from "../charts/CalendarChart";
import {contentLayout} from "../utils";
import IpProfileStats from "../components/IpProfileStats";
//https://react-google-charts.com/

class IpAddressProfile extends Component{
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
                            <SankeyChart/>
                        </Col>
                    </Row>
                    <Row style={contentLayout}>
                        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                            <CalendarChart />
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
export default connect(mapStateToProps,mapDispatchToProps)(IpAddressProfile);