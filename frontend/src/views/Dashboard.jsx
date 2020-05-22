import React, {Component, Fragment} from 'react';
import {connect} from "react-redux";
import MasterLayout from "./layout/MasterLayout";
import {Card, Col, PageHeader, Row, Button} from "antd";
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

    constructor(props){
        super(props);
        this.state = {
            filterToggleText : "Show filter",
            filterDisplyStyle : "none",
            filterVisible : false
        }
    }
    toggleFilterDisplay = () => {
        if(this.state.filterVisible){
            this.setState({filterToggleText:"Show filter"});
            this.setState({filterVisible:false});
            this.setState({filterDisplyStyle:"none"});
        }
        else {
            this.setState({filterToggleText:"Hide filter"});
            this.setState({filterVisible:true});
            this.setState({filterDisplyStyle:""});
        }
    }

    render() {
        return (
            <Fragment>
                <MasterLayout activePageKey={this.props.activePageKey}>
                    <PageHeader
                        style={{background: '#fff'}}
                        title={"Dashboard"}
                        onBack={() => window.history.back()} />
                    <Row style={contentLayout}>
                        <Col xs={24} sm={24} md={5} lg={5} xl={5} offset={19}>
                        <Button 
                            type={"primary"}
                            style={{ width: "100%" }}
                            onClick={this.toggleFilterDisplay}>{this.state.filterToggleText}</Button>
                        </Col>
                    </Row>
                    <Row style={contentLayout}>
                        <div style={{display:this.state.filterDisplyStyle}}><DashboardFilter /> </div>
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
                        <ApplicationLineChart />
                    </Row>
                    <Row style={contentLayout}>
                        <br />
                        <h3>Unverified Rules</h3>
                        <UnverifiedRulesTable />
                    </Row>
                    <Row style={contentLayout}>
                        <br />
                        <h3>Anomalous Rules</h3>
                        <AnomalousRulesTable />
                    </Row>
                    <Row style={contentLayout}>
                        <br />
                        <h3>Trouble Tickets</h3>
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