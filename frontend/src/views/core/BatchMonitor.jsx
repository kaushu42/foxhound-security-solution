import React, {Component, Fragment} from "react";
import {connect} from "react-redux";

import MasterLayout from "../layout/MasterLayout";
import {contentLayout, drawerInfoStyle, ROOT_URL} from "../../utils";
import axios from 'axios';
import {Col, PageHeader, Row, Input, Button, Table, Drawer, Spin, Statistic, Alert} from "antd";
import moment from "moment";
import QuickIpView from "../QuickIpView"
import {search} from "../../actions/ipSearchAction";

const FETCH_API = `${ROOT_URL}batch/log/`

class BatchMonitor extends Component{
    constructor(props){
        super(props);
        this.state = {
            params : {},
            pagination : {},
            data: [],
            loading: false,
            columns: [
                {
                    title: 'Start Date',
                    dataIndex:'start_date',
                    key:'start_date',
                    render: text => (new Date(parseInt(text)*1000).toUTCString()).replace(" GMT", "")
                },
                {
                    title: 'Log Name',
                    dataIndex: 'log_name',
                    key: 'log_name',
                    render: text => <a>{text}</a>
                },
                {
                    title: 'Batch Type',
                    dataIndex: 'batch_type',
                    key: 'batch_type',
                    render: text => <a>{text}</a>
                },
                {
                    title: 'Batch Subtype',
                    dataIndex: 'batch_sub_type',
                    key: 'batch_sub_type',
                    render: text => <a>{text}</a>
                },
                {
                    title: 'Message',
                    dataIndex: 'message',
                    key: 'message',
                    render: text => <a>{text}</a>
                },
                {
                    title: 'State',
                    dataIndex: 'state',
                    key: 'state',
                    render: text => <a>{text}</a>
                },
                {
                    title: 'Status',
                    dataIndex: 'status',
                    key: 'status',
                    render: text => <a>{text}</a>
                },
                {
                    title: 'Exit Message',
                    dataIndex: 'exit_message',
                    key: 'exit_message',
                    render: text => <a>{text}</a>
                },
                {
                    title: 'End Date',
                    dataIndex: 'end_date',
                    key: 'end_date',
                    render: text => (new Date(parseInt(text)*1000).toUTCString()).replace(" GMT", "")
                },
            ]
        }
    }

    componentDidMount() {
        this.handleFetchData(this.state.params)
    }

    handleFetchData = (params = {}) => {
        this.setState({
            loading : true,
            successMessage: null
        });

        const authorization = `Token ${this.props.auth_token}`;
        let headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: authorization
        };

        axios.post(FETCH_API, null,{headers, params})
        .then(res=>{
            const page = this.state.pagination;
            page.total  = res.data.count;
            this.setState({
                data: res.data.results,
                loading:false,
                pagination: page
            })
        })
        .catch(e => {
            this.setState({
                successMessage : null,
                errorMessage : "Something went wrong!!"
            })
        });
    }

    handleTableChange = (pagination, filters, sorter) => {
        const pager = { ...this.state.pagination};
        pager.current = pagination.current;
        this.state.pagination = pager,
        this.handleFetchData({
            page: pagination.current,
            sortField: sorter.field,
            sortOrder: sorter.order,
            ...filters
        });
    };

    render(){
        return(
            <Fragment>
                <MasterLayout activePageKey={this.props.activePageKey}>
                    <PageHeader
                        style={{background: '#fff'}}
                        title={"Batch Monitor"}/>
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

const mapStateToProps = state => {
    return{
        auth_token: state.auth.auth_token
    }
}

export default connect(mapStateToProps,null)(BatchMonitor);