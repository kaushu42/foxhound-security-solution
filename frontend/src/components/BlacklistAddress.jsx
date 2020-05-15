import React, {Component, Fragment} from 'react';
import {connect} from "react-redux";
import {axiosHeader, ROOT_URL, bytesToSize} from "../utils";
import axios from "axios";
import {Card, List, Drawer, Table, Spin, Button,Row, Col} from "antd";
import QuickIpView from "../views/QuickIpView"
import ExportJsonExcel from 'js-export-excel';
import {search} from "../actions/ipSearchAction";
import {contentLayout} from "../utils";


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
              dataIndex: "source_address",
              key: "source_address",
              render: (text, record) => (
                <a onClick={() => this.handleShowSourceIpProfile(record)}>{text}</a>
              )
            },
            {
              title: "Destination Address",
              dataIndex: "destination_address",
              key: "destination_address",
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
              dataIndex: "sum_bytes_sent",
              key: "sum_bytes_sent",
              render: (text, record) => bytesToSize(text)
            },
            {
              title: "Bytes Received",
              dataIndex: "sum_bytes_received",
              key: "sum_bytes_received",
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

    downloadExcel = () => {
        const data = this.state.selectedIPLogData ? this.state.selectedIPLogData : '';//tabular data
         var option={};
         let dataTable = [];
         if (data) {
           for (let i in data) {
             if(data){
               let obj = {
                            'Source address': data[i].source_address,
                            'Destination address': data[i].destination_address,
                            'Application':data[i].application,
                            'Bytes sent':data[i].sum_bytes_sent,
                            'Bytes received':data[i].sum_bytes_received,
                            'Destination Port':data[i].destination_port,
                            'Firewall rule':data[i].firewall_rule,
                            'Protocol':data[i].protocol,
                            'Source zone':data[i].source_zone,
                            'Destination zone':data[i].destination_zone,
                            'Inbound interface':data[i].inbound_interface,
                            'Outbound interface':data[i].outbound_interface,
                            'Action':data[i].action,
                            'Category':data[i].category,
                            'Session end reason':data[i].session_end_reason,
                            'Packets received':data[i].sum_packets_received,
                            'Packets sent':data[i].sum_packets_sent,
                            'Time elapsed':data[i].time_elapsed,
                            'Source country':data[i].source_country,
                            'Destination country':data[i].destination_country
               }
               dataTable.push(obj);
             }
           }
         }
            option.fileName = `Blacklisted IP Log for ${this.state.selectedIPAddress}`
         option.datas=[
           {
             sheetData:dataTable,
             sheetName:'sheet',
                    sheetFilter:['Source address','Destination address','Application','Bytes sent','Bytes received','Destination Port','Firewall rule','Protocol','Source zone','Destination zone','Inbound interface','Outbound interface','Action','Category','Session end reason','Packets received','Packets sent','Time elapsed','Source country','Destination country'],
                    sheetHeader:['Source address','Destination address','Application','Bytes sent','Bytes received','Destination Port','Firewall rule','Protocol','Source zone','Destination zone','Inbound interface','Outbound interface','Action','Category','Session end reason','Packets received','Packets sent','Time elapsed','Source country','Destination country']
           }
         ];
        
         var toExcel = new ExportJsonExcel(option); 
         toExcel.saveExcel();        
      }

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
                <Row>
                  <Col xs={24} sm={24} md={24} lg={24} xl={12}>
                    <Card title={"Response From Blacklisted Address"}>
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
                  </Col>
                    <Col xs={24} sm={24} md={24} lg={24} xl={12} >
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
                    </Col>
                    </Row>
                <Drawer
                    closable={true}
                    width={800}
                    placement={"right"}
                    onClose={this.closeQuickIpView}
                    visible={this.state.quickIpView}>
                    {/* <QuickIpView/> */}
                    <br />
                    <Spin spinning = {this.state.loading}>
                    <Button type="primary" shape="round" icon="download"
                                onClick={this.downloadExcel}>Export Excel Table
                    </Button>
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