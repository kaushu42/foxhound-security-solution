import React, {Component, Fragment} from 'react';
import {connect} from "react-redux";
import MasterLayout from "../layout/MasterLayout";
import {PageHeader, Row} from "antd";
import {contentLayout} from "../../utils";
import TrafficLogsTable from "../../components/tables/TrafficLogsTable";

class TrafficLogs extends  Component {


    render() {
        return (
            <Fragment>
                <MasterLayout activePageKey={this.props.activePageKey}>
                    <PageHeader title={"Traffic Logs"} />
                    <Row style={contentLayout}>
                        <TrafficLogsTable />
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

export  default connect(mapStateToProps,null)(TrafficLogs);