import React, {Component, Fragment} from 'react';
import {connect} from "react-redux";
import {Alert, Avatar, Button, Col, Drawer, Form, Icon, Input, List, Row, Select, Spin, Statistic, Table} from 'antd';
import {
    acceptRule,
    acceptUnverifiedRule,
    fetchUnverifiedRulesData, 
    handleDrawerClose, 
    rejectRule,
    rejectUnverifiedRule, 
    updateRule, 
    updateUnverifiedRule,
    updatePagination
} from "../../actions/unverifiedRulesAction";
import {contentLayout, drawerInfoStyle} from "../../utils";
import {search} from "../../actions/ipSearchAction";
import QuickIpView from "../../views/QuickIpView";
import moment from "moment";


class UnverifiedRulesTable extends Component {

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
                title: 'Source Address',
                dataIndex: 'source_ip',
                key: 'source_ip',
                render: (text,record) => <a onClick={()=> this.handleShowUnverifiedIpDashboard(record)}>{text}</a>,
            },
            {
                title: 'Destination Address',
                dataIndex: 'destination_ip',
                key: 'destination_ip',
                render: (text,record) => <a onClick={()=> this.handleShowUnverifiedIpDashboardDestinationIP(record)}>{text}</a>,
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
                            <a onClick={() => this.props.handleUnverifiedRuleAccept(this.props.auth_token,record)}><Icon type="check-circle" theme="filled" />&nbsp;&nbsp;</a>
                            <a onClick={() => this.props.handleUnverifiedRuleReject(this.props.auth_token,record)}><Icon type="close-circle" theme="filled" />&nbsp;&nbsp;</a>
                            <a onClick={() => this.props.handleUnverifiedRuleUpdate(this.props.auth_token,record)}><Icon type="edit" theme="filled" />&nbsp;&nbsp;</a>
                        </Fragment>
                    )
                }
            }
        ],
        data: [],
        quickIpView : false


    }

    handleTableChange = (pagination, filters, sorter) => {
        console.log('pagination',pagination);
        console.log('filter',filters)
        console.log('sorter',sorter)
        const pager = { ...this.props.unverifiedRulePagination };
        pager.current = pagination.current;
        this.props.dispatchPaginationUpdate(pager);
        this.handleFetchUnverifiedRulesData({
            // results: pagination.pageSize,
            page: pagination.current,
            sortField: sorter.field,
            sortOrder: sorter.order,
            ...filters
        });
    };

    handleFetchUnverifiedRulesData = (params={}) => {
        const {auth_token,unverifiedRulePagination} = this.props;
        this.props.dispatchFetchUnverifiedRulesData(auth_token,params,unverifiedRulePagination);
    }

    componentDidMount() {
        this.handleFetchUnverifiedRulesData(this.state.params)
    }

    handleAcceptRuleSubmit = (e) => {
        e.preventDefault();
        const {auth_token,selectedRecordToAccept} = this.props;
        this.props.dispatchAcceptRule(auth_token,selectedRecordToAccept);
    }

    handleRejectRuleSubmit = (e) => {
        e.preventDefault();
        const {auth_token,selectedRecordToReject} = this.props;
        this.props.dispatchRejectRule(auth_token,selectedRecordToReject);
    }

    handleUpdateRuleSubmit = (e) => {
        e.preventDefault();
        const {auth_token,unverifiedRulePagination} = this.props;
        const source_ip = this.source_ip.state.value;
        const destination_ip = this.destination_ip.state.value;
        const application = this.application.state.value;
        const description = this.description.state.value;
        this.props.dispatchUpdateRule(auth_token,source_ip,destination_ip,application,description,{}, unverifiedRulePagination);
    }

    handleShowUnverifiedIpDashboard(record){
        this.props.dispatchUnverifiedIpSearchValueUpdate(record.source_ip);
        this.setState({quickIpView : true})
    }

    handleShowUnverifiedIpDashboardDestinationIP(record){
        this.props.dispatchUnverifiedIpSearchValueUpdate(record.destination_ip);
        this.setState({quickIpView : true})
    }

    closeQuickIpView  = () => {
        this.setState({quickIpView: false})
    }

    render(){
        const {selectedRecordToAccept,selectedRecordToReject,selectedRecordToUpdate} = this.props;
        const expandedRowRender = record => <p><b>Verified Data: </b>{record.verifiedDate} <br/><b>Verified By: </b> {record.verifiedBy} </p>;
        const title = () => <h3>Unverified Rules</h3>
        return(
            <Fragment>
                {this.props.acceptUnverifiedRuleError ?
                    <Alert message="Error" type="error" closeText="Close Now" showIcon description={this.props.acceptUnverifiedRuleErrorMessage} />
                    : null }
                {this.props.acceptUnverifiedRuleSuccess ?
                    <Alert message="Success" type="success" closeText="Close Now" showIcon description={this.props.acceptUnverifiedRuleSuccessMessage} />
                    : null }
                {this.props.rejectUnverifiedRuleError ?
                    <Alert message="Error" type="error" closeText="Close Now" showIcon description={this.props.rejectUnverifiedRuleErrorMessage} />
                    : null }
                {this.props.rejectUnverifiedRuleSuccess ?
                    <Alert message="Success" type="success" closeText="Close Now" showIcon description={this.props.rejectUnverifiedRuleSuccessMessage} />
                    : null }
                {this.props.updateUnverifiedRuleError ?
                    <Alert message="Error" type="error" closeText="Close Now" showIcon description={this.props.updateUnverifiedRuleErrorMessage} />
                    : null }
                {this.props.updateUnverifiedRuleSuccess ?
                    <Alert message="Success" type="success" closeText="Close Now" showIcon description={this.props.updateUnverifiedRuleSuccessMessage} />
                    : null }

                <Spin spinning={this.props.unverifiedRulesLoading}>
                    <Table
                        bordered={true}
                        rowKey={record => record.id}
                        title = {title}
                        columns={this.state.columns}
                        dataSource = {this.props.unverifiedRulesData}
                        pagination={this.props.unverifiedRulePagination}
                        onChange={this.handleTableChange}
                    />
                </Spin>
                <Drawer
                    id={"RejectDrawer"}
                    visible={this.props.unverifiedRuleRejectDrawerLoading}
                    title={"Reject and flag this rule?"}
                    width={500}
                    onClose={this.props.dispatchHandleDrawerClose}
                    closable={true}
                    placement={'right'}>
                    <Spin spinning={!selectedRecordToReject}>
                        {
                            selectedRecordToReject ? (
                                <Fragment>
                                    {this.props.rejectUnverifiedRuleError ? <p style={{color:'red'}}>{this.props.rejectUnverifiedRuleErrorMessage }</p>: null }
                                    {this.props.rejectUnverifiedRuleSuccess ? <p style={{color:'green'}}>{this.props.rejectUnverifiedRuleSuccessMessage} </p>: null }
                                    <Row type="flex" gutter={16}>
                                        <Col xs={24} sm={12} md={12} lg={12} xl={12} style={drawerInfoStyle}>
                                            <Statistic title="Source IP" value={selectedRecordToReject.source_ip} />
                                        </Col>
                                        <Col xs={24} sm={12} md={12} lg={12} xl={12} style={drawerInfoStyle}>
                                            <Statistic title="Destination IP" value={selectedRecordToReject.destination_ip}/>
                                        </Col>
                                        <Col xs={24} sm={12} md={12} lg={24} xl={24} style={drawerInfoStyle}>
                                            <Statistic title="Application" value={selectedRecordToReject.application}/>
                                        </Col>
                                    </Row>
                                    <br />
                                    <Form>
                                        <Row type="flex" gutter={16} style={{paddingTop: 10,paddingBottom: 10}}>
                                            <Button
                                                type="primary"
                                                style={{width:'100%'}}
                                                htmlType="submit"
                                                className="login-form-button"
                                                loading={this.props.rejectUnverifiedRuleLoading}
                                                onClick={e =>this.handleRejectRuleSubmit(e)}>Reject this rule
                                            </Button>
                                        </Row>
                                    </Form>
                                </Fragment>
                            ):null
                        }
                    </Spin>
                </Drawer>
                <Drawer
                    id={"AcceptDrawer"}
                    visible={this.props.unverifiedRuleAcceptDrawerLoading}
                    title={"Confirm Accept this rule?"}
                    width={500}
                    closable={true}
                    onClose={this.props.dispatchHandleDrawerClose}
                    placement={'right'}>
                    <Spin spinning={!selectedRecordToAccept}>
                        {
                            selectedRecordToAccept ? (
                            <Fragment>
                                {this.props.acceptUnverifiedRuleError ? <p style={{color:'red'}}>{this.props.acceptUnverifiedRuleErrorMessage }</p>: null }
                                {this.props.acceptUnverifiedRuleSuccess ? <p style={{color:'green'}}>{this.props.acceptUnverifiedRuleSuccessMessage} </p>: null }
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
                                            loading={this.props.acceptUnverifiedRuleLoading}
                                            onClick={e =>this.handleAcceptRuleSubmit(e)}>Accept this rule
                                        </Button>
                                    </Row>
                                </Form>
                            </Fragment>
                            ):null
                        }
                    </Spin>
                </Drawer>
                <Drawer
                    id={"UpdateDrawer"}
                    visible={this.props.unverifiedRuleUpdateDrawerLoading}
                    title={"Confirm Update this rule?"}
                    width={500}
                    closable={true}
                    onClose={this.props.dispatchHandleDrawerClose}
                    placement={'right'}>
                    <Spin spinning={!selectedRecordToUpdate}>
                        {
                            selectedRecordToUpdate ? (
                                <Fragment>
                                    {this.props.updateUnverifiedRuleError ? <p style={{color:'red'}}>{this.props.updateUnverifiedRuleErrorMessage }</p>: null }
                                    {this.props.updateUnverifiedRuleSuccess ? <p style={{color:'green'}}>{this.props.updateUnverifiedRuleSuccessMessage} </p>: null }
                                    <Row type="flex" gutter={16}>
                                        <Col xs={24} sm={12} md={12} lg={12} xl={12} style={drawerInfoStyle}>
                                            <Statistic title="Source IP" value={selectedRecordToUpdate.source_ip} />
                                        </Col>
                                        <Col xs={24} sm={12} md={12} lg={12} xl={12} style={drawerInfoStyle}>
                                            <Statistic title="Destination IP" value={selectedRecordToUpdate.destination_ip}/>
                                        </Col>
                                        <Col xs={24} sm={12} md={12} lg={24} xl={24} style={drawerInfoStyle}>
                                            <Statistic title="Application" value={selectedRecordToUpdate.application}/>
                                        </Col>
                                    </Row>
                                    <br />
                                        <p style={{color:'red'}}>{this.props.error_message}</p>
                                        <Row type="flex" gutter={16} style={{paddingTop: 10,paddingBottom: 10}}>
                                            <Form style={{width:'100%'}} name={"updateRuleForm"}>
                                            <Form.Item>
                                                <label>Source IP</label>
                                                <Input ref={node => (this.source_ip = node)} defaultValue={selectedRecordToUpdate.source_ip} />
                                            </Form.Item>
                                            <Form.Item>
                                                <label>Destination IP</label>
                                                <Input ref={node => (this.destination_ip = node)}defaultValue={selectedRecordToUpdate.destination_ip} />
                                            </Form.Item>
                                            <Form.Item>
                                                <label>Application</label>
                                                <Input ref={node => (this.application = node)} defaultValue={selectedRecordToUpdate.application} />
                                            </Form.Item>
                                                <Form.Item>
                                                    <label>Description</label>
                                                    <Input.TextArea ref={node => (this.description = node)} defaultValue={selectedRecordToUpdate.description} />
                                                </Form.Item>
                                            <Button
                                                type="primary"
                                                style={{width:'100%'}}
                                                htmlType="submit"
                                                className="login-form-button"
                                                loading={this.props.updateUnverifiedRuleLoading}
                                                onClick={e =>this.handleUpdateRuleSubmit(e)}>Update this rule
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

        unverifiedRulesLoading : state.unverifiedRule.unverifiedRulesLoading,
        unverifiedRulesData : state.unverifiedRule.unverifiedRulesData,
        unverifiedRulesSuccess : state.unverifiedRule.unverifiedRulesSuccess,
        unverifiedRulesError: state.unverifiedRule.unverifiedRulesError,

        acceptUnverifiedRuleLoading:state.unverifiedRule.acceptUnverifiedRuleLoading,
        acceptUnverifiedRuleSuccess:state.unverifiedRule.acceptUnverifiedRuleSuccess,
        acceptUnverifiedRuleError:state.unverifiedRule.acceptUnverifiedRuleError,
        acceptUnverifiedRuleSuccessMessage : state.unverifiedRule.acceptUnverifiedRuleSuccessMessage,
        acceptUnverifiedRuleErrorMessage: state.unverifiedRule.acceptUnverifiedRuleErrorMessage,
        selectedRecordToAccept : state.unverifiedRule.selectedRecordToAccept,

        rejectUnverifiedRuleLoading:state.unverifiedRule.rejectUnverifiedRuleLoading,
        rejectUnverifiedRuleSuccess:state.unverifiedRule.rejectUnverifiedRuleSuccess,
        rejectUnverifiedRuleError:state.unverifiedRule.rejectUnverifiedRuleError,
        rejectUnverifiedRuleSuccessMessage : state.unverifiedRule.rejectUnverifiedRuleSuccessMessage,
        rejectUnverifiedRuleErrorMessage: state.unverifiedRule.rejectUnverifiedRuleErrorMessage,
        selectedRecordToReject : state.unverifiedRule.selectedRecordToReject,


        updateUnverifiedRuleLoading:state.unverifiedRule.updateUnverifiedRuleLoading,
        updateUnverifiedRuleSuccess:state.unverifiedRule.updateUnverifiedRuleSuccess,
        updateUnverifiedRuleError:state.unverifiedRule.updateUnverifiedRuleError,
        updateUnverifiedRuleSuccessMessage : state.unverifiedRule.updateUnverifiedRuleSuccessMessage,
        updateUnverifiedRuleErrorMessage: state.unverifiedRule.updateUnverifiedRuleErrorMessage,
        selectedRecordToUpdate : state.unverifiedRule.selectedRecordToUpdate,



        unverifiedRuleAcceptDrawerLoading: state.unverifiedRule.unverifiedRuleAcceptDrawerLoading,
        unverifiedRuleRejectDrawerLoading: state.unverifiedRule.unverifiedRuleRejectDrawerLoading,
        unverifiedRuleUpdateDrawerLoading: state.unverifiedRule.unverifiedRuleUpdateDrawerLoading,

        unverifiedRulePagination : state.unverifiedRule.unverifiedRulePagination,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        dispatchFetchUnverifiedRulesData : (auth_token, params, pagination) => dispatch(fetchUnverifiedRulesData(auth_token, params, pagination)),
        handleUnverifiedRuleAccept : (auth_token,record) => dispatch(acceptUnverifiedRule(auth_token,record)),
        handleUnverifiedRuleReject : (auth_token,record) => dispatch(rejectUnverifiedRule(auth_token,record)),
        handleUnverifiedRuleUpdate : (auth_token,record) => dispatch(updateUnverifiedRule(auth_token,record)),
        dispatchHandleDrawerClose : () => dispatch(handleDrawerClose()),
        dispatchAcceptRule : (auth_token,record) => dispatch(acceptRule(auth_token,record)),
        dispatchRejectRule : (auth_token,record) => dispatch(rejectRule(auth_token,record)),
        dispatchUpdateRule : (auth_token,source_ip,destination_ip,application,description,params, pagination) => dispatch(updateRule(auth_token,source_ip,destination_ip,application,description,params, pagination)),
        dispatchPaginationUpdate : (pager) => dispatch(updatePagination(pager)),


        dispatchUnverifiedIpSearchValueUpdate : value => dispatch(search(value))
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(UnverifiedRulesTable)