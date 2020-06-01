    import React, {Component, Fragment} from 'react';
    import {Button, Form, List, Select, Spin, Statistic, Table, Tag, Input} from 'antd';
    import reqwest from "reqwest";
    import {drawerInfoStyle, ROOT_URL, bytesToSize,timeElapsedToString} from "../../utils";
    import {connect} from "react-redux";
    import { Drawer} from 'antd';
    import { Card, Col, Row } from 'antd';
    import axios from 'axios';
    import QuickIpView from "../../views/QuickIpView"
    import {search} from "../../actions/ipSearchAction";
    import ExportJsonExcel from 'js-export-excel';
    import { filterSelectDataServiceAsync } from "../../services/filterSelectDataService";
    import Avatar from 'react-avatar';
    import moment from "moment"
    const { Option } = Select;
    const { TextArea } = Input;
    const { Search } = Input;

    const USER_LIST_API = `${ROOT_URL}tt/users/`;
    const FETCH_TT_DETAIL = `${ROOT_URL}tt/detail/`;

    class AnomalyBasedTroubleTicketTable extends Component {
        constructor(props){
            super(props);
            this.state = {
                loadingFollowUp : true,
                record : null,
                recordFollowUpComment : null,
                recordFollowUpAssignedTo : this.props.current_session_user_id,
                recordIsAnomaly:null,
                recordSeverityLevel: null,
                recordFollowUpData : [],
                followUpDrawerVisible : false,
                applicationData: [],
                searchSourceIP: "",
                searchDestinationIP: "",
                searchApplication: "",
                searchLogname: "",
                columns : [
                    // {
                    //     title: 'Id',
                    //     dataIndex: 'id',
                    //     key: 'id',
                    // },
                    {
                        title: 'Source Address',
                        dataIndex: 'source_address',
                        key: 'source_address',
                        render: (text,record) => <a onClick={()=> this.handleShowSourceIpProfile(record)}>{text}</a>,
                    },
                    {
                        title: 'Destination Address',
                        dataIndex: 'destination_address',
                        key: 'destination_address',
                        render: (text,record) => <a onClick={()=> this.handleShowDestinationIpProfile(record)}>{text}</a>,
                    },
                    {
                        title: 'Application',
                        dataIndex: 'application',
                        key: 'application',
                    },
                    {
                        title: "Destination Port",
                        dataIndex: "destination_port",
                        key: "destination_port"
                    },
                    {
                        title: "Bytes Sent",
                        dataIndex: "bytes_sent",
                        key: "bytes_sent",
                        render: (text, record) => bytesToSize(text)
                    },
                    {
                        title: "Bytes Received",
                        dataIndex: "bytes_received",
                        key: "bytes_received",
                        render: (text, record) => bytesToSize(text)
                    },
                    {
                        title: "Logged DateTime",
                        dataIndex: "logged_datetime",
                        key: "logged_datetime",
                        render: text => (new Date(text*1000+20700000).toUTCString()).replace(" GMT", "")
                    },
                    {
                        title: 'Action',
                        dataIndex: '',
                        key: 'x',
                        render: (record) => <a onClick={()=>{this.showDrawer(record)}}>Follow Up</a>,
                    },
                ],
                data : [],
                params: {},
                pagination:{},
                loading:false,
                user_list : [],
                error_message : "",
                quickIpView : false, 
                ttDetailCategorical: null,
                ttDetailNumeric:null,
                selectedRecord: null,
                expandedRowKeys: []
            }
        }

        handleShowSourceIpProfile(record){
            this.props.dispatchIpSearchValueUpdate(record.source_address);
            this.setState({quickIpView : true})
        }

        handleShowDestinationIpProfile(record){
            this.props.dispatchIpSearchValueUpdate(record.destination_address);
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
                    this.setState({
                        recordFollowUpData : res.data.results,
                        recordFollowUpComment : "",
                        recordFollowUpAssignedTo : this.props.current_session_user_id,
                        error_message : ""
                    }, ()=>{this.handleFetchAnomalyRecord(this.state.record)})
                })
                .catch(e => {
                    this.setState({
                        error_message : "something went wrong!!"
                    })
                });

        }

        handleAnomalyTTClose = (e) => {
            e.preventDefault();
            const comment = this.state.recordFollowUpComment;
            const severity_level = this.state.recordSeverityLevel;
            const is_anomaly = this.state.recordIsAnomaly;
            if(comment == null  || comment == ""){
                this.setState({error_message:"Please Enter Reason To Closing Trouble Ticket"});
                return
            }
            const authorization = `Token ${this.props.auth_token}`;

            let headers = {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: authorization
            };


            let bodyFormData = new FormData();
            bodyFormData.set("description", comment);
            bodyFormData.set("severity_level", severity_level);
            bodyFormData.set("is_anomaly", is_anomaly);

            axios.post(`${ROOT_URL}tt/close/${this.state.record.id}/`,bodyFormData,{headers})
            .then(res=>{
                this.setState({
                    followUpDrawerVisible: false,
                    error_message : "",
                    loading: true,
                    recordFollowUpComment: null
                })
            })
            .catch(e => {
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
                    const filter_data = response[0].data;
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
                        ttDetailCategorical: res.data.categorical,
                        ttDetailNumeric: res.data.numeric,
                        selectedRecord: record.id
                    })
                })
            }   
            var dataToShow = []
            dataToShow.push(<Fragment key={"created_datetime_"}><br/><b>Created DateTime:</b> {(new Date(parseInt(record.created_datetime)*1000+20700000).toUTCString()).replace(" GMT", "")} </Fragment>)
            dataToShow.push(<Fragment key={"protocol_"}><br/><b>Protocol:</b> {record.protocol} </Fragment>)
            dataToShow.push(<Fragment key={"source_zone_"}><br/><b>Source Zone:</b> {record.source_zone} </Fragment>)
            dataToShow.push(<Fragment key={"destination_zone_"}><br/><b>Destination Zone:</b> {record.destination_zone} </Fragment>)
            dataToShow.push(<Fragment key={"inbound_interface_"}><br/><b>Inbound Interface:</b> {record.inbound_interface} </Fragment>)
            dataToShow.push(<Fragment key={"outbound_interface_"}><br/><b>Outbound Interface:</b> {record.outbound_interface} </Fragment>)
            dataToShow.push(<Fragment key={"action_"}><br/><b>Action:</b> {record.action} </Fragment>)
            dataToShow.push(<Fragment key={"category_"}><br/><b>Category:</b> {record.category} </Fragment>)
            dataToShow.push(<Fragment key={"session_end_reason_"}><br/><b>Session End Reason:</b> {record.session_end_reason} </Fragment>)
            dataToShow.push(<Fragment key={"packets_received_"}><br/><b>Packets Received:</b> {record.packets_received} </Fragment>)
            dataToShow.push(<Fragment key={"packets_sent_"}><br/><b>Packets Sent:</b> {record.packets_sent} </Fragment>)
            dataToShow.push(<Fragment key={"time_elapsed_"}><br/><b>Time Elapsed:</b> {timeElapsedToString(record.time_elapsed)} </Fragment>)
            dataToShow.push(<hr key = {"linebreak"}></hr>)
            dataToShow.push(<Fragment key={"reasons"}><b>Reasons For Anomaly:</b></Fragment>)
            {this.state.ttDetailCategorical ? (
                Object.keys(this.state.ttDetailCategorical).forEach(key => {
                    if (this.state.ttDetailCategorical[key] < 0.25){
                        dataToShow.push(<Fragment key={key}><br/>{key} {record[key]} is used {this.state.ttDetailCategorical[key] *100}% of time.</Fragment>)
                    }
                })
            ):null}
            {this.state.ttDetailNumeric ? (
                Object.keys(this.state.ttDetailNumeric).forEach(key => {
                    
                    if(key == "bytes_sent" || key == "bytes_received"){
                        dataToShow.push(<Fragment key={key}><br/>Expected <b>{key}</b>  <b>{bytesToSize(this.state.ttDetailNumeric[key])}</b> found <b>{bytesToSize(record[key])}</b> .</Fragment>)
                    }
                    else if(key == "time_elapsed" ){
                        dataToShow.push(<Fragment key={key}><br/>Expected <b>{key}</b>  <b>{timeElapsedToString(this.state.ttDetailNumeric[key])}</b> found <b>{timeElapsedToString(record[key])}</b> .</Fragment>)
                    }
                    else{
                        dataToShow.push(<Fragment key={key}><br/>Expected <b>{key}</b>  <b>{this.state.ttDetailNumeric[key]}</b> found <b>{record[key]}</b> .</Fragment>)
                    }
                })
            ):null}
            return dataToShow
        }
        
        handleTableChange = (pagination, filters, sorter) => {
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
            this.setState({ loading: true });

            const FETCH_API = `${ROOT_URL}tt/open/`

            const token = `Token ${this.props.auth_token}`;
            
            let headers = {
                Accept: "application/json",
                "Content-Type": "application/json",
                "Authorization" : token
            };

            let bodyFormData = new FormData();
            bodyFormData.set("source_address", this.state.searchSourceIP);
            bodyFormData.set("destination_address", this.state.searchDestinationIP);
            bodyFormData.set("application", this.state.searchApplication);
            bodyFormData.set("log_name", this.state.searchLogname);

            axios.post(FETCH_API,bodyFormData,{headers, params})
                .then(res => {
                    const page = this.state.pagination;
                    page.total  = res.data.count;
                    this.setState({
                        data:res.data.results,
                        loading:false,
                        pagination: page
                })
            });
        };

        onTableRowExpand = (expanded, record) => {
            var keys = [];
            if(expanded){
                keys.push(record.id);
            }
            this.setState({expandedRowKeys: keys, ttDetail: null});
        }

        filterData = (v) =>{
            this.fetch()   
        }

        downloadExcel = () => {
            const data = this.state.data ? this.state.data : '';//tabular data
             var option={};
             let dataTable = [];
             if (data) {
               for (let i in data) {
                 if(data){
                   let obj = {
                                'Created datetime': (new Date(parseInt(data[i].created_datetime)*1000+20700000).toUTCString()).replace(" GMT", ""),
                                'Source address': data[i].source_address,
                                'Destination address': data[i].destination_address,
                                'Application':data[i].application,
                                'Destination port':data[i].destination_port,
                                'Bytes sent':data[i].bytes_sent,
                                'Bytes received':data[i].bytes_received,
                                'Protocol':data[i].protocol,
                                'Source zone':data[i].source_zone,
                                'Destination zone':data[i].destination_zone,
                                'Inbound interface':data[i].inbound_interface,
                                'Outbound interface':data[i].outbound_interface,
                                'Action':data[i].action,
                                'Category':data[i].category,
                                'Session end reason':data[i].session_end_reason,
                                'Packets received':data[i].packets_received,
                                'Packets sent':data[i].packets_sent,
                                'Time elapsed':data[i].time_elapsed
                   }
                   dataTable.push(obj);
                 }
               }
             }
                option.fileName = 'Anomalous Trouble Tickets'
             option.datas=[
               {
                 sheetData:dataTable,
                 sheetName:'sheet',
                        sheetFilter:['Created datetime','Source address','Destination address','Application','Destination port','Bytes sent','Bytes received','Protocol','Source zone','Destination zone','Inbound interface','Outbound interface','Action','Category','Session end reason','Packets received','Packets sent','Time elapsed'],
                        sheetHeader:['Created Datetime','Source address','Destination address','Application','Destination port','Bytes sent','Bytes received','Protocol','Source zone','Destination zone','Inbound interface','Outbound interface','Action','Category','Session end reason','Packets received','Packets sent','Time elapsed']
               }
             ];
            
             var toExcel = new ExportJsonExcel(option); 
             toExcel.saveExcel();        
        }
        
        render() {
            const applicationSelectListItem = this.state.applicationData.map(
                data => <Option key={data[1]}>{data[1]}</Option>
            );
            return (
                <Fragment>
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
                                <Input 
                                    value={this.state.searchLogname}
                                    placeholder="Log Name"
                                    onChange={(e)=>this.setState({searchLogname : e.target.value})}
                                />
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
                        columns={this.state.columns}
                        expandedRowRender={this.handleTTDetail}
                        expandedRowKeys={this.state.expandedRowKeys}
                        onExpand={this.onTableRowExpand}
                        rowKey={record => record.id}
                        dataSource={this.state.data}
                        pagination={this.state.pagination}
                        loading={this.state.loading}
                        onChange={this.handleTableChange}
                        bordered
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
                                                <Statistic title="Source Address" value={this.state.record.source_address} />
                                            </Col>
                                            <Col xs={24} sm={12} md={12} lg={12} xl={12} style={drawerInfoStyle}>
                                                <Statistic title="Destination Address" value={this.state.record.destination_address}/>
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
                                                                avatar={<Avatar color={Avatar.getRandomColor('sitebase', ['red', 'green', 'blue'])} size={50} name={item.assigned_by.username} />}
                                                                title={<b>{item.description}</b>}
                                                                description={`${(new Date((parseInt(item.follow_up_datetime)+20700)*1000).toUTCString()).replace(" GMT", "")} | Assigned By ${item.assigned_by.username}`}
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
                                                <Col xs={24} sm={12} md={24} lg={12} xl={12} style={{paddingTop: 10,paddingBottom: 10}}>
                                                    <Select style={{width:'100%'}} defaultValue={"not-applicable"}  onChange={(value)=>this.setState({recordSeverityLevel : value})}>
                                                        <Option key={"not-applicable"} value={"not-applicable"}>Severity - Not Applicable</Option>
                                                        <Option key={"low"} value={"low"}>Severity - Low</Option>
                                                        <Option key={"medium"} value={"medium"}>Severity - Medium</Option>
                                                        <Option key={"high"} value={"high"}>Severity - High</Option>
                                                    </Select>
                                                </Col>
                                                <Col xs={24} sm={12} md={24} lg={12} xl={12} style={{paddingTop: 10,paddingBottom: 10}}>
                                                    <Select style={{width:'100%'}} defaultValue={"false"}  onChange={(value)=>this.setState({recordIsAnomaly : value})}>
                                                        <Option key={"true"} value={"true"}>Is Anomaly - Yes</Option>
                                                        <Option key={"false"} value={"false"}>Is Anomaly - No</Option>
                                                    </Select>                                                
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