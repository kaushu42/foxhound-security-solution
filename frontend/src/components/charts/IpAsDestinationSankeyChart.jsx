import React, {Component, Fragment} from "react";
import Highcharts from "highcharts";
import Chart from "../../charts/Chart";
import {bytesToSize, ROOT_URL} from "../../utils";
require('highcharts/modules/sankey')(Highcharts);
require("highcharts/modules/exporting")(Highcharts);
import axios from 'axios';
import {connect} from "react-redux";
import mapdata from "../../charts/mapdata";
import {Card, Row, Spin, Drawer, Table, Select} from "antd";
import HighchartsReact from "highcharts-react-official";
import moment from "moment";
import {getDivisionFactorUnitsFromBasis} from '../../utils'

const FETCH_API = `${ROOT_URL}profile/sankey/`;
const FETCH_SANKEY_LOG_API = `${ROOT_URL}log/sankey/`;

class IpAsDestinationSankeyChart extends Component {
    constructor(props){
        super(props);
        this.state = {
            params:{},
            pagination:{},
            data : [],
            unit: "",
            loading : true,
            selectedSourceIp : null, 
            selectedDestinationIp : null,
            selectedSourceToDestinationLogDrawerVisible : false,
            selectedSourceToDestinationLogData : [],
            basis: "bytes",
            chartTitle: null,
            options : {
                chart : {
                    margin : 50,

                },
                title: {
                    text: null
                },
                tooltip: {
                    formatter: function () {
                        const self = this.series.chart.component;
                        return self.handleDataUnit(this.point);
                    }
                },
                series: [
                    {
                        keys: ['from', 'to', 'weight'],
                        data: [],
                        type: "sankey",
                        connectNulls : true,
                        events: {
                            legendItemClick: () => {
                                return true;
                            }
                        },
                    }
                ]
            },
            logColumns : [
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
    }

    handleDataUnit = (point) => {
        var tooltipValue
        {(point.fromNode || point.toNode)?
            tooltipValue = point.fromNode.name + "→" + point.toNode.name + ": " + point.weight  + " " +this.state.unit
            : tooltipValue = point.name}
        return tooltipValue
    }
    
    componentDidMount = () => {
        this.handleFetchData();
        this.chart = this.refs.chart.chart;
        this.chart.component = this;
        if (document.addEventListener) {
            document.addEventListener('webkitfullscreenchange', this.exitHandler, false);
            document.addEventListener('mozfullscreenchange', this.exitHandler, false);
            document.addEventListener('fullscreenchange', this.exitHandler, false);
            document.addEventListener('MSFullscreenChange', this.exitHandler, false);
        }
    }

    handleFetchData = () => {

        this.setState({
            loading : true
        });


        const token = `Token ${this.props.auth_token}`;
        let headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Authorization" : token
        };

        var bodyFormData = new FormData();
        bodyFormData.set('ip', this.props.ip_address);
        bodyFormData.set('start_date', this.props.date_range[0]);
        bodyFormData.set('end_date', this.props.date_range[1]);
        bodyFormData.set('firewall_rule', this.props.firewall_rule);
        bodyFormData.set('application', this.props.application);
        bodyFormData.set('protocol', this.props.protocol);
        bodyFormData.set('source_zone', this.props.source_zone);
        bodyFormData.set('destination_zone', this.props.destination_zone);
        bodyFormData.set('basis', this.state.basis);

        axios.post(FETCH_API,bodyFormData,{headers}).
        then(res => {
            const response = res.data.dest;
            var maxValue = 0
            for (var i = 0; i<response.length; i++){
                if (maxValue <  response[i][2]){
                    maxValue = response[i][2]
                }
            }
            const data = []
            console.log('api data',response);
            const v = getDivisionFactorUnitsFromBasis(maxValue,this.state.basis)
            const division_factor = v["division_factor"];
            const unit = v["unit"];
            var i;
            for ( i = 0; i<response.length; i++){
                data.push([response[i][0],response[i][1],parseInt((response[i][2])/division_factor)])
            }
            this.setState({
                data : data,
                unit: unit
            })
        });

    }
    exitHandler = () => {
        if (document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement) {
            console.log('Inside fullscreen. Doing chart stuff.');
            this.chart = this.refs.chart.chart;
            this.chart.update({
                chart:{
                    height: null
                }
            })
        }

        if (!document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
            console.log('Exiting fullscreen. Doing chart stuff.');
            this.chart = this.refs.chart.chart;
            this.chart.update({
                chart:{
                    height:'400px'
                }
            })
        }
    }


    componentDidUpdate(prevProps, prevState, snapshot) {
        if (
            (String(prevProps.ip_address)!==String(this.props.ip_address)) ||
            (String(prevProps.date_range[0])!==String(this.props.date_range[0])) ||
            (String(prevProps.date_range[1])!==String(this.props.date_range[1])) ||
            (String(prevProps.firewall_rule)!==String(this.props.firewall_rule)) ||
            (String(prevProps.application)!==String(this.props.application)) ||
            (String(prevProps.protocol)!==String(this.props.protocol)) ||
            (String(prevProps.source_zone)!==String(this.props.source_zone)) ||
            (String(prevProps.destination_zone)!==String(this.props.destination_zone)) ||
            (String(prevState.basis)!==String(this.state.basis))
        ){
            if(this.props.ip_address != ""){
                {this.props.date_range[0]?this.setState({
                    chartTitle:`Sankey Chart for IP as Destination from ${this.props.date_range[0]} to ${this.props.date_range[1]}`
                    }):
                    this.setState({
                        chartTitle:`Sankey Chart for IP as Destination for ${this.props.defaultDate}`
                    })
                }
              }
              else{
                  this.setState({
                      chartTitle:null
                  })
              }
            this.handleFetchData();
        }
        if(prevState.data!==this.state.data){
            this.updateChart();
        }
    }


    updateChart = () => {
        const data = this.state.data;
        data.sort(function(a, b) {
            return a[2] < b[2] ? 1 : -1;
        });
        let d = [];
        for(var i=0;i<10;i++){
            d.push(data[i]);
        }

        this.chart.update({
            title: {
                text: this.state.chartTitle
              },
            series: [
                {
                    keys: ['from', 'to', 'weight'],
                    type: "sankey",
                    data: d,
                    events: {
                        click: function (e) {
                            const self = this.chart.component;
                            self.handleSankeyChartLogView(e.point.from, e.point.to);
                        }
                    }
                }
            ]
        });
        this.setState({
            loading : false
        });
    }

    handleSankeyChartLogView = (source_ip, destination_ip) => {
        this.setState({
            selectedSourceIp : source_ip,
            selectedDestinationIp : destination_ip,
            selectedSourceToDestinationLogDrawerVisible : true
        })
        // console.log(this.state.selectedSourceIp, this.state.selectedDestinationIp, this.state.selectedSourceToDestinationLogDrawerVisible)
        this.fetchSankeyChartLog();
    }

    fetchSankeyChartLog = (params = {}) => {
        const token = `Token ${this.props.auth_token}`;
        let headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Authorization" : token
        };
        let bodyFormDataForLog = new FormData();
        bodyFormDataForLog.set("source_ip", this.state.selectedSourceIp);
        bodyFormDataForLog.set("destination_ip", this.state.selectedDestinationIp);

        axios.post(FETCH_SANKEY_LOG_API,bodyFormDataForLog,{headers, params})
            .then(res => {
                const page = this.state.pagination;
                page.total  = res.data.count;
                this.setState({
                    selectedSourceToDestinationLogData:res.data.results,
                    pagination: page
                })
            });

        console.log("fetched log data for selected application", this.state.selectedSourceToDestinationLogData)
    }

