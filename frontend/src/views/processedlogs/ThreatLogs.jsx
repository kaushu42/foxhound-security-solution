import React, {Component, Fragment} from 'react';
import {connect} from "react-redux";
import MasterLayout from "../layout/MasterLayout";
import {PageHeader, Row} from "antd";
import {contentLayout} from "../../utils";

class ThreatLogs extends  Component {


    render() {
        return (
            <Fragment>
                <MasterLayout activePageKey={this.props.activePageKey}>
                    <PageHeader title={"Threat Logs"} />
                    <Row style={contentLayout}>
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

export  default connect(mapStateToProps,null)(ThreatLogs);