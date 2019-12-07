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
import {search} from "../../actions/ipSearchAction";
import QuickIpView from "../../views/QuickIpView";
import moment from "moment";

class AnomalousRulesTable extends Component {

    state = {
        params : {},
        columns: [
            {
                title: 'Created Date',
                dataIndex: 'created_date_time',
                key: 'created_date_time',
                render: text => moment(text).format("YYYY-MM-DD, HH:MM:SS"),
            },
            {
                title: 'Source IP',
                children:[
                    {   
                        title: "IP Address",
                        dataIndex: 'source_ip',
                        key: 'source_ip',
                        render: (text,record) => <a onClick={()=> this.handleShowAnomalousIpDashboard(record)}>{text}</a>,
                    },
                    {   
                        title: "Alias",
                        dataIndex: 'source_ip_alias',
                        key: 'source_ip_alias'
                    }
                ]
            },
            {   
                title: 'Destination IP',
                children:[
                    {   
                        title: "IP Address",
                        dataIndex: 'destination_ip',
                        key: 'destination_ip',
                        render: (text,record) => <a onClick={()=> this.handleShowAnomalousIpDashboardDestinationIP(record)}>{text}</a>,
                    },
                    {   
                        title: "Alias",
                        dataIndex: 'destination_ip_alias',
                        key: 'destination_ip_alias'
                    }
                ]
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
                title: 'Description',
                dataIndex: 'description',
                key: 'description',
                render: text => <a>{text}</a>,
            },
            {
                title : 'Actions',
                dataIndex: 'actions',
                render : (text,record) => {
                    return (
                        <Fragment>
                            <a onClick={() => this.props.handleAnomalousRuleAccept(this.props.auth_token,record)}><Icon type="check-circle" theme="filled" style={{fontSize:24}}/>&nbsp;&nbsp;</a>
                        </Fragment>
                    )
                }
            }
        ],
        data: [],
        quickIpView: false
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
        const description = this.description.state.value;
        this.props.dispatchAcceptRule(auth_token,description,selectedRecordToAccept);
    }

    handleShowAnomalousIpDashboard(record){
        this.props.dispatchAnomalousIpSearchValueUpdate(record.source_ip);
        this.setState({quickIpView : true})
    }

    handleShowAnomalousIpDashboardDestinationIP(record){
        this.props.dispatchAnomalousIpSearchValueUpdate(record.destination_ip);
        this.setState({quickIpView : true})
    }

    closeQuickIpView  = () => {
        this.setState({quickIpView: false})
    }

    render(){
        const {selectedRecordToAccept} = this.props;
        const expandedRowRender = record => <p><b>Flagged Date: </b>{moment(record.verified_date_time).format("YYYY-MM-DD, HH:MM:SS")} <br/><b>Flagged By: </b> {record.verified_by_user.username} </p>;
        return(
            <Fragment>
                {this.props.acceptAnomalousRuleError ?
                    <Alert message="Error" type="error" closeText="Close Now" showIcon description={this.props.acceptAnomalousRuleErrorMessage} />
                    : null }
                {this.props.acceptAnomalousRuleSuccess ?
                    <Alert message="Success" type="success" closeText="Close Now" showIcon description={this.props.acceptAnomalousRuleSuccessMessage} />
                    : null }
                <Spin spinning={this.props.anomalousRulesLoading}>
                    <div style={{marginBottom:24,padding:24,background:'#fbfbfb',border: '1px solid #d9d9d9',borderRadius: 6}}>
                        <Table
                            id={"AnomalousTable"}
                            rowKey={record => record.id}
                            expandedRowRender={expandedRowRender}
                            columns={this.state.columns}
                            dataSource = {this.props.anomalousRulesData}
                            pagination={this.props.anomalousRulePagination}
                            onChange={this.handleTableChange}
                        />
                    </div>
                </Spin>
                <Drawer
                    id={"AcceptDrawer"}
                    visible={this.props.anomalousRuleAcceptDrawerLoading}
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
                                <p style={{color:'red'}}>{this.props.error_message}</p>
                                <Row type="flex" gutter={16} style={{paddingTop: 10,paddingBottom: 10}}>
                                    <Form style={{width:'100%'}} name={"acceptAnomalousForm"}>
                                        <Form.Item>
                                            <label>Description</label>
                                            <Input ref={node => (this.description = node)} defaultValue={selectedRecordToAccept.description} />
                                        </Form.Item>
                                        <Button
                                            type="primary"
                                            style={{width:'100%'}}
                                            htmlType="submit"
                                            className="login-form-button"
                                            loading={this.props.acceptAnomalousRuleLoading}
                                            onClick={e =>this.handleAcceptRuleSubmit(e)}>Accept this rule
                                        </Button>
                                    </Form>
                                </Row>
                            </Fragment>
                            ):null
                        }
                    </Spin>
                </Drawer>
                <Drawer
                    closable={true}
                    width={800}
                    placement={"right"}
                    onClose={this.closeQuickIpView}
                    visible={this.state.quickIpView}>
                    <QuickIpView/>
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
        dispatchAcceptRule : (auth_token,description,record) => dispatch(acceptRule(auth_token,description,record)),
        dispatchPaginationUpdate : (pager) => dispatch(updatePagination(pager)),

        dispatchAnomalousIpSearchValueUpdate : value => dispatch(search(value))
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(AnomalousRulesTable)