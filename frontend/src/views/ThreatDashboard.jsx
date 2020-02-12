import React, {Component, Fragment} from 'react';
import {connect} from "react-redux";
import MasterLayout from "./layout/MasterLayout";
import {Card, Col, PageHeader, Row} from "antd";
import Filter from "../components/Filter";
import {contentLayout} from "../utils";

import DashboardFilter from "../components/DashboardFilter";
import ThreatApplicationChart from "../components/charts/ThreatApplicationChart";
import ThreatLogTable from '../components/tables/ThreatLogTable'
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
                        <DashboardFilter />
                    </Row>
                    <Row style={contentLayout}>
                        <ThreatApplicationChart />
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