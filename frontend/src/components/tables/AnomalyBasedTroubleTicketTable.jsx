import React, {Component, Fragment} from 'react';
import {Avatar, Button, Form, List, Select, Spin, Statistic, Table, Tag, Input} from 'antd';
import reqwest from "reqwest";
import {drawerInfoStyle, ROOT_URL} from "../../utils";
import {connect} from "react-redux";
import { Drawer} from 'antd';
import { Card, Col, Row } from 'antd';
import axios from 'axios';
import QuickIpView from "../../views/QuickIpView"
import {search} from "../../actions/ipSearchAction";
import { filterSelectDataServiceAsync } from "../../services/filterSelectDataService";
import moment from "moment"
const { Option } = Select;
const { TextArea } = Input;


const USER_LIST_API = `${ROOT_URL}tt/users/`;
const FETCH_TT_DETAIL = `${ROOT_URL}tt/detail/`;

const { Search } = Input;

class AnomalyBasedTroubleTicketTable extends Component {
    constructor(props){
        super(props);
        this.state = {
            loadingFollowUp : true,
            record : null,
            recordFollowUpComment : null,
            recordFollowUpAssignedTo : this.props.current_session_user_id,
            recordFollowUpData : [],
            followUpDrawerVisible : false,
            applicationData: [],
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
                    render: (text,record) => <a onClick={()=> this.handleShowSourceIpProfile(record)}>{text}</a>,
                },
                {
                    title: 'Destination Address',
                    dataIndex: 'destination_ip',
                    key: 'destination_ip',
                    render: (text,record) => <a onClick={()=> this.handleShowDestinationIpProfile(record)}>{text}</a>,
                },
                {
                    title: 'Application',
                    dataIndex: 'application',
                    key: 'application',
                },
                {
                    title: 'Log Name',
                    dataIndex: 'log_name',
                    key: 'log_name',
                },
                {
                    title: 'Action',
                    dataIndex: '',
                    key: 'x',
                    render: (record) => <a onClick={()=>{this.showDrawer(record)}}>Follow Up</a>,
                },
            ],
            data : [],
            pagination:{},
            loading:false,
            user_list : [],
            error_message : "",
            quickIpView : false, 
            ttDetail: null,
            selectedRecord: null,
            expandedRowKeys: []
        }
    }

    handleShowSourceIpProfile(record){
        this.props.dispatchIpSearchValueUpdate(record.source_ip);
        this.setState({quickIpView : true})
    }

    handleShowDestinationIpProfile(record){
        this.props.dispatchIpSearchValueUpdate(record.destination_ip);
        this.setState({quickIpView : true})
    }

    closeQuickIpView  = () => {
        this.setState({quickIpView: false})
    }

    showDrawer = (record) => {
        this.setState({
            followUpDrawerVisible: true,
            record : record
        });
        this.handleFetchAnomalyRecord(record);
        this.setState({
            loadingFollowUp : false
        });


    };

    onClose = () => {
        this.setState({
            followUpDrawerVisible: false,
            error_message : "",
            recordFollowUpComment: null
        });

    };

    handleFetchAnomalyRecord = (record) => {
        const authorization = `Token ${this.props.auth_token}`;

        let headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: authorization
        };
        axios.get(`${ROOT_URL}tt/anomaly/${record.id}/`,{headers})
            .then(res=>{
                console.log('follow up record',res.data.results);
                this.setState({
                    recordFollowUpData : res.data.results
                })
            });

    }

    handlePostAnomalyFollowUp = (e) => {
        e.preventDefault();
        const comment = this.state.recordFollowUpComment;
        if(comment == null  || comment == ""){
            this.setState({error_message:"Please Enter Description to follow up"});
            return
        }
        const assignedTo = this.state.recordFollowUpAssignedTo;
        const authorization = `Token ${this.props.auth_token}`;

        let headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: authorization
        };
        
        let data = {
            assigned_by_user_id: parseInt(this.props.current_session_user_id),
            assigned_to_user_id: assignedTo,
            description:comment
        };

        axios.post(`${ROOT_URL}tt/anomaly/${this.state.record.id}/`,data,{headers})
            .then(res=>{
                console.log('follow up record',res.data.results);
                this.setState({
                    recordFollowUpData : res.data.results,
                    recordFollowUpComment : "",
                    recordFollowUpAssignedTo : this.props.current_session_user_id,
                    error_message : ""
                }, ()=>{this.handleFetchAnomalyRecord(this.state.record)})
            })
            .catch(e => {
                console.log("error",e);
                this.setState({
                    error_message : "something went wrong!!"
                })
            });

    }

    handleAnomalyTTClose = (e) => {
        e.preventDefault();
        const comment = this.state.recordFollowUpComment;
        if(comment == null  || comment == ""){
            this.setState({error_message:"Please Enter Reason To Closing Trouble Ticket"});
            return
        }
        // console.log("selected tt to close", this.state.record.id)
        const authorization = `Token ${this.props.auth_token}`;

        let headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: authorization
        };


        let bodyFormData = new FormData();
        bodyFormData.set("description", comment);
        axios.post(`${ROOT_URL}tt/close/${this.state.record.id}/`,bodyFormData,{headers})
        .then(res=>{
            console.log('Trouble Ticket Closed Successfully');
            this.setState({
                followUpDrawerVisible: false,
                error_message : "",
                loading: true,
                recordFollowUpComment: null
            })
        })
        .catch(e => {
            console.log("error",e);
            this.setState({
                error_message : "something went wrong!!"
            })
        });

        setTimeout(()=>{this.fetch()},2500);
    }

    componentDidMount() {
        this.fetch();
        this.fetchSelectUserList();
        filterSelectDataServiceAsync(this.props.auth_token)
            .then(response => {
                const filter_data = response.data;
                this.setState({
                    applicationData: filter_data.application,
                });
            })
            .catch(error => console.log(error));
    }

    fetchSelectUserList = () =>{
        let headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Authorization" : `Token ${this.props.auth_token}`
        };


        axios.post(USER_LIST_API,null,{headers})
            .then(res => {
                const data = res.data;
                this.setState({
                    user_list : data
                });
                console.log("user list",this.state.user_list);
            });

    }

    handleTTDetail = (record) => {
        const authorization = `Token ${this.props.auth_token}`;

        let headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: authorization
        };

        const url = FETCH_TT_DETAIL + record.id + '/';
        if(this.state.selectedRecord != record.id){
            axios.post(url, null, {headers})
            .then(res=>{
                this.setState({
                    ttDetail: res.data,
                    selectedRecord: record.id
                })
                console.log("tt detail data", this.state.ttDetail)
            })
        }   
        var dataToShow = (
        <Fragment>
            <b>Created Date: </b>{(new Date(record.created_datetime).toUTCString()).replace(" GMT", "")} 
            <br/><b>Bytes Sent: </b> {record.bytes_sent}
            <br/><b>Bytes Received: </b> {record.bytes_received} 
            <br/><b>Packets Sent: </b> {record.packets_sent}
            <br/><b>Packets Received: </b> {record.packets_received} 
            <br/><b>Bytes Sent: </b> {record.bytes_sent}
            <br/><b>Source Port: </b> {record.source_port} 
            <br/><b>Destination Port: </b> {record.destination_port}
            <br/><b>Action: </b> {record.action}
            <br/><b>Session End Reason: </b> {record.session_end_reason}
            <br/><b>Inbound Interface: </b> {record.inbound_interface}
            <br/><b>Outbound Interface: </b> {record.outbound_interface} 
            {this.state.ttDetail ? (
                <Fragment>
                    <hr></hr>
                    <b>Details:</b>
                    <br />
                    <ul>
                    <li>The average bytes sent is <b>{this.state.ttDetail.bytes_sent_average.toFixed(0)}</b> and actual bytes sent is <b>{record.bytes_sent}.</b></li>
                    <li>The average bytes received is <b>{this.state.ttDetail.bytes_received_average.toFixed(0)}</b> and actual bytes received is <b>{record.bytes_received}.</b></li>
                    <li>The average packets sent is <b>{this.state.ttDetail.packets_sent_average.toFixed(0)}</b> and actual packets sent is <b>{record.packets_sent}.</b></li>
                    <li>The average packets received is <b>{this.state.ttDetail.packets_received_average.toFixed(0)}</b> and actual packets received is <b>{record.packets_received}.</b></li>
                    <li>This application is used <b>{this.state.ttDetail.application.count}</b> with average packets sent <b>{this.state.ttDetail.application.packets}</b>. The total data used is <b>{this.state.ttDetail.application.bytes.toFixed(0)}</b></li>
                    </ul>
                    <hr></hr>
                </Fragment>
            ): null}
        </Fragment>
        );
        return dataToShow
    }
    
    handleTableChange = (pagination, filters, sorter) => {
        console.log('pagination',pagination);
        console.log('filter',filters)
        console.log('sorter',sorter)
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        this.setState({
            pagination: pager
        });
        this.fetch({
            // results: pagination.pageSize,
            page: pagination.current,
            sortField: sorter.field,
            sortOrder: sorter.order,
            ...filters
        });
    };

    fetch = (params = {}) => {

        console.log("data loading");
        this.setState({ loading: true });
        reqwest({
            url: `${ROOT_URL}tt/open/`,
            method: "get",
            headers: {
                Authorization: `Token ${this.props.auth_token}`
            },
            data: {
                results: 5,
                page: params.page ? params.page : 1,
                offset: 10
            },
            type: "json"
        }).then(data => {
            console.log('data fetched',this.data);
            const { pagination } = this.state;
            pagination.total = data.count;
            this.setState({
                loading: false,
                data: data.results,
                pagination
            });
        });
    };

    onTableRowExpand = (expanded, record) => {
        var keys = [];
        if(expanded){
            keys.push(record.id);
        }
        this.setState({expandedRowKeys: keys, ttDetail: null});
    }

    render() {
        const title = () => <h3>Anomaly Based Trouble Tickets</h3>
        const expandedRowRender = (record) => <p>
            <b>Created Date: </b>{(new Date(record.created_datetime).toUTCString()).replace(" GMT", "")} 
            <br/><b>Bytes Sent: </b> {record.bytes_sent}
            <br/><b>Bytes Received: </b> {record.bytes_received} 
            <br/><b>Packets Sent: </b> {record.packets_sent}
            <br/><b>Packets Received: </b> {record.packets_received} 
            <br/><b>Bytes Sent: </b> {record.bytes_sent}
            <br/><b>Source Port: </b> {record.source_port} 
            <br/><b>Destination Port: </b> {record.destination_port}
            <br/><b>Action: </b> {record.action}
            <br/><b>Session End Reason: </b> {record.session_end_reason}
            <br/><b>Inbound Interface: </b> {record.inbound_interface}
            <br/><b>Outbound Interface: </b> {record.outbound_interface} 
        </p>
        const applicationSelectListItem = this.state.applicationData.map(
            data => <Option key={data[0]}>{data[1]}</Option>
          );
        return (
            <Fragment>
                <Card title={
                    <Fragment>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                            <Search 
                                id="searchSourceIp"
                                placeholder="Search Source IP" 
                                onSearch={value => console.log(value)} 
                                enterButton 
                            />
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                            <Search 
                                id="searchDestinationIp"
                                placeholder="Search Destination IP" 
                                onSearch={value => console.log(value)} 
                                enterButton 
                            />
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={6} xl={6}>
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
                                onChange={v => console.log(v)}
                            >
                                {applicationSelectListItem}
                            </Select>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                            <Search 
                                id="searchLog"
                                placeholder="Search Log Name" 
                                onSearch={value => console.log(value)} 
                                enterButton 
                            />
                        </Col>
                    </Row>
                    </Fragment>
                }>
                <Table
                    columns={this.state.columns}
                    expandedRowRender={this.handleTTDetail}
                    expandedRowKeys={this.state.expandedRowKeys}
                    onExpand={this.onTableRowExpand}
                    rowKey={record => record.id}
                    dataSource={this.state.data}
                    pagination={this.state.pagination}
                    loading={this.state.loading}
                    onChange={this.handleTableChange}
                />
                </Card>
                <Drawer title="Follow Up"
                        width={650}
                        placement="right"
                        closable={true}
                        onClose={this.onClose}
                        visible={this.state.followUpDrawerVisible}
                >
                    {
                        this.state.record ? (
                            <Spin tip={"loading..."} spinning={this.state.loadingFollowUp}>
                                <Fragment>
                                    <Row type="flex" gutter={16}>
                                        <Col xs={24} sm={12} md={12} lg={12} xl={12} style={drawerInfoStyle}>
                                            <Statistic title="Source IP" value={this.state.record.source_ip} />
                                        </Col>
                                        <Col xs={24} sm={12} md={12} lg={12} xl={12} style={drawerInfoStyle}>
                                            <Statistic title="Destination IP" value={this.state.record.destination_ip}/>
                                        </Col>
                                        <Col xs={24} sm={12} md={12} lg={8} xl={8} style={drawerInfoStyle}>
                                            <Statistic title="Application" value={this.state.record.application}/>
                                        </Col>
                                        <Col xs={24} sm={12} md={12} lg={8} xl={8} style={drawerInfoStyle}>
                                            <Statistic title="Source Port" value={this.state.record.source_port}/>
                                        </Col>
                                        <Col xs={24} sm={12} md={12} lg={8} xl={8} style={drawerInfoStyle}>
                                            <Statistic title="Destination Port" value={this.state.record.destination_port}/>
                                        </Col>
                                        <Col xs={24} sm={24} md={24} lg={24} xl={24} style={drawerInfoStyle}>
                                            <Statistic title="Log Name" value={this.state.record.log_name}/>
                                        </Col>
                                    </Row>
                                    <br />

                                    <Fragment>
                                        { this.state.recordFollowUpData ? (
                                            <List
                                                itemLayout="horizontal"
                                                dataSource={this.state.recordFollowUpData}
                                                renderItem={item => (
                                                    <List.Item>
                                                        <List.Item.Meta
                                                            avatar={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />}
                                                            title={<b>{item.description}</b>}
                                                            description={`${new Date(item.follow_up_datetime)} | Assigned By ${item.assigned_by.username}`}
                                                        />
                                                    </List.Item>
                                                )}
                                            />

                                        ) : (
                                            <p>No Follows ups</p>
                                        )}
                                        <br />
                                        <Form>
                                            <p style={{color:'red'}}>{this.state.error_message}</p>
                                        <Row type="flex" gutter={16} style={{paddingTop: 10,paddingBottom: 10}}>
                                            <Col xs={24} sm={12} md={24} lg={24} xl={24}>
                                                <TextArea rows={3} value={this.state.recordFollowUpComment} onChange={(e)=>this.setState({recordFollowUpComment : e.target.value})}/>
                                            </Col>
                                            <Col xs={24} sm={12} md={16} lg={12} xl={12} style={{paddingTop: 10,paddingBottom: 10}}>
                                                <Select style={{width:'100%'}} defaultValue={parseInt(this.props.current_session_user_id)}  onChange={(value)=>this.setState({recordFollowUpAssignedTo : value})}>
                                                    {this.state.user_list.map(user =>
                                                        <Option key={user.id} value={user.id}>{user.full_name}</Option>
                                                    )}
                                                </Select>
                                            </Col>
                                            <Col xs={24} sm={12} md={8} lg={6} xl={6} style={{paddingTop: 10,paddingBottom: 10}}>
                                                <Button type="primary" style={{width:'100%'}} htmlType="submit" className="login-form-button" onClick={e =>this.handlePostAnomalyFollowUp(e)}>Follow Up</Button>
                                            </Col>
                                            <Col xs={24} sm={12} md={8} lg={6} xl={6} style={{paddingTop: 10,paddingBottom: 10}}>
                                                <Button type="danger" style={{width:'100%'}} htmlType="submit" className="login-form-button" onClick={e =>this.handleAnomalyTTClose(e)}>Close TT</Button>
                                            </Col>
                                        </Row>
                                        </Form>
                                    </Fragment>
                                </Fragment>
                            </Spin>
                        ) :
                            (
                                <p> Select a TT to follow up</p>
                            )
                    }
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
    }
}

const mapDispatchToProps = dispatch => {
    return{
        dispatchIpSearchValueUpdate : value => dispatch(search(value))
    }
}
export default connect(mapStateToProps,mapDispatchToProps)(AnomalyBasedTroubleTicketTable);