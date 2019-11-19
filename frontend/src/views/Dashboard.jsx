import React, {Component, Fragment} from 'react';
import {connect} from "react-redux";
import MasterLayout from "./layout/MasterLayout";
import {Card, Col, PageHeader, Row} from "antd";
import Filter from "../components/Filter";
import {contentLayout} from "../utils";
import DashboardStats from "../components/stats/DashboardStats";
import RequestOriginChart from "../components/charts/RequestOriginChart";
import BandwidthUsageChart from "../charts/BandwidthUsageChart";
import AnomalyBasedTroubleTicketTable from "../components/tables/AnomalyBasedTroubleTicketTable";

import DashboardFilter from "../components/DashboardFilter";
import RequestOriginWorldChart from "../components/charts/RequestOriginWorldChart";
import UnverifiedRulesTable from "../components/tables/UnverifiedRulesTable";
import VerifiedRulesTable from "../components/tables/VerifiedRulesTable";
import ApplicationLineChart from "../components/charts/ApplicationLineChart";
import AnomalousRulesTable from "../components/tables/AnomalousRulesTable";
import BlacklistAddress from "../components/BlacklistAddress";
import '../charts/chart.css';

class Dashboard extends Component{
    render() {
        return (
            <Fragment>
                <MasterLayout>
                    <PageHeader
                        style={{background: '#fff'}}
                        title={"Dashboard"}
                        onBack={() => window.history.back()} />
                    <Row style={contentLayout}>
                        <DashboardFilter />
                    </Row>
                    <Row style={contentLayout}>
                        <DashboardStats />
                    </Row>
                    <Row style={contentLayout}>
                        <Col xs={24} sm={24} md={24} lg={24} xl={12}>
                            <RequestOriginWorldChart/>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={24} xl={12} >
                            <BandwidthUsageChart />
                        </Col>
                    </Row>
                    <Row style={contentLayout}>
                        <Col xs={24} sm={24} md={24} lg={24} xl={18}>
                            <ApplicationLineChart />
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={24} xl={6}>
                            <BlacklistAddress />
                        </Col>

                    </Row>
                    <Row style={contentLayout}>
                        <UnverifiedRulesTable />
                    </Row>
                    <Row style={contentLayout}>
                        <AnomalousRulesTable />
                    </Row>
                    <Row style={contentLayout}>
                        <AnomalyBasedTroubleTicketTable />
                    </Row>
                </MasterLayout>

            </Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {

    }
}

const mapDispatchToProps = dispatch => {
    return {

    }
}

export default connect(mapStateToProps,mapDispatchToProps)(Dashboard);