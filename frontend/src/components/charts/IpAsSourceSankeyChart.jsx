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

const FETCH_API = `${ROOT_URL}profile/sankey/`;
const FETCH_SANKEY_LOG_API = `${ROOT_URL}log/sankey/`;

class IpAsSourceSankeyChart extends Component {
    constructor(props){
        super(props);
        this.state = {
            params:{},
            pagination:{},
            data : [],
            loading : true,
            selectedSourceIp : null, 
            selectedDestinationIp : null,
            selectedSourceToDestinationLogDrawerVisible : false,
            selectedSourceToDestinationLogData : [],
            basis:"bytes",
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
                        return self.handleDataUnit(this.point.weight);
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
                    title: 'Id',
                    dataIndex: 'id',
                    key: 'id',
                },
                {
                    title: 'Application',
                    dataIndex: 'application.name',
                    key: 'application.name',
                    // render : (text,record) => bytesToSize(text)
                },
                {
                    title: 'Bytes Sent',
                    dataIndex: 'bytes_sent',
                    key: 'bytes_sent',
                    render : (text,record) => bytesToSize(text)
                },
                {
                    title: 'Bytes Received',
                    dataIndex: 'bytes_received',
                    key: 'bytes_received',
                    render : (text,record) => bytesToSize(text)

                },
                {
                    title: 'Logged DateTime',
                    dataIndex: 'logged_datetime',
                    key: 'logged_datetime',
                    // render: text => moment(text).format("YYYY-MM-DD, HH:MM:SS")
                    render: text => (new Date(text).toUTCString()).replace(" GMT", "")
                },
              ],

        }
    }

    handleDataUnit = (value) => {
        let tooltipValue = bytesToSize(value);
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
            const response = res.data;
            console.log('api data',response);
            this.setState({
                data : response
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
            this.handleFetchData();
        }
        if(prevState.data!==this.state.data){
            this.updateChart();
        }
    }


    updateChart = () => {
        const data = this.state.data.src;
        data.sort(function(a, b) {
            return a[2] < b[2] ? 1 : -1;
        });
        let d = [];
        for(var i=0;i<10;i++){
            d.push(data[i]);
        }

        this.chart.update({
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
                    },
                },
            ],
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
        return (
            <Fragment>
                <Card
                    title={
                    <Fragment>
                    <div>
                    <b>Connection of IP as Source</b>
                    <br></br>
                        <Select
                            onChange={value => this.setState({ basis: value })}
                            size={"default"}
                            style={{ width: "50%", float:"right", paddingRight: 10, paddingLeft: 10 }}
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

        date_range : state.filter.date_range,
        firewall_rule : state.filter.firewall_rule,
        application : state.filter.application,
        protocol : state.filter.protocol,
        source_zone : state.filter.source_zone,
        destination_zone : state.filter.destination_zone
    }
}

export default connect(mapStateToProps,null)(IpAsSourceSankeyChart);


