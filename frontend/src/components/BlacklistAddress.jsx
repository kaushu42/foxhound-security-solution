import React, {Component, Fragment} from 'react';
import {connect} from "react-redux";
import {axiosHeader, ROOT_URL, bytesToSize} from "../utils";
import axios from "axios";
import {Card, List, Drawer, Table, Spin} from "antd";
import QuickIpView from "../views/QuickIpView"
import {search} from "../actions/ipSearchAction";

const FETCH_BLACKLIST_SOURCE_API = `${ROOT_URL}mis/blacklist/source/`;
const FETCH_BLACKLIST_DESTINATION_API = `${ROOT_URL}mis/blacklist/destination/`;
const FETCH_APPLICATION_LOG_API = `${ROOT_URL}log/blacklist/`;

class BlacklistAddress extends Component {

    state = {
        blacklistSourceData : null,
        blacklistDestinationData: null,
        selectedIPLogData: null,
        selectedIPAddress:null,
        quickIpView : false, 
        params: {},
        loading: false,
        pagination: {},
        columns: [
            {
              title: "Source Address",
              dataIndex: "source_ip",
              key: "source_ip",
              render: (text, record) => (
                <a onClick={() => this.handleShowSourceIpProfile(record)}>{text}</a>
              )
            },
            {
              title: "Destination Address",
              dataIndex: "destination_ip",
              key: "destination_ip",
              render: (text, record) => (
                <a onClick={() => this.handleShowDestinationIpProfile(record)}>
                  {text}
                </a>
              )
            },
            {
              title: "Application",
              dataIndex: "application",
              key: "application"
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
              // render: text => moment(text).format("YYYY-MM-DD, HH:MM:SS")
              render: text => (new Date(text*1000+20700000).toUTCString()).replace(" GMT", "")
            }
          ],
    }

    componentDidMount() {
        let auth_token = this.props.auth_token;
        let headers = axiosHeader(auth_token);
        axios.post(FETCH_BLACKLIST_SOURCE_API,null,{headers})
            .then(res => {
                const response = res.data;
                this.setState({blacklistSourceData:response});
            }).catch(error => console.log(error));
        axios.post(FETCH_BLACKLIST_DESTINATION_API,null,{headers})
        .then(res => {
            const response = res.data;
            this.setState({blacklistDestinationData:response});
        }).catch(error => console.log(error));
    }

    selectedIP = (id) =>{
        this.props.dispatchIpSearchValueUpdate(id.target.id);
        var ip = id.target.id
        this.setState({selectedIPAddress:ip, quickIpView : true, loading:true}, this.fetchLogData);
    }

    fetchLogData = (params = {}) => {
        const token = `Token ${this.props.auth_token}`;
        let headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: token
        };
        let bodyFormDataForLog = new FormData();
        bodyFormDataForLog.set("ip", this.state.selectedIPAddress);

        axios.post(FETCH_APPLICATION_LOG_API, bodyFormDataForLog, { headers, params })
        .then(res => {
            const page = this.state.pagination;
            page.total = res.data.count;
            this.setState({
            selectedIPLogData: res.data.results,
            pagination: page,
            loading:false
            });
        });
    }
    closeQuickIpView  = () => {
        this.setState({quickIpView: false, selectedIPLogData:null})
    }

    handleTableChange = (pagination, filters, sorter) => {
        console.log("pagination", pagination);
        console.log("filter", filters);
        console.log("sorter", sorter);
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        (this.state.pagination = pager),
          this.fetchLogData({
            // results: pagination.pageSize,
            page: pagination.current,
            sortField: sorter.field,
            sortOrder: sorter.order,
            ...filters
          });
    };

    render() {
        const expandedRowRender = record => <p><b>Firewall Rule: </b>{record.firewall_rule}<br/>
                                      <b>Protocol: </b>{record.protocol}<br/>
                                      <b>Source Zone: </b>{record.source_zone}<br/>
                                      <b>Destination Zone: </b>{record.destination_zone}<br/>
                                      <b>Inbound Interface: </b>{record.inbound_interface}<br/>
                                      <b>Outbound Interface: </b>{record.outbound_interface}<br/>
                                      <b>Action: </b>{record.action}<br/>
                                      <b>Category: </b>{record.category}<br/>
                                      <b>Session End Reason: </b>{record.session_end_reason}<br/>
                                      <b>Packets Received: </b>{record.packets_received}<br/>
                                      <b>Packets Sent: </b>{record.packets_sent}<br/>
                                      <b>Time Elapsed: </b>{record.time_elapsed}<br/>
                                      <b>Source Country: </b>{record.source_country}<br/>
                                      <b>Destination Country: </b>{record.destination_country}<br/>
                                      </p>;
        return (
            <Fragment>
                <Card title={"Request From Blacklisted Address"}>
                    {this.state.blacklistSourceData ? (
                        <Fragment>
                            <List
                                style={{height:"150px", overflow:"scroll"}}
                                dataSource={this.state.blacklistSourceData}
                                renderItem={item => 
                                    <List.Item>
                                        <a id={item[0]} onClick={this.selectedIP}>{item[0]}</a> - <a id={item[1]} onClick={this.selectedIP}>{item[1]}</a>
                                    </List.Item>}
                            />
                        </Fragment>
                    ) : null}
                </Card>
                <Card title={"Request To Blacklisted Address"}>
                    {this.state.blacklistDestinationData ? (
                        <Fragment>
                            <List
                                style={{height:"150px", overflow:"scroll"}}
                                dataSource={this.state.blacklistDestinationData}
                                renderItem={item => 
                                    <List.Item>
                                        <a id={item[0]} onClick={this.selectedIP}>{item[0]}</a> - <a id={item[1]} onClick={this.selectedIP}>{item[1]}</a>
                                    </List.Item>}
                            />
                        </Fragment>
                    ) : null}
                </Card>
                <Drawer
                    closable={true}
                    width={800}
                    placement={"right"}
                    onClose={this.closeQuickIpView}
                    visible={this.state.quickIpView}>
                    {/* <QuickIpView/> */}
                    <br />
                    <Spin spinning = {this.state.loading}>
                    <Table
                        columns={this.state.columns}
                        rowKey={record => record.id}
                        expandedRowRender={expandedRowRender}
                        dataSource={this.state.selectedIPLogData}
                        pagination={this.state.pagination}
                        onChange={this.handleTableChange}
                    />
                    </Spin>
                </Drawer>
            </Fragment>
        )
    }
}
const mapStateToProps = state => {
    return {
        auth_token : state.auth.auth_token
    }
}

const mapDispatchToProps = dispatch => {
    return{
        dispatchIpSearchValueUpdate : value => dispatch(search(value))
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(BlacklistAddress)