import React, {Component, Fragment} from 'react';
import {connect} from "react-redux";
import {Avatar, Button, Col, Drawer, Form, List, Row, Select, Spin, Statistic, Table} from 'antd';
import {
    acceptRule,
    acceptUnverifiedRule,
    fetchUnverifiedRulesData, handleDrawerClose,
    rejectUnverifiedRule, selectRecordToAccept, updateUnverifiedRule
} from "../../actions/unverifiedRulesAction";
import {drawerInfoStyle} from "../../utils";

class UnverifiedRulesTable extends Component {

    state = {
        columns: [
            {
                title: 'Id',
                dataIndex: 'id',
                key: 'id',
                render: text => <a>{text}</a>,
            },
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
                            <a onClick={() => this.props.handleUnverifiedRuleAccept(this.props.auth_token,record)}>Accept </a> |
                            <a onClick={() => this.props.handleUnverifiedRuleReject(this.props.auth_token,record)}>Reject </a> |
                            <a onClick={() => this.props.handleUnverifiedRuleUpdate(this.props.auth_token,record)}>Update </a>
                        </Fragment>
                    )
                }
            }
        ],
        data: []

    }

    componentDidMount() {
        this.props.dispatchFetchUnverifiedRulesData(this.props.auth_token);
    }

    handleAcceptRuleSubmit = (e) => {
        e.preventDefault();
        const {auth_token,selectedRecordToAccept} = this.props;
        this.props.dispatchAcceptRule(auth_token,selectedRecordToAccept);
    }

    render(){
        const {selectedRecordToAccept} = this.props;
        // const expandedRowRender = record => <p><b>Verified Data: </b>{record.verifiedDate} <br/><b>Verified By: </b> {record.verifiedBy} </p>;
        const title = () => <h3>Unverified Rules</h3>
        return(
            <Fragment>
                {this.props.acceptUnverifiedRuleError ? <p style={{color:'red'}}>{this.props.acceptUnverifiedRuleErrorMessage }</p>: null }
                {this.props.acceptUnverifiedRuleSuccess ? <p style={{color:'green'}}>{this.props.acceptUnverifiedRuleSuccessMessage} </p>: null }
                <Spin spinning={this.props.unverifiedRulesLoading}>
                    <Table
                        bordered={true}
                        rowKey={record => record.id}
                        title = {title}
                        // expandedRowRender={expandedRowRender}
                        columns={this.state.columns.map(item => ({ ...item, ellipsis: 'enable' }))}
                        dataSource = {this.props.unverifiedRulesData}
                    />
                </Spin>
                <Drawer
                    visible={this.props.unverifiedRuleAcceptDrawerLoading}
                    title={"Accept this rule"}
                    width={400}
                    closable={true}
                    placement={'right'}>
                    <Spin>
                        This drawer is to accept the rule
                    </Spin>
                </Drawer>
                <Drawer
                    visible={this.props.unverifiedRuleAcceptDrawerLoading}
                    title={"Accept this rule"}
                    width={400}
                    closable={true}
                    placement={'right'}>
                    <Spin>
                        This drawer is to update the rule
                    </Spin>
                </Drawer>
                <Drawer
                    visible={this.props.unverifiedRuleAcceptDrawerLoading}
                    title={"Accept this rule"}
                    width={400}
                    closable={true}
                    onClose={this.props.dispatchHandleDrawerClose}
                    placement={'right'}>
                    <Spin spinning={false}>
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

        unverifiedRulesAcceptRecord : state.unverifiedRule.unverifiedRulesAcceptRecord,

        unverifiedRuleAcceptDrawerLoading: state.unverifiedRule.unverifiedRuleAcceptDrawerLoading,
        unverifiedRuleRejectDrawerLoading: state.unverifiedRule.unverifiedRuleRejectDrawerLoading,
        unverifiedRuleUpdateDrawerLoading: state.unverifiedRule.unverifiedRuleUpdateDrawerLoading,


    }
}

const mapDispatchToProps = dispatch => {
    return {
        dispatchFetchUnverifiedRulesData : (auth_token) => dispatch(fetchUnverifiedRulesData(auth_token)),
        handleUnverifiedRuleAccept : (auth_token,record) => dispatch(acceptUnverifiedRule(auth_token,record)),
        handleUnverifiedRuleReject : (auth_token,record) => dispatch(rejectUnverifiedRule(auth_token,record)),
        handleUnverifiedRuleUpdate : (auth_token,record) => dispatch(updateUnverifiedRule(auth_token,record)),
        dispatchHandleDrawerClose : () => dispatch(handleDrawerClose()),
        dispatchAcceptRule : (auth_token,record) => dispatch(acceptRule(auth_token,record))
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(UnverifiedRulesTable)