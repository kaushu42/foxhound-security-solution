import React, {Component, Fragment} from 'react';
import {connect} from "react-redux";
import {Alert, Avatar, Button, Col, Drawer, Form, Icon, Input, List, Row, Select, Spin, Statistic, Table} from 'antd';
import {
    fetchAnomalousRulesData,
    acceptRule,
    acceptAnomalousRule,
    handleDrawerClose,
    updatePagination
} from "../../actions/anomalousRulesAction";
import {contentLayout, drawerInfoStyle} from "../../utils";

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
            // {
            //     title : 'Actions',
            //     dataIndex: 'actions',
            //     render : (text,record) => {
            //         return (
            //             <Fragment>
            //                 <a onClick={() => this.props.handleAnomalousRuleAccept(this.props.auth_token,record)}><Icon type="check-circle" theme="filled" />&nbsp;&nbsp;</a>
            //             </Fragment>
            //         )
            //     }
            // }
        ],
        data: []
    }

    handleTableChange = (pagination, filters, sorter) => {
        console.log('pagination',pagination);
        console.log('filter',filters)
        console.log('sorter',sorter)
        const pager = { ...this.props.anomalousRulePagination };
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
        const {auth_token,anomalousRulePagination} = this.props;
        this.props.dispatchFetchAnomalousRulesData(auth_token,params,anomalousRulePagination);
    }

    componentDidMount() {
        // this.props.dispatchFetchAnomalousRulesData(this.props.auth_token);
        this.handleFetchAnomalousRulesData(this.state.params)
    }

    handleAcceptRuleSubmit = (e) => {
        e.preventDefault();
        const {auth_token,selectedRecordToAccept} = this.props;
        this.props.dispatchAcceptRule(auth_token,selectedRecordToAccept);
    }

    render(){
        const selectedRecordToAccept = this.props;
        const expandedRowRender = record => <p><b>Verified Date: </b>{Date(record.verified_date_time)} <br/><b>Verified By: </b> {record.verified_by_user} </p>;
        const title = () => <h3>Anomalous Rules</h3>
        return(
            <Fragment>
                {this.props.acceptAnomalousRuleError ?
                    <Alert message="Error" type="error" closeText="Close Now" showIcon description={this.props.acceptAnomalousRuleErrorMessage} />
                    : null }
                {this.props.acceptAnomalousRuleSuccess ?
                    <Alert message="Success" type="success" closeText="Close Now" showIcon description={this.props.acceptAnomalousRuleSuccessMessage} />
                    : null }
                <Spin spinning={this.props.anomalousRulesLoading}>
                <Table
                    id={"AnomalousTable"}
                    bordered={true}
                    rowKey={record => record.id}
                    title = {title}
                    expandedRowRender={expandedRowRender}
                    columns={this.state.columns}
                    dataSource = {this.props.anomalousRulesData}
                    pagination={this.props.anomalousRulePagination}
                    onChange={this.handleTableChange}
                />
                </Spin>
                <Drawer
                    id={"AcceptDrawer"}
                    visible={this.props.AnomalousRuleAcceptDrawerLoading}
                    title={"Confirm Accept this rule?"}
                    width={500}
                    closable={true}
                    onClose={this.props.dispatchHandleDrawerClose}
                    placement={'right'}>
                    <Spin spinning={!selectedRecordToAccept}>
                        {
                            selectedRecordToAccept ? (
                            <Fragment>
                                {this.props.acceptAnomalousRuleError ? <p style={{color:'red'}}>{this.props.acceptAnomalousRuleErrorMessage }</p>: null }
                                {this.props.acceptAnomalousRuleSuccess ? <p style={{color:'green'}}>{this.props.acceptAnomalousRuleSuccessMessage} </p>: null }
                                <Row type="flex" gutter={16}>
                                    <Col xs={24} sm={12} md={12} lg={12} xl={12} style={drawerInfoStyle}>
                                        <Statistic title="Source IP" value={selectedRecordToAccept.source_ip} />
                                    </Col>
                                    <Col xs={24} sm={12} md={12} lg={12} xl={12} style={drawerInfoStyle}>
                                        <Statistic title="Destination IP" value={selectedRecordToAccept.destination_ip}/>
                                    </Col>
                                    <Col xs={24} sm={12} md={12} lg={24} xl={24} style={drawerInfoStyle}>
                                        <Statistic title="Application" value={selectedRecordToAccept.application}/>
                                    </Col>
                                </Row>
                                <br />
                                <Form>
                                    <p style={{color:'red'}}>{this.props.error_message}</p>
                                    <Row type="flex" gutter={16} style={{paddingTop: 10,paddingBottom: 10}}>
                                        <Button
                                            type="primary"
                                            style={{width:'100%'}}
                                            htmlType="submit"
                                            className="login-form-button"
                                            loading={this.props.acceptAnomalousRuleLoading}
                                            onClick={e =>this.handleAcceptRuleSubmit(e)}>Accept this rule
                                        </Button>
                                    </Row>
                                </Form>
                            </Fragment>
                            ):null
                        }
                    </Spin>
                </Drawer>
            </Fragment>
        )
    }

}

const mapStateToProps = state => {
    return {
        auth_token : state.auth.auth_token,
        current_session_user_id : state.auth.current_session_user_id,

        anomalousRulesLoading : state.anomalousRule.anomalousRulesLoading,
        anomalousRulesData : state.anomalousRule.anomalousRulesData,
        anomalousRulesSuccess : state.anomalousRule.anomalousRulesSuccess,
        anomalousRulesError: state.anomalousRule.anomalousRulesError,

        acceptAnomalousRuleLoading:state.anomalousRule.acceptAnomalousRuleLoading,
        acceptAnomalousRuleSuccess:state.anomalousRule.acceptAnomalousRuleSuccess,
        acceptAnomalousRuleError:state.anomalousRule.acceptAnomalousRuleError,
        acceptAnomalousRuleSuccessMessage : state.anomalousRule.acceptAnomalousRuleSuccessMessage,
        acceptAnomalousRuleErrorMessage: state.anomalousRule.acceptAnomalousRuleErrorMessage,
        selectedRecordToAccept : state.anomalousRule.selectedRecordToAccept,

        anomalousRuleAcceptDrawerLoading: state.anomalousRule.anomalousRuleAcceptDrawerLoading,

        anomalousRulePagination : state.anomalousRule.anomalousRulePagination
    }
}

const mapDispatchToProps = dispatch => {
    return {
        dispatchFetchAnomalousRulesData : (auth_token, params, pagination) => dispatch(fetchAnomalousRulesData(auth_token, params, pagination)),
        handleAnomalousRuleAccept : (auth_token,record) => dispatch(acceptAnomalousRule(auth_token,record)),
        dispatchHandleDrawerClose : () => dispatch(handleDrawerClose()),
        dispatchAcceptRule : (auth_token,record) => dispatch(acceptRule(auth_token,record)),
        dispatchPaginationUpdate : (pager) => dispatch(updatePagination(pager))
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(AnomalousRulesTable)