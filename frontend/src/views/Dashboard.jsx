import React, {Component, Fragment} from 'react';
import {connect} from "react-redux";
import MasterLayout from "./layout/MasterLayout";
import {Card, PageHeader, Row} from "antd";
import Filter from "../components/Filter";
import {contentLayout} from "../utils";
import DashboardStats from "../components/DashboardStats";
import RequestOriginChart from "../charts/RequestOriginChart";
import BandwidthUsageChart from "../charts/BandwidthUsageChart";
import AnomalyBasedTroubleTicketTable from "../components/AnomalyBasedTroubleTicketTable";

class Dashboard extends Component{
    render() {
        return (
            <Fragment>
                <MasterLayout>
                    <PageHeader
                        style={{background: '#efefef',border: '1px solid rgb(235, 237, 240)'}}
                        title={"Dashboard"}
                        onBack={() => window.history.back()} />
                    <Row style={contentLayout}>
                        <Filter />
                    </Row>
                    <Row style={contentLayout}>
                        <DashboardStats />
                    </Row>
                    <Row style={contentLayout}>
                        <Card title={"Request Origin"}>
                            <RequestOriginChart />
                        </Card>
                    </Row>
                    <Row style={contentLayout}>
                        <BandwidthUsageChart />
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