    handleTableChange = (pagination, filters, sorter) => {
        console.log('pagination',pagination);
        console.log('filter',filters)
        console.log('sorter',sorter)
        const pager = { ...this.state.pagination};
        pager.current = pagination.current;
        this.state.pagination = pager,
        this.fetchSankeyChartLog({
            // results: pagination.pageSize,
            page: pagination.current,
            sortField: sorter.field,
            sortOrder: sorter.order,
            ...filters
        });
    };

    handleCloseLogDrawer = () => {
        this.setState({
            selectedSourceToDestinationLogDrawerVisible:false,
            selectedSourceToDestinationLogData : [],
        }
    )}

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
                <Card
                    title={
                    <Fragment>
                        <div>
                        Connections of IP(as Destination)
                        <Select
                            onChange={value => this.setState({ basis: value })}
                            size={"default"}
                            style={{ width: "35%", float:"right", paddingRight: 5, paddingLeft: 5 }}
                            defaultValue={"bytes"}
                        >
                            <Select.Option key={"bytes"}>Bytes</Select.Option>
                            <Select.Option key={"packets"}>Packets</Select.Option>
                            <Select.Option key={"count"}>Count</Select.Option>
                        </Select>
                        </div>
                    </Fragment>
                    }
                >
                    <Spin tip="Loading..." spinning={this.state.loading}>
                        <HighchartsReact
                            allowChartUpdate={false}
                            highcharts={Highcharts}
                            ref = {'chart'}
                            options = {this.state.options}
                        />
                    </Spin>
                </Card>
                <Drawer
                    title={`Logs for ${this.state.selectedSourceIp} to ${this.state.selectedDestinationIp}`}
                    width={1100}
                    visible={this.state.selectedSourceToDestinationLogDrawerVisible}
                    closable={true}
                    onClose={this.handleCloseLogDrawer}
                >
                    {
                        this.state.selectedSourceToDestinationLogData ? (
                            <Table
                            rowKey={record => record.id}
                            columns={this.state.logColumns}
                            expandedRowRender={expandedRowRender}
                            dataSource={this.state.selectedSourceToDestinationLogData}
                            pagination={this.state.pagination}
                            onChange={this.handleTableChange}
                            />
                        ) : null
                    }
                </Drawer>
            </Fragment>
        )
    }
}


const mapStateToProps = state => {
    return {
        auth_token : state.auth.auth_token,

        ip_address : state.ipSearchBar.ip_address,
        defaultDate: state.filter.defaultDate,
        date_range : state.filter.date_range,
        firewall_rule : state.filter.firewall_rule,
        application : state.filter.application,
        protocol : state.filter.protocol,
        source_zone : state.filter.source_zone,
        destination_zone : state.filter.destination_zone
    }
}

export default connect(mapStateToProps,null)(IpAsDestinationSankeyChart);


