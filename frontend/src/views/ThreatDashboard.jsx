import React, {Component, Fragment} from 'react';
import {connect} from "react-redux";
import MasterLayout from "./layout/MasterLayout";
import {Card, Col, PageHeader, Row} from "antd";
import Filter from "../components/Filter";
import {contentLayout} from "../utils";

import ThreatDashboardFilter from "../components/ThreatDashboardFilter";
import ThreatApplicationChart from "../components/charts/ThreatApplicationChart";
import ThreatLogTable from '../components/tables/ThreatLogTable'
import ThreatRequestOriginWorldChart from '../components/charts/ThreatRequestOriginWorldChart'
import '../charts/chart.css';

class ThreatDashboard extends Component{
    render() {
        return (
            <Fragment>
                <MasterLayout activePageKey={this.props.activePageKey}>
                    <PageHeader
                        style={{background: '#fff'}}
                        title={"Threat Dashboard"}
                        onBack={() => window.history.back()} />
                    <Row style={contentLayout}>
                        <ThreatDashboardFilter />
                    </Row>
                    <Row style={contentLayout}>
                        <Col xs={24} sm={24} md={24} lg={24} xl={12}>
                            <ThreatRequestOriginWorldChart />
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={24} xl={12}>
                            <ThreatApplicationChart />
                        </Col>
                    </Row>
                    <br />
                    <Row style={contentLayout}>
                        <ThreatLogTable />
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

export default connect(mapStateToProps,mapDispatchToProps)(ThreatDashboard);