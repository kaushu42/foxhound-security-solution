import React, {Component, Fragment} from 'react';
import {connect} from "react-redux";
import {Spin, Table, Drawer, Icon, Button, Form, Input, Row, Col, Statistic, Card, Select} from 'antd';
import {
    fetchVerifiedRulesData,
    updatePagination, 
    rejectVerifiedRule,
    discardVerifiedRule,
    handleDrawerClose,
    rejectRule,
    discardRule
} from "../../actions/verifiedRulesAction";
import {axiosHeader, drawerInfoStyle, ROOT_URL} from "../../utils";
import moment from "moment";
import QuickIpView from "../../views/QuickIpView"
import ExportJsonExcel from 'js-export-excel';
import {search} from "../../actions/ipSearchAction";
import { filterSelectDataServiceAsync } from "../../services/filterSelectDataService";
const { Search } = Input;

class VerifiedRulesTable extends Component {

    state = {
        params : {},
        columns: [
            {
                title: 'Created Date',
                dataIndex: 'created_date_time',
                key: 'created_date_time',
                render: text => (new Date(parseInt(text)*1000).toUTCString()).replace(" GMT", "")            
            },
            {
                title: 'Source IP',
                children:[
                    {   
                        title: "IP Address",
                        dataIndex: 'source_address',
                        key: 'source_address',
                        render: (text,record) => <a onClick={()=> this.handleShowSourceIpProfile(record)}>{text}</a>,
                    },
                    {   
                        title: "Alias",
                        dataIndex: 'source_address_alias',
                        key: 'source_address_alias'
                    }
                ]
            },
            {
                title: 'Destination IP',
                children:[
                    {   
                        title: "IP Address",
                        dataIndex: 'destination_address',
                        key: 'destination_address',
                        render: (text,record) => <a onClick={()=> this.handleShowDestinationIpProfile(record)}>{text}</a>,
                    },
                    {   
                        title: "Alias",
                        dataIndex: 'destination_address_alias',
                        key: 'destination_address_alias'
                    }
                ]
            },
            {
                title: 'Application',
                dataIndex: 'application',
                key: 'application'
            },
            {
                title: 'Rule Name',
                dataIndex: 'name',
                key: 'name'
            },
            {
                title: 'Description',
                dataIndex: 'description',
                key: 'description'
            },
            {
                title : 'Actions',
                dataIndex: 'actions',
                render : (text,record) => {
                    return (
                        <Fragment>
                            <a onClick={() => this.props.handleVerifiedRuleDiscard(this.props.auth_token,record)}><Icon type="left-circle" theme="filled" style={{fontSize:16,color:'blue'}}/>&nbsp;&nbsp;</a>
                            <a onClick={() => this.props.handleVerifiedRuleReject(this.props.auth_token,record)}><Icon type="close-circle" theme="filled" style={{fontSize:16,color:'red'}}/>&nbsp;&nbsp;</a>
                        </Fragment>
                    )
                }
            }
        ],
        data: [],
        applicationData: [],
        searchSourceIP: "",
        searchDestinationIP: "",
        searchAlias: "",
        searchApplication:"",
        quickIpView: false
    }

