import React, {Component, Fragment} from "react";
import {connect} from "react-redux";

import MasterLayout from "../layout/MasterLayout";
import {contentLayout, drawerInfoStyle, ROOT_URL} from "../../utils";
import axios from 'axios';
import {Col, PageHeader, Row, Input, Button, Table, Drawer, Spin, Statistic, Alert} from "antd";
import moment from "moment";
import QuickIpView from "../QuickIpView"
import {search} from "../../actions/ipSearchAction";

class BackgroundJob extends Component{
    constructor(props){
        super(props);
        this.state = {
            columns: [
                {
                    title: 'Job Id'
                },
                {
                    title: 'Job Details'
                },
                {
                    title: 'Job Status'
                },
                {
                    title: 'Job Result'
                },
            ]
        }
    }

    render(){
        return(
            <Fragment>
                <MasterLayout activePageKey={this.props.activePageKey}>
                    <PageHeader
                        style={{background: '#fff'}}
<<<<<<< HEAD:frontend/src/views/BackgroundJob.jsx
                        title={"Background Jobs"}/>
=======
                        title={"Background Job Monitor"}/>
>>>>>>> 1aeeb791743ae8202eb09c52c3868f7db1776bba:frontend/src/views/core/BackgroundJob.jsx
                    <Row style = {contentLayout}>
                        <Table
                            rowKey={record => record.id}
                            columns={this.state.columns}
                            dataSource = {this.state.data}
                            pagination={this.state.pagination}
                            onChange={this.handleTableChange}
                            loading={this.state.loading}
                        />
                    </Row>
                </MasterLayout>
            </Fragment>
        )
    }                    
}

export default connect(null,null)(BackgroundJob);