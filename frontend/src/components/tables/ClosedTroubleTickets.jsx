import React, {Component, Fragment} from 'react';
import {Col, Row, Table} from 'antd';
import axios from "axios";
import {connect} from "react-redux";
import {ROOT_URL} from "../../utils";

const FETCH_API = `${ROOT_URL}tt/closed/`;

class ClosedTroubleTickets extends Component {
    constructor(props) {
        super(props);
        this.state = {
            params : {},
            pagination : {},
            loading : true,
            data : [],
            columns : [
                {
                    title: 'Id',
                    dataIndex: 'id',
                    key: 'id',
                },
                {
                    title: 'Source Address',
                    dataIndex: 'source_ip',
                    key: 'source_ip',
                },
                {
                    title: 'Destination Address',
                    dataIndex: 'destination_ip',
                    key: 'destination_ip',
                },
                {
                    title: 'Application',
                    dataIndex: 'application',
                    key: 'application',
                },
                {
                    title: 'Destination Port',
                    dataIndex: 'destination_port',
                    key: 'destination_port',
                },
                {
                    title: 'Log Name',
                    dataIndex: 'log_name',
                    key: 'log_name',
                },
                {
                    title: 'Description',
                    dataIndex: 'description',
                    key: 'description',
                },
            ],
         };
    }

    componentDidMount() {
        this.handleFetchData();
    }

    handleFetchData = (params = {}) => {
        this.setState({
            loading : true
        });

        const token = `Token ${this.props.auth_token}`;
        let headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Authorization" : token
        };

        axios.post(FETCH_API,null,{headers, params})
            .then(res => {
                const page = this.state.pagination;
                page.total  = res.data.count;
                this.setState({
                    data:res.data.results,
                    loading:false,
                    pagination: page
                })
            });
    }

    handleTableChange = (pagination, filters, sorter) => {
        console.log('pagination',pagination);
        console.log('filter',filters)
        console.log('sorter',sorter)
        const pager = { ...this.state.pagination};
        pager.current = pagination.current;
        this.state.pagination = pager,
        this.handleFetchData({
            // results: pagination.pageSize,
            page: pagination.current,
            sortField: sorter.field,
            sortOrder: sorter.order,
            ...filters
        });
    };

    render() {
        const title = () => <h3>Closed Trouble Tickets</h3>
        return (
            <Fragment>
                <Table
                    bordered
                    columns={this.state.columns}
                    title={title}
                    rowKey={record => record.id}
                    dataSource={this.state.data}
                    pagination={this.state.pagination}
                    loading={this.state.loading}
                    onChange={this.handleTableChange}
                />
            </Fragment>
        )
    }
}


const mapStateToProps = state => {
    return {
        auth_token : state.auth.auth_token
    }
}

export default connect(mapStateToProps,null)(ClosedTroubleTickets);