    handleTableChange = (pagination, filters, sorter) => {
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
        const searchSourceIP = this.state.searchSourceIP
        const searchDestinationIP = this.state.searchDestinationIP
        const searchAlias = this.state.searchAlias
        const searchApplication = this.state.searchApplication
        this.props.dispatchFetchVerifiedRulesData(auth_token,params,searchSourceIP,  searchDestinationIP, searchAlias, searchApplication,verifiedRulePagination);
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

    handleDiscardRuleSubmit = (e) => {
        e.preventDefault();
        const {auth_token,selectedVerifiedRecordToDiscard} = this.props;
        const description = ""
        this.props.dispatchDiscardRule(auth_token,description,selectedVerifiedRecordToDiscard);
    }

    closeQuickIpView  = () => {
        this.setState({quickIpView: false})
    }

    componentDidMount() {
        // this.props.dispatchFetchVerifiedRulesData(this.props.auth_token);
        this.handleFetchVerifiedRulesData(this.state.params)
        filterSelectDataServiceAsync(this.props.auth_token)
        .then(response => {
            const filter_data = response[0].data;
            this.setState({
                applicationData: filter_data.application,
            });
        })
        .catch(error => console.log(error));
    }

    filterData = (v) =>{
        this.handleFetchVerifiedRulesData(this.state.params)
    }

    downloadExcel = () => {
        const data = this.props.verifiedRulesData ? this.props.verifiedRulesData : '';//tabular data
         var option={};
         let dataTable = [];
         if (data) {
           for (let i in data) {
             if(data){
               let obj = {
                            'Created datetime': (new Date(parseInt(data[i].created_date_time)*1000).toUTCString()).replace(" GMT", ""),
                            'Source address': data[i].source_address,
                            'Source address alias': data[i].source_address_alias,
                            'Destination address': data[i].destination_address,
                            'Destination address alias': data[i].destination_address_alias,
                            'Application':data[i].application,
                            'Firewall rule':data[i].name,
                            'Verified date':(new Date(parseInt(data[i].verified_date_time)*1000).toUTCString()).replace(" GMT", ""),
                            'Verified by':data[i].verified_by_user.username
               }
               dataTable.push(obj);
             }
           }
         }
            option.fileName = 'Verified Rule'
         option.datas=[
           {
             sheetData:dataTable,
             sheetName:'sheet',
                    sheetFilter:['Created datetime','Source address','Source address alias','Destination address','Destination address alias','Application','Firewall rule','Verified date', 'Verified by'],
                    sheetHeader:['Created Datetime','Source address','Source address alias','Destination address','Destination address alias','Application','Firewall rule','Verified date', 'Verified by']
           }
         ];
        
         var toExcel = new ExportJsonExcel(option); 
         toExcel.saveExcel();        
    }
    
    render(){
        const {selectedVerifiedRecordToReject, selectedVerifiedRecordToDiscard} = this.props;
        const expandedRowRender = record => <p><b>Verified Date: </b>{(new Date(parseInt(record.verified_date_time)*1000).toUTCString()).replace(" GMT", "")} <br/><b>Verified By: </b> {record.verified_by_user.username} </p>;
        const title = () => <h3>Verified Rules</h3>
        const applicationSelectListItem = this.state.applicationData.map(
            data => <Select.Option key={data[1]}>{data[1]}</Select.Option>
          );
        return(
            <Fragment>
                {this.props.rejectVerifiedRuleError ? <p style={{color:'red'}}>{this.props.rejectVerifiedRuleErrorMessage }</p>: null }
                {this.props.rejectVerifiedRuleSuccess ? <p style={{color:'green'}}>{this.props.rejectVerifiedRuleSuccessMessage} </p>: null }
                {this.props.discardVerifiedRuleError ? <p style={{color:'red'}}>{this.props.discardVerifiedRuleErrorMessage }</p>: null }
                {this.props.discardVerifiedRuleSuccess ? <p style={{color:'green'}}>{this.props.discardVerifiedRuleSuccessMessage} </p>: null }
                <Spin spinning={this.props.verifiedRulesLoading}>
                {/* <div style={{marginBottom:24,padding:24,background:'#fbfbfb',border: '1px solid #d9d9d9',borderRadius: 6}}> */}
                <Card title={
                    <Fragment>
                    <Row gutter={[16, 16]}>
                    <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                            <Button type="primary" shape="round" icon="download"
                                onClick={this.downloadExcel}>Export This Page
                                </Button>
                            </Col>
                        <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                            <Input 
                                value={this.state.searchSourceIP}
                                placeholder="Search Source IP"
                                onChange={(e)=>this.setState({searchSourceIP : e.target.value})}
                            />
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                            <Input 
                                value={this.state.searchDestinationIP}
                                placeholder="Search Destination IP"
                                onChange={(e)=>this.setState({searchDestinationIP : e.target.value})}
                            />
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                            <Input 
                                value={this.state.searchAlias}
                                placeholder="Search Alias"
                                onChange={(e)=>this.setState({searchAlias : e.target.value})}
                            />
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                            <Select
                                id="filterApplication"
                                mode="multiple"
                                allowClear={true}
                                optionFilterProp="children"
                                style={{width:"100%"}}
                                filterOption={(input, option) =>
                                option.props.children
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
                                }
                                placeholder="Application"
                                onChange={value => this.setState({searchApplication:value})}
                            >
                                {applicationSelectListItem}
                            </Select>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                            <Button 
                            type="primary"
                            style={{width:'100%'}}
                            htmlType="submit"
                            className="login-form-button"
                            loading={this.props.rejectUnverifiedRuleLoading}
                            onClick={e =>this.filterData(e)}>Search
                            </Button>
                        </Col>
                    </Row>
                    </Fragment>
                }>
                <Table
                    rowKey={record => record.id}
                    expandedRowRender={expandedRowRender}
                    columns={this.state.columns}
                    dataSource = {this.props.verifiedRulesData}
                    pagination={this.props.verifiedRulePagination}
                    onChange={this.handleTableChange}
                    bordered
                />
                </Card>
                </Spin>
                {/* </div> */}
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
                                            <Statistic title="Source IP" value={selectedVerifiedRecordToReject.source_address} />
                                        </Col>
                                        <Col xs={24} sm={12} md={12} lg={12} xl={12} style={drawerInfoStyle}>
                                            <Statistic title="Destination IP" value={selectedVerifiedRecordToReject.destination_address}/>
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
                    id={"DiscardDrawer"}
                    visible={this.props.verifiedRuleDiscardDrawerLoading}
                    title={"Flag this rule?"}
                    width={500}
                    onClose={this.props.dispatchHandleDrawerClose}
                    closable={true}
                    placement={'right'}>
                    <Spin spinning={!selectedVerifiedRecordToDiscard}>
                        {
                            selectedVerifiedRecordToDiscard ? (
                                <Fragment>
                                    <Row type="flex" gutter={16}>
                                        <Col xs={24} sm={12} md={12} lg={12} xl={12} style={drawerInfoStyle}>
                                            <Statistic title="Source IP" value={selectedVerifiedRecordToDiscard.source_address} />
                                        </Col>
                                        <Col xs={24} sm={12} md={12} lg={12} xl={12} style={drawerInfoStyle}>
                                            <Statistic title="Destination IP" value={selectedVerifiedRecordToDiscard.destination_address}/>
                                        </Col>
                                        <Col xs={24} sm={12} md={12} lg={24} xl={24} style={drawerInfoStyle}>
                                            <Statistic title="Application" value={selectedVerifiedRecordToDiscard.application}/>
                                        </Col>
                                    </Row>
                                    <br />
                                    <Row type="flex" gutter={16} style={{paddingTop: 10,paddingBottom: 10}}>
                                    <Button
                                        type="primary"
                                        style={{width:'100%'}}
                                        htmlType="submit"
                                        className="login-form-button"
                                        loading={this.props.rejectVerifiedRuleLoading}
                                        onClick={e =>this.handleDiscardRuleSubmit(e)}>Discard this rule
                                    </Button>
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
        application: state.filter.application,

        verifiedRulesLoading : state.verifiedRule.verifiedRulesLoading,
        verifiedRulesData : state.verifiedRule.verifiedRulesData,
        verifiedRulesSuccess : state.verifiedRule.verifiedRulesSuccess,
        verifiedRulesError: state.verifiedRule.verifiedRulesError,

        verifiedRuleRejectDrawerLoading: state.verifiedRule.verifiedRuleRejectDrawerLoading,
        verifiedRuleDiscardDrawerLoading: state.verifiedRule.verifiedRuleDiscardDrawerLoading,

        rejectVerifiedRuleLoading:state.verifiedRule.rejectVerifiedRuleLoading,
        rejectVerifiedRuleSuccess:state.verifiedRule.rejectVerifiedRuleSuccess,
        rejectVerifiedRuleError:state.verifiedRule.rejectVerifiedRuleError,
        rejectVerifiedRuleSuccessMessage : state.verifiedRule.rejectVerifiedRuleSuccessMessage,
        rejectVerifiedRuleErrorMessage: state.verifiedRule.rejectVerifiedRuleErrorMessage,
        selectedVerifiedRecordToReject : state.verifiedRule.selectedVerifiedRecordToReject,

        discardVerifiedRuleLoading:state.verifiedRule.discardVerifiedRuleLoading,
        discardVerifiedRuleSuccess:state.verifiedRule.discardVerifiedRuleSuccess,
        discardVerifiedRuleError:state.verifiedRule.discardVerifiedRuleError,
        discardVerifiedRuleSuccessMessage : state.verifiedRule.discardVerifiedRuleSuccessMessage,
        discardVerifiedRuleErrorMessage: state.verifiedRule.discardVerifiedRuleErrorMessage,
        selectedVerifiedRecordToDiscard : state.verifiedRule.selectedVerifiedRecordToDiscard,

        verifiedRulePagination : state.verifiedRule.verifiedRulePagination,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        dispatchFetchVerifiedRulesData : (auth_token, params, searchSourceIP,  searchDestinationIP, searchAlias, searchApplication,pagination) => dispatch(fetchVerifiedRulesData(auth_token, params, searchSourceIP,  searchDestinationIP, searchAlias, searchApplication,pagination)),
        dispatchPaginationUpdate : (pager) => dispatch(updatePagination(pager)),
        dispatchIpSearchValueUpdate : value => dispatch(search(value)),
        handleVerifiedRuleReject : (auth_token,record) => dispatch(rejectVerifiedRule(auth_token,record)),
        handleVerifiedRuleDiscard : (auth_token,record) => dispatch(discardVerifiedRule(auth_token,record)),
        dispatchRejectRule : (auth_token,description,record) => dispatch(rejectRule(auth_token,description,record)),
        dispatchDiscardRule : (auth_token,description,record) => dispatch(discardRule(auth_token,description,record)),
        dispatchHandleDrawerClose : () => dispatch(handleDrawerClose()),
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(VerifiedRulesTable)