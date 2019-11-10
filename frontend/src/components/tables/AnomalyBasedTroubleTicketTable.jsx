import React, {Component, Fragment} from 'react';
import {Avatar, Button, Form, List, Select, Spin, Statistic, Table} from 'antd';
import reqwest from "reqwest";
import {ROOT_URL} from "../../utils";
import {connect} from "react-redux";
import { Drawer} from 'antd';
import { Card, Col, Row } from 'antd';
import axios from 'axios';
import { Input } from 'antd';
const { Option } = Select;
const { TextArea } = Input;



const drawerInfoStyle = {
    paddingBottom : 10,
    paddingTop : 10,
    border: '1px solid rgb(235, 237, 240)'
}

const USER_LIST_API = `${ROOT_URL}tt/users/`;


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
                    title: 'Source Port',
                    dataIndex: 'source_port',
                    key: 'source_port',
                },
                {
                    title: 'Destination Port',
                    dataIndex: 'destination_port',
                    key: 'destination_port',
                },
                {
                    title: 'Bytes Sent',
                    dataIndex: 'bytes_sent',
                    key: 'bytes_sent',
                },
                {
                    title: 'Bytes Received',
                    dataIndex: 'bytes_received',
                    key: 'bytes_received',
                },
                {
                    title: 'Log Name',
                    dataIndex: 'log.log_name',
                    key: 'log.log_name',
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
            error_message : ""
        }
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
            error_message : ""
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

    componentDidMount() {
        this.fetch();
        this.fetchSelectUserList();
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
            url: `${ROOT_URL}tt/anomaly/`,
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


    render() {
        return (
            <Fragment>
                <Table
                    columns={this.state.columns}
                    rowKey={record => record.id}
                    dataSource={this.state.data}
                    pagination={this.state.pagination}
                    loading={this.state.loading}
                    onChange={this.handleTableChange}
                />
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
                                        <Col xs={24} sm={12} md={12} lg={8} xl={8} style={drawerInfoStyle}>
                                            <Statistic title="Source IP" value={this.state.record.source_ip} />
                                        </Col>
                                        <Col xs={24} sm={12} md={12} lg={8} xl={8} style={drawerInfoStyle}>
                                            <Statistic title="Destination IP" value={this.state.record.destination_ip}/>
                                        </Col>
                                        <Col xs={24} sm={12} md={12} lg={8} xl={8} style={drawerInfoStyle}>
                                            <Statistic title="Application" value={this.state.record.application}/>
                                        </Col>
                                        <Col xs={24} sm={12} md={12} lg={6} xl={6} style={drawerInfoStyle}>
                                            <Statistic title="Source Port" value={this.state.record.source_port}/>
                                        </Col>
                                        <Col xs={24} sm={12} md={12} lg={6} xl={6} style={drawerInfoStyle}>
                                            <Statistic title="Destination Port" value={this.state.record.destination_port}/>
                                        </Col>
                                        <Col xs={24} sm={12} md={12} lg={6} xl={6} style={drawerInfoStyle}>
                                            <Statistic title="Bytes Sent" value={this.state.record.bytes_sent}/>
                                        </Col>
                                        <Col xs={24} sm={12} md={12} lg={6} xl={6} style={drawerInfoStyle}>
                                            <Statistic title="Bytes Received" value={this.state.record.bytes_received}/>
                                        </Col>
                                        <Col xs={24} sm={24} md={24} lg={24} xl={24} style={drawerInfoStyle}>
                                            <Statistic title="Log Name" value={this.state.record.log.log_name}/>
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
                                        <Form >
                                            <p style={{color:'red'}}>{this.state.error_message}</p>
                                        <Row type="flex" gutter={16} style={{paddingTop: 10,paddingBottom: 10}}>
                                            <Col xs={24} sm={12} md={24} lg={24} xl={24}>
                                                <TextArea rows={3} value={this.state.recordFollowUpComment} onChange={(e)=>this.setState({recordFollowUpComment : e.target.value})}/>
                                            </Col>
                                            <Col xs={24} sm={12} md={16} lg={16} xl={16} style={{paddingTop: 10,paddingBottom: 10}}>
                                                <Select style={{width:'100%'}} defaultValue={parseInt(this.props.current_session_user_id)}  onChange={(value)=>this.setState({recordFollowUpAssignedTo : value})}>
                                                    {this.state.user_list.map(user =>
                                                        <Option key={user.id} value={user.id}>{user.full_name}</Option>
                                                    )}
                                                </Select>
                                            </Col>
                                            <Col xs={24} sm={12} md={8} lg={8} xl={8} style={{paddingTop: 10,paddingBottom: 10}}>
                                                <Button type="primary" style={{width:'100%'}} htmlType="submit" className="login-form-button" onClick={e =>this.handlePostAnomalyFollowUp(e)}>Follow Up</Button>
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

            </Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        auth_token : state.auth.auth_token,
        current_session_user_id : state.auth.current_session_user_id
    }
}

export default connect(mapStateToProps,null)(AnomalyBasedTroubleTicketTable);