import React, {Component, Fragment} from 'react';
import {connect} from "react-redux";
import {Alert, Avatar, Button, Col, Drawer, Form, Icon, Input, List, Row, Select, Spin, Statistic, Table} from 'antd';
import {
    fetchAnomalousRulesData,
    updateAnomalousRule,
    acceptRule,
    acceptAnomalousRule,
    handleDrawerClose,
    updatePagination
} from "../../actions/anomalousRulesAction";


class AnomalousRulesTable extends Component {

    state = {
        params : {},
        columns: [
            {
                title: 'Created Date',
                dataIndex: 'created_date_time',
                key: 'created_date_time',
                render: text => Date(text),
            },
            {
                title: 'Source IP',
                dataIndex: 'source_ip',
                key: 'source_ip',
                render: text => <a>{text}</a>,
            },
            {
                title: 'Destination IP',
                dataIndex: 'destination_ip',
                key: 'destination_ip',
                render: text => <a>{text}</a>,
            },
            {
                title: 'Application',
                dataIndex: 'application',
                key: 'application',
                render: text => <a>{text}</a>,
            },
            {
                title: 'Rule Name',
                dataIndex: 'name',
                key: 'name',
                render: text => <a>{text}</a>,
            },
            {
                title : 'Actions',
                dataIndex: 'actions',
                render : (text,record) => {
                    return (
                        <Fragment>
                            <a onClick={() => this.props.handleAnomalousRuleAccept(this.props.auth_token,record)}><Icon type="check-circle" theme="filled" />&nbsp;&nbsp;</a>
                        </Fragment>
                    )
                }
            }
        ],
        data: []

    }

    handleTableChange = (pagination, filters, sorter) => {
        console.log('pagination',pagination);
        console.log('filter',filters)
        console.log('sorter',sorter)
        const pager = { ...this.props.pagination };
        pager.current = pagination.current;
        this.props.dispatchPaginationUpdate(pager);
        this.handleFetchAnomalousRulesData({
            // results: pagination.pageSize,
            page: pagination.current,
            sortField: sorter.field,
            sortOrder: sorter.order,
            ...filters
        });
    };

    handleFetchAnomalousRulesData = (params={}) => {
        const {auth_token,pagination} = this.props;
        this.props.dispatchFetchAnomalousRulesData(auth_token,params,pagination);
    }

    componentDidMount() {
        // this.props.dispatchFetchAnomalousRulesData(this.props.auth_token);
        this.handleFetchAnomalousRulesData(this.state.params)
    }

    render(){
        const expandedRowRender = record => <p><b>Verified Date: </b>{Date(record.verified_date_time)} <br/><b>Verified By: </b> {record.verified_by_user} </p>;
        const title = () => <h3>Anomalous Rules</h3>
        return(
            <Fragment>
                <Table
                    bordered={true}
                    rowKey={record => record.id}
                    title = {title}
                    expandedRowRender={expandedRowRender}
                    columns={this.state.columns}
                    dataSource = {this.props.anomalousRulesData}
                    pagination={this.props.pagination}
                    onChange={this.handleTableChange}
                />
            </Fragment>
        )
    }

}

const mapStateToProps = state => {
    return {
        auth_token : state.auth.auth_token,

        anomalousRulesLoading : state.anomalousRule.anomalousRulesLoading,
        anomalousRulesData : state.anomalousRule.anomalousRulesData,
        anomalousRulesSuccess : state.anomalousRule.anomalousRulesSuccess,
        anomalousRulesError: state.anomalousRule.anomalousRulesError,

        pagination : state.anomalousRule.pagination
    }
}

const mapDispatchToProps = dispatch => {
    return {
        dispatchFetchAnomalousRulesData : (auth_token, params, pagination) => dispatch(fetchAnomalousRulesData(auth_token, params, pagination)),
        handleAnomalousRuleUpdate : (auth_token,record) => dispatch(updateAnomalousRule(auth_token,record)),
        handleAnomalousRuleAccept : (auth_token,record) => dispatch(acceptAnomalousRule(auth_token,record)),
        dispatchPaginationUpdate : (pager) => dispatch(updatePagination(pager))
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(AnomalousRulesTable)