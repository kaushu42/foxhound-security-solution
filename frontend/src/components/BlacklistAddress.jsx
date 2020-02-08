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
              title: "Id",
              dataIndex: "id",
              key: "id"
            },
            {
              title: "Source Address",
              dataIndex: "source_ip",
              key: "source_ip",
            },
            {
              title: "Destination Address",
              dataIndex: "destination_ip",
              key: "destination_ip",
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
              render: text => (new Date(text*1000+20700000).toUTCString()).replace(" GMT", "") //moment(text).format("YYYY-MM-DD, HH:MM:SS")
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