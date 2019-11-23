import React, {Component, Fragment} from 'react';
import {connect} from "react-redux";
import MasterLayout from "./layout/MasterLayout";
import {Divider, PageHeader, Row, Spin, Table, Tag} from "antd";
import {contentLayout, ROOT_URL} from "../utils";
import ProcessedLogsTable from "../components/tables/ProcessedLogsTable";

class ProcessedLogs extends  Component {


    render() {
        return (
            <Fragment>
                <MasterLayout activePageKey={this.props.activePageKey}>
                    <PageHeader title={"Processed Logs"} />
                    <Row style={contentLayout}>
                        <ProcessedLogsTable />
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

export  default connect(mapStateToProps,null)(ProcessedLogs);