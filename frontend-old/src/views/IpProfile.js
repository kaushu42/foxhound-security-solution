import React, {Component, Fragment} from "react";
import {PageHeader, Statistic, Row, Col,Divider} from 'antd';
import IpSearchBar from "../components/IpSearchBar";
import {connect} from "react-redux";
import Filter from "../components/Filter";
import Master from "./Master";
import IpUsageAverageDailyTrendChart from "../components/IpUsageDayAverageLineChart";
import IpUsageTimeSeriesChart from "../components/IpUsageTimeSeriesChart";

const contentLayout = {
    paddingLeft:24,
    paddingRight:24,
    paddingTop:12,
}

class IpProfile extends Component{
    render(){
        return(
            <Fragment>
                <Master>
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
                    <Divider />
                    <div style={contentLayout}>
                        <IpUsageAverageDailyTrendChart />
                    </div>
                    <div style={contentLayout}>
                        <IpUsageTimeSeriesChart />
                    </div>

                </Master>
            </Fragment>
        )
    }
}

const mapStateToProps = state => {
        return {
            ip_address : state.ipSearchBar.ip_address_value,
            auth_token : state.auth.auth_token
        }
}
const mapDispatchToProps = dispatch => {
        return {

        }
}
export default connect(mapStateToProps,mapDispatchToProps)(IpProfile);
