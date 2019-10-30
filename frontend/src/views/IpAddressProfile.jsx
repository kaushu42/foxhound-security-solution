import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import {Col, PageHeader, Row, Statistic} from "antd";
import MasterLayout from "./layout/MasterLayout";
import Filter from "../components/Filter";
import IpSearchBar from "../components/IpSearchBar";
import IpUsageAverageDailyTrendChart from "../components/IpUsageDayAverageLineChart";
import IpUsageTimeSeriesChart from "../components/IpUsageTimeSeriesChart";
import SankeyChart from "../charts/SankeyChart";
import CalendarChart from "../charts/CalendarChart";
import CustomHighMap from "../charts/Map";
import DashboardStats from "../components/DashboardStats";
import HighMap from "../charts/highmap";
import {contentLayout} from "../utils";
class IpAddressProfile extends Component{
    render(){
        return(
            <Fragment>
                <MasterLayout>
                    <PageHeader
                        style={{background: '#efefef',border: '1px solid rgb(235, 237, 240)'}}
                        title={"IP Address Profile"}
                        onBack={() => window.history.back()} />
                    <Row type="flex" style={{paddingTop:24}}>
                        <Statistic
                            title="Static IP Address"
                            value="192.168.10.10"
                            style={{
                                margin: '0 20px',
                            }}

                        />
                        <Statistic
                            title="Alias Name"
                            value="core-db-server"
                            style={{
                                margin: '0 20px',
                            }}
                        />
                        <Statistic
                            title="Total Uplink"
                            suffix="MB"
                            value={1234}
                            style={{
                                margin: '0 20px',
                            }}
                        />
                        <Statistic
                            title="Total Downlink"
                            value={456}
                            suffix="MB"
                            style={{
                                margin: '0 20px',
                            }}
                        />
                    </Row>
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
                        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                            <SankeyChart />
                        </Col>
                    </Row>
                    <Row style={contentLayout}>
                        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                            <CalendarChart />
                        </Col>
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