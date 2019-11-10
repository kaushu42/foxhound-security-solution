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
import TopSourceAddressChart from "../components/charts/TopSourceAddressChart";
import TopDestinationAddressChart from "../components/charts/TopDestinationAddressChart";
import TopApplicationChart from "../components/charts/TopApplicationChart";
import TopDestinationPortChart from "../components/charts/TopDestinationPortChart";

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
                        <Filter />
                    </Row>
                    <Row style={contentLayout}>
                        <DashboardStats />
                    </Row>
                    <Row style={contentLayout}>
                        {/*<DashboardThreatStats />*/}
                    </Row>

                    <Row style={contentLayout}>
                        <Col xs={24} sm={24} md={24} lg={24} xl={12}>
                            <Card>
                                <RequestOriginChart />
                            </Card>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={24} xl={12}>
                            <Card>
                                <BandwidthUsageChart />

                            </Card>
                        </Col>
                    </Row>
                    <Row style={contentLayout}>
                        <Col xs={24} sm={24} md={12} lg={6} xl={6}><TopSourceAddressChart/></Col>
                        <Col xs={24} sm={24} md={12} lg={6} xl={6}><TopDestinationAddressChart/></Col>
                        <Col xs={24} sm={24} md={12} lg={6} xl={6}><TopApplicationChart/></Col>
                        <Col xs={24} sm={24} md={12} lg={6} xl={6}><TopDestinationPortChart/></Col>
                    </Row>
                    <Row style={contentLayout}>
                        <Card title={"PCA Based Anomaly Trouble Tickets"}>
                            <AnomalyBasedTroubleTicketTable />
                        </Card>
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