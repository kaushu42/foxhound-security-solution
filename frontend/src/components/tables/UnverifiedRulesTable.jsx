import React, {Component, Fragment} from 'react';
import {connect} from "react-redux";
import {
    Alert,
    Avatar,
    Button,
    Col,
    Drawer,
    Form,
    Icon,
    Input,
    List,
    Row,
    Select,
    Spin,
    Statistic,
    Table,
    Tag,
    Card
} from 'antd';
import {
    acceptRule,
    acceptUnverifiedRule,
    fetchUnverifiedRulesData,
    handleDrawerClose,
    rejectRule,
    rejectUnverifiedRule,
    updateRule,
    updateUnverifiedRule,
    updatePagination, fetchBlackListedAddress
} from "../../actions/unverifiedRulesAction";
import {axiosHeader, drawerInfoStyle, ROOT_URL} from "../../utils";
import {search} from "../../actions/ipSearchAction";
import QuickIpView from "../../views/QuickIpView";
import { filterSelectDataServiceAsync } from "../../services/filterSelectDataService";
import moment from "moment";
import ExportJsonExcel from 'js-export-excel';
import '../../views/rules/rules.css'
import axios from "axios";
const { Search } = Input;

class UnverifiedRulesTable extends Component {

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
                        render: (text,record) => <a onClick={()=> this.handleShowUnverifiedIpDashboard(record)}>{text}</a>,
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
                        render: (text,record) => <a onClick={()=> this.handleShowUnverifiedIpDashboardDestinationIP(record)}>{text}</a>,
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
                title : 'Actions',
                dataIndex: 'actions',
                render : (text,record) => {
                    return (
                        <Fragment>
                            <a onClick={() => this.props.handleUnverifiedRuleAccept(this.props.auth_token,record)}><Icon type="check-circle" theme="filled" style={{fontSize:16,color:'green'}}/>&nbsp;&nbsp;</a>
                            <a onClick={() => this.props.handleUnverifiedRuleReject(this.props.auth_token,record)}><Icon type="close-circle" theme="filled" style={{fontSize:16,color:'red'}}/>&nbsp;&nbsp;</a>
                            <a onClick={() => {this.props.handleUnverifiedRuleUpdate(this.props.auth_token,record)}}><Icon type="edit" theme="filled" style={{fontSize:16}}/></a>
                        </Fragment>
                    )
                }
            }
        ],
        data: [],
        quickIpView : false,
        blackListSourceData : [],
        blackListDestinationData : [],
        applicationData: [],
        input_source_ip : "",
        input_destination_ip : "",
        input_application : "",
        input_description : "",
        searchSourceIP: "",
        searchDestinationIP: "",
        searchAlias: "",
        searchApplication: ""
    }

    handleTableChange = (pagination, filters, sorter) => {
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
        const searchSourceIP = this.state.searchSourceIP
        const searchDestinationIP = this.state.searchDestinationIP
        const searchAlias = this.state.searchAlias
        const searchApplication = this.state.searchApplication
        this.props.dispatchFetchUnverifiedRulesData(auth_token,params,searchSourceIP,  searchDestinationIP, searchAlias, searchApplication,unverifiedRulePagination);
    }

    componentDidMount() {
        this.handleFetchUnverifiedRulesData(this.state.params)
        const FETCH_BLACKLISTED_SOURCE_API = `${ROOT_URL}mis/blacklist/source/`;
        const FETCH_BLACKLISTED_DESTINATION_API = `${ROOT_URL}mis/blacklist/destination/`;
        let auth_token = this.props.auth_token;
        let headers = axiosHeader(auth_token);
        axios.post(FETCH_BLACKLISTED_SOURCE_API,null,{headers})
            .then(res => {
                const response = res.data;4
                var blacklistData = []
                
                for (var i =0; i<response.length; i++){
                    blacklistData.push(response[i].source_address)
                }
                this.setState({blackListSourceData:blacklistData});
            }).catch(error => console.log(error));

        axios.post(FETCH_BLACKLISTED_DESTINATION_API,null,{headers})
        .then(res => {
            const response = res.data;
            var blacklistData = []
            for (var i =0; i<response.length; i++){
                blacklistData.push(response[i].destination_address)
            }
            this.setState({blackListDestinationData:blacklistData});
        }).catch(error => console.log(error));
        
        filterSelectDataServiceAsync(this.props.auth_token)
        .then(response => {
            const filter_data = response[0].data;
            this.setState({
                applicationData: filter_data.application,
            });
        })
        .catch(error => console.log(error));

    }

    handleAcceptRuleSubmit = (e) => {
        e.preventDefault();
        const {auth_token,selectedUnverifiedRecordToAccept} = this.props;
        const description = this.description.state.value;
        this.props.dispatchAcceptRule(auth_token,description, selectedUnverifiedRecordToAccept);
    }

    handleRejectRuleSubmit = (e) => {
        e.preventDefault();
        const {auth_token,selectedUnverifiedRecordToReject} = this.props;
        const description = this.description.state.value;
        this.props.dispatchRejectRule(auth_token,description,selectedUnverifiedRecordToReject);
    }

    handleUpdateRuleSubmit = (e) => {
        e.preventDefault();
        const {auth_token,unverifiedRulePagination} = this.props;

        const source_address = this.source_address.state.value;
        const destination_address = this.destination_address.state.value;
        const application = this.application.state.value;
        const description = this.description.state.value;
        const searchSourceIP = this.state.searchSourceIP
        const searchDestinationIP = this.state.searchDestinationIP
        const searchAlias = this.state.searchAlias
        const searchApplication = this.state.searchApplication
        
        this.props.dispatchUpdateRule(auth_token,source_address,destination_address,application,description,{}, unverifiedRulePagination, searchSourceIP, searchDestinationIP, searchAlias, searchApplication);
    }

    handleShowUnverifiedIpDashboard(record){
        this.props.dispatchUnverifiedIpSearchValueUpdate(record.source_address);
        this.setState({quickIpView : true})
    }

    handleShowUnverifiedIpDashboardDestinationIP(record){
        this.props.dispatchUnverifiedIpSearchValueUpdate(record.destination_address);
        this.setState({quickIpView : true})
    }

    closeQuickIpView  = () => {
        this.setState({quickIpView: false})
    }

    filterData = (v) =>{
        this.handleFetchUnverifiedRulesData(this.state.params)   
    }
    
    downloadExcel = () => {
        const data = this.props.unverifiedRulesData ? this.props.unverifiedRulesData : '';//tabular data
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
               }
               dataTable.push(obj);
             }
           }
         }
            option.fileName = 'Unverified Rule'
         option.datas=[
           {
             sheetData:dataTable,
             sheetName:'sheet',
                    sheetFilter:['Created datetime','Source address','Source address alias','Destination address','Destination address alias','Application','Firewall rule'],
                    sheetHeader:['Created Datetime','Source address','Source address alias','Destination address','Destination address alias','Application','Firewall rule']
           }
         ];
        
         var toExcel = new ExportJsonExcel(option); 
         toExcel.saveExcel();        
    }
    
    render(){
        const {selectedUnverifiedRecordToAccept,selectedUnverifiedRecordToReject,selectedUnverifiedRecordToUpdate} = this.props;
        const applicationSelectListItem = this.state.applicationData.map(
            data => <Select.Option key={data[1]}>{data[1]}</Select.Option>
          );
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
                            columns={this.state.columns}
                            dataSource = {this.props.unverifiedRulesData}
                            pagination={this.props.unverifiedRulePagination}
                            onChange={this.handleTableChange}
                            bordered
                            rowClassName = {record =>  {
                                if(this.state.blackListSourceData && this.state.blackListSourceData.includes(record.source_address)){
                                    return "redTable"
                                }
                                if(this.state.blackListDestinationData && this.state.blackListDestinationData.includes(record.destination_address)){
                                    return "redTable"
                                }

                            }}
                        />
                    </Card>
                </Spin>
                <Drawer
                    id={"RejectDrawer"}
                    visible={this.props.unverifiedRuleRejectDrawerLoading}
                    title={"Reject and flag this rule?"}
                    width={500}
                    onClose={this.props.dispatchHandleDrawerClose}
                    closable={true}
                    placement={'right'}>
                    <Spin spinning={!selectedUnverifiedRecordToReject}>
                        {
                            selectedUnverifiedRecordToReject ? (
                                <Fragment>
                                    {this.props.rejectUnverifiedRuleError ? <p style={{color:'red'}}>{this.props.rejectUnverifiedRuleErrorMessage }</p>: null }
                                    {this.props.rejectUnverifiedRuleSuccess ? <p style={{color:'green'}}>{this.props.rejectUnverifiedRuleSuccessMessage} </p>: null }
                                    <Row type="flex" gutter={16}>
                                        <Col xs={24} sm={12} md={12} lg={12} xl={12} style={drawerInfoStyle}>
                                            <Statistic title="Source Address" value={selectedUnverifiedRecordToReject.source_address} />
                                        </Col>
                                        <Col xs={24} sm={12} md={12} lg={12} xl={12} style={drawerInfoStyle}>
                                            <Statistic title="Destination Address" value={selectedUnverifiedRecordToReject.destination_address}/>
                                        </Col>
                                        <Col xs={24} sm={12} md={12} lg={24} xl={24} style={drawerInfoStyle}>
                                            <Statistic title="Application" value={selectedUnverifiedRecordToReject.application}/>
                                        </Col>
                                    </Row>
                                    <br />
                                    <Row type="flex" gutter={16} style={{paddingTop: 10,paddingBottom: 10}}>
                                    <Form style={{width:'100%'}} name={"rejectRuleForm"}>
                                            <Form.Item>
                                                <label>Description</label>
                                                <Input ref={node => (this.description = node)} defaultValue={selectedUnverifiedRecordToReject.description} />
                                            </Form.Item>
                                            <Button
                                                type="primary"
                                                style={{width:'100%'}}
                                                htmlType="submit"
                                                className="login-form-button"
                                                loading={this.props.rejectUnverifiedRuleLoading}
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
                    id={"AcceptDrawer"}
                    visible={this.props.unverifiedRuleAcceptDrawerLoading}
                    title={"Confirm Accept this rule?"}
                    width={500}
                    closable={true}
                    onClose={this.props.dispatchHandleDrawerClose}
                    placement={'right'}>
                    <Spin spinning={!selectedUnverifiedRecordToAccept}>
                        {
                            selectedUnverifiedRecordToAccept ? (
                            <Fragment>
                                {this.props.acceptUnverifiedRuleError ? <p style={{color:'red'}}>{this.props.acceptUnverifiedRuleErrorMessage }</p>: null }
                                {this.props.acceptUnverifiedRuleSuccess ? <p style={{color:'green'}}>{this.props.acceptUnverifiedRuleSuccessMessage} </p>: null }
                                <Row type="flex" gutter={16}>
                                    <Col xs={24} sm={12} md={12} lg={12} xl={12} style={drawerInfoStyle}>
                                        <Statistic title="Source Address" value={selectedUnverifiedRecordToAccept.source_address} />
                                    </Col>
                                    <Col xs={24} sm={12} md={12} lg={12} xl={12} style={drawerInfoStyle}>
                                        <Statistic title="Destination Address" value={selectedUnverifiedRecordToAccept.destination_address}/>
                                    </Col>
                                    <Col xs={24} sm={12} md={12} lg={24} xl={24} style={drawerInfoStyle}>
                                        <Statistic title="Application" value={selectedUnverifiedRecordToAccept.application}/>
                                    </Col>
                                </Row>
                                <br />
                                    <p style={{color:'red'}}>{this.props.error_message}</p>
                                    <Row type="flex" gutter={16} style={{paddingTop: 10,paddingBottom: 10}}>
                                        <Form style={{width:'100%'}} name={"acceptRuleForm"}>

                                        <Form.Item>
                                                <label>Description</label>
                                                <Input ref={node => (this.description = node)} defaultValue={selectedUnverifiedRecordToAccept.description} />
                                            </Form.Item>
                                            <Button
                                                type="primary"
                                                style={{width:'100%'}}
                                                htmlType="submit"
                                                className="login-form-button"
                                                loading={this.props.acceptUnverifiedRuleLoading}
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
                    id={"UpdateDrawer"}
                    visible={this.props.unverifiedRuleUpdateDrawerLoading}
                    title={"Confirm Update this rule?"}
                    width={500}
                    closable={true}
                    onClose={this.props.dispatchHandleDrawerClose}
                    placement={'right'}>
                    <Spin spinning={!selectedUnverifiedRecordToUpdate}>
                        {
                            selectedUnverifiedRecordToUpdate ? (
                                <Fragment>
                                    {this.props.updateUnverifiedRuleError ? <p style={{color:'red'}}>{this.props.updateUnverifiedRuleErrorMessage }</p>: null }
                                    {this.props.updateUnverifiedRuleSuccess ? <p style={{color:'green'}}>{this.props.updateUnverifiedRuleSuccessMessage} </p>: null }
                                    <Row type="flex" gutter={16}>
                                        <Col xs={24} sm={12} md={12} lg={12} xl={12} style={drawerInfoStyle}>
                                            <Statistic title="Source Address" value={selectedUnverifiedRecordToUpdate.source_address} />
                                        </Col>
                                        <Col xs={24} sm={12} md={12} lg={12} xl={12} style={drawerInfoStyle}>
                                            <Statistic title="Destination Address" value={selectedUnverifiedRecordToUpdate.destination_address}/>
                                        </Col>
                                        <Col xs={24} sm={12} md={12} lg={24} xl={24} style={drawerInfoStyle}>
                                            <Statistic title="Application" value={selectedUnverifiedRecordToUpdate.application}/>
                                        </Col>
                                    </Row>
                                    <br />
                                        <p style={{color:'red'}}>{this.props.error_message}</p>
                                        <Row type="flex" gutter={16} style={{paddingTop: 10,paddingBottom: 10}}>
                                            <Form style={{width:'100%'}} name={"updateRuleForm"}>
                                            <Form.Item>
                                                <label>Source Address</label>
                                                <Input ref={node => (this.source_address = node)}  defaultValue={selectedUnverifiedRecordToUpdate.source_address} />
                                            </Form.Item>
                                            <Form.Item>
                                                <label>Destination Address</label>
                                                <Input ref={node => (this.destination_address = node)} defaultValue={selectedUnverifiedRecordToUpdate.destination_address} />
                                            </Form.Item>
                                            <Form.Item>
                                                <label>Application</label>
                                                <Input ref={node => (this.application = node)} defaultValue={selectedUnverifiedRecordToUpdate.application} />
                                            </Form.Item>
                                                <Form.Item>
                                                    <label>Description</label>
                                                    <Input ref={node => (this.description = node)} defaultValue={selectedUnverifiedRecordToUpdate.description} />
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
        application: state.filter.application,

        unverifiedRulesLoading : state.unverifiedRule.unverifiedRulesLoading,
        unverifiedRulesData : state.unverifiedRule.unverifiedRulesData,
        unverifiedRulesSuccess : state.unverifiedRule.unverifiedRulesSuccess,
        unverifiedRulesError: state.unverifiedRule.unverifiedRulesError,

        acceptUnverifiedRuleLoading:state.unverifiedRule.acceptUnverifiedRuleLoading,
        acceptUnverifiedRuleSuccess:state.unverifiedRule.acceptUnverifiedRuleSuccess,
        acceptUnverifiedRuleError:state.unverifiedRule.acceptUnverifiedRuleError,
        acceptUnverifiedRuleSuccessMessage : state.unverifiedRule.acceptUnverifiedRuleSuccessMessage,
        acceptUnverifiedRuleErrorMessage: state.unverifiedRule.acceptUnverifiedRuleErrorMessage,
        selectedUnverifiedRecordToAccept : state.unverifiedRule.selectedUnverifiedRecordToAccept,

        rejectUnverifiedRuleLoading:state.unverifiedRule.rejectUnverifiedRuleLoading,
        rejectUnverifiedRuleSuccess:state.unverifiedRule.rejectUnverifiedRuleSuccess,
        rejectUnverifiedRuleError:state.unverifiedRule.rejectUnverifiedRuleError,
        rejectUnverifiedRuleSuccessMessage : state.unverifiedRule.rejectUnverifiedRuleSuccessMessage,
        rejectUnverifiedRuleErrorMessage: state.unverifiedRule.rejectUnverifiedRuleErrorMessage,
        selectedUnverifiedRecordToReject : state.unverifiedRule.selectedUnverifiedRecordToReject,


        updateUnverifiedRuleLoading:state.unverifiedRule.updateUnverifiedRuleLoading,
        updateUnverifiedRuleSuccess:state.unverifiedRule.updateUnverifiedRuleSuccess,
        updateUnverifiedRuleError:state.unverifiedRule.updateUnverifiedRuleError,
        updateUnverifiedRuleSuccessMessage : state.unverifiedRule.updateUnverifiedRuleSuccessMessage,
        updateUnverifiedRuleErrorMessage: state.unverifiedRule.updateUnverifiedRuleErrorMessage,
        selectedUnverifiedRecordToUpdate : state.unverifiedRule.selectedUnverifiedRecordToUpdate,



        unverifiedRuleAcceptDrawerLoading: state.unverifiedRule.unverifiedRuleAcceptDrawerLoading,
        unverifiedRuleRejectDrawerLoading: state.unverifiedRule.unverifiedRuleRejectDrawerLoading,
        unverifiedRuleUpdateDrawerLoading: state.unverifiedRule.unverifiedRuleUpdateDrawerLoading,

        unverifiedRulePagination : state.unverifiedRule.unverifiedRulePagination,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        dispatchFetchUnverifiedRulesData : (auth_token, params, searchSourceIP, searchDestinationIP, searchAlias, searchApplication,pagination) => dispatch(fetchUnverifiedRulesData(auth_token, params, searchSourceIP, searchDestinationIP, searchAlias, searchApplication,pagination)),
        dispatchFetchBlacklistedAddress:() => dispatch(fetchBlackListedAddress()),
        handleUnverifiedRuleAccept : (auth_token,record) => dispatch(acceptUnverifiedRule(auth_token,record)),
        handleUnverifiedRuleReject : (auth_token,record) => dispatch(rejectUnverifiedRule(auth_token,record)),
        handleUnverifiedRuleUpdate : (auth_token,record) => dispatch(updateUnverifiedRule(auth_token,record)),
        dispatchHandleDrawerClose : () => dispatch(handleDrawerClose()),
        dispatchAcceptRule : (auth_token,description,record) => dispatch(acceptRule(auth_token,description,record)),
        dispatchRejectRule : (auth_token,description,record) => dispatch(rejectRule(auth_token,description,record)),
        dispatchUpdateRule : (auth_token,source_ip,destination_ip,application,description,params, pagination, searchSourceIP, searchDestinationIP, searchAlias, searchApplication) => dispatch(updateRule(auth_token,source_ip,destination_ip,application,description,params, pagination, searchSourceIP, searchDestinationIP, searchAlias, searchApplication)),
        dispatchPaginationUpdate : (pager) => dispatch(updatePagination(pager)),


        dispatchUnverifiedIpSearchValueUpdate : value => dispatch(search(value))
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(UnverifiedRulesTable)