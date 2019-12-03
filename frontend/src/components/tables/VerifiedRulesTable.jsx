import React, {Component, Fragment} from 'react';
import {connect} from "react-redux";
import {Spin, Table, Drawer, Icon, Button, Form, Input, Row, Col, Statistic} from 'antd';
import {
    fetchVerifiedRulesData,
    updatePagination, 
    rejectVerifiedRule,
    handleDrawerClose,
    rejectRule
} from "../../actions/verifiedRulesAction";
import {axiosHeader, drawerInfoStyle, ROOT_URL} from "../../utils";
import moment from "moment";
import QuickIpView from "../../views/QuickIpView"
import {search} from "../../actions/ipSearchAction";


class VerifiedRulesTable extends Component {

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
                dataIndex: 'source_ip',
                key: 'source_ip',
                render: (text,record) => <a onClick={()=> this.handleShowSourceIpProfile(record)}>{text}</a>,
            },
            {
                title: 'Destination IP',
                dataIndex: 'destination_ip',
                key: 'destination_ip',
                render: (text,record) => <a onClick={()=> this.handleShowDestinationIpProfile(record)}>{text}</a>,
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
                            <a onClick={() => this.props.handleVerifiedRuleReject(this.props.auth_token,record)}><Icon type="close-circle" theme="filled" style={{fontSize:24}}/>&nbsp;&nbsp;</a>
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
        const pager = { ...this.props.verifiedRulePagination };
        pager.current = pagination.current;
        this.props.dispatchPaginationUpdate(pager);
        this.handleFetchVerifiedRulesData({
            // results: pagination.pageSize,
            page: pagination.current,
            sortField: sorter.field,
            sortOrder: sorter.order,
            ...filters
        });
    };

    handleFetchVerifiedRulesData = (params={}) => {
        const {auth_token,verifiedRulePagination} = this.props;
        this.props.dispatchFetchVerifiedRulesData(auth_token,params,verifiedRulePagination);
    }

    handleShowSourceIpProfile(record){
        this.props.dispatchIpSearchValueUpdate(record.source_ip);
        this.setState({quickIpView : true})
    }

    handleShowDestinationIpProfile(record){
        this.props.dispatchIpSearchValueUpdate(record.destination_ip);
        this.setState({quickIpView : true})
    }

    handleRejectRuleSubmit = (e) => {
        e.preventDefault();
        const {auth_token,selectedVerifiedRecordToReject} = this.props;
        const description = this.description.state.value;
        this.props.dispatchRejectRule(auth_token,description,selectedVerifiedRecordToReject);
    }

    closeQuickIpView  = () => {
        this.setState({quickIpView: false})
    }

    componentDidMount() {
        // this.props.dispatchFetchVerifiedRulesData(this.props.auth_token);
        this.handleFetchVerifiedRulesData(this.state.params)
    }

    render(){
        const {selectedVerifiedRecordToReject} = this.props;
        const expandedRowRender = record => <p><b>Verified Date: </b>{moment(record.verified_date_time).format("YYYY-MM-DD, HH:MM:SS")} <br/><b>Verified By: </b> {record.verified_by_user.username} </p>;
        const title = () => <h3>Verified Rules</h3>
        return(
            <Fragment>
                {this.props.rejectVerifiedRuleError ? <p style={{color:'red'}}>{this.props.rejectVerifiedRuleErrorMessage }</p>: null }
                {this.props.rejectVerifiedRuleSuccess ? <p style={{color:'green'}}>{this.props.rejectVerifiedRuleSuccessMessage} </p>: null }

                <div style={{marginBottom:24,padding:24,background:'#fbfbfb',border: '1px solid #d9d9d9',borderRadius: 6}}>
                    <Table
                        rowKey={record => record.id}
                        expandedRowRender={expandedRowRender}
                        columns={this.state.columns}
                        dataSource = {this.props.verifiedRulesData}
                        pagination={this.props.verifiedRulePagination}
                        onChange={this.handleTableChange}
                    />
                </div>
                <Drawer
                    id={"RejectDrawer"}
                    visible={this.props.verifiedRuleRejectDrawerLoading}
                    title={"Flag this rule?"}
                    width={500}
                    onClose={this.props.dispatchHandleDrawerClose}
                    closable={true}
                    placement={'right'}>
                    <Spin spinning={!selectedVerifiedRecordToReject}>
                        {
                            selectedVerifiedRecordToReject ? (
                                <Fragment>
                                    <Row type="flex" gutter={16}>
                                        <Col xs={24} sm={12} md={12} lg={12} xl={12} style={drawerInfoStyle}>
                                            <Statistic title="Source IP" value={selectedVerifiedRecordToReject.source_ip} />
                                        </Col>
                                        <Col xs={24} sm={12} md={12} lg={12} xl={12} style={drawerInfoStyle}>
                                            <Statistic title="Destination IP" value={selectedVerifiedRecordToReject.destination_ip}/>
                                        </Col>
                                        <Col xs={24} sm={12} md={12} lg={24} xl={24} style={drawerInfoStyle}>
                                            <Statistic title="Application" value={selectedVerifiedRecordToReject.application}/>
                                        </Col>
                                    </Row>
                                    <br />
                                    <Row type="flex" gutter={16} style={{paddingTop: 10,paddingBottom: 10}}>
                                    <Form style={{width:'100%'}} name={"rejectRuleForm"}>
                                            <Form.Item>
                                                <label>Description</label>
                                                <Input ref={node => (this.description = node)} defaultValue={selectedVerifiedRecordToReject.description} />
                                            </Form.Item>
                                            <Button
                                                type="primary"
                                                style={{width:'100%'}}
                                                htmlType="submit"
                                                className="login-form-button"
                                                loading={this.props.rejectVerifiedRuleLoading}
                                                onClick={e =>this.handleRejectRuleSubmit(e)}>Reject this rule
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

        verifiedRulesLoading : state.verifiedRule.verifiedRulesLoading,
        verifiedRulesData : state.verifiedRule.verifiedRulesData,
        verifiedRulesSuccess : state.verifiedRule.verifiedRulesSuccess,
        verifiedRulesError: state.verifiedRule.verifiedRulesError,

        verifiedRuleRejectDrawerLoading: state.verifiedRule.verifiedRuleRejectDrawerLoading,

        rejectVerifiedRuleLoading:state.verifiedRule.rejectVerifiedRuleLoading,
        rejectVerifiedRuleSuccess:state.verifiedRule.rejectVerifiedRuleSuccess,
        rejectVerifiedRuleError:state.verifiedRule.rejectVerifiedRuleError,
        rejectVerifiedRuleSuccessMessage : state.verifiedRule.rejectVerifiedRuleSuccessMessage,
        rejectVerifiedRuleErrorMessage: state.verifiedRule.rejectVerifiedRuleErrorMessage,
        selectedVerifiedRecordToReject : state.verifiedRule.selectedVerifiedRecordToReject,

        verifiedRulePagination : state.verifiedRule.verifiedRulePagination,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        dispatchFetchVerifiedRulesData : (auth_token, params, pagination) => dispatch(fetchVerifiedRulesData(auth_token, params, pagination)),
        dispatchPaginationUpdate : (pager) => dispatch(updatePagination(pager)),
        dispatchIpSearchValueUpdate : value => dispatch(search(value)),
        handleVerifiedRuleReject : (auth_token,record) => dispatch(rejectVerifiedRule(auth_token,record)),
        dispatchRejectRule : (auth_token,description,record) => dispatch(rejectRule(auth_token,description,record)),
        dispatchHandleDrawerClose : () => dispatch(handleDrawerClose()),
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(VerifiedRulesTable)