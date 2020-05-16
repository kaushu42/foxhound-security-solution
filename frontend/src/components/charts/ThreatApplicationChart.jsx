import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {ROOT_URL, getDivisionFactorUnitsFromBasis, bytesToSize} from '../../utils'
import QuickIpView from '../../views/QuickIpView'
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import axios from 'axios'
import { search } from "../../actions/ipSearchAction";
import { Card, Spin, Table, Drawer, Select } from 'antd';
const { Option } = Select;

const FETCH_API = `${ROOT_URL}dashboard/threat/application/`;
const FETCH_APPLICATION_LOG_API = `${ROOT_URL}log/threat/application/`;

class ThreatApplicationChart extends Component{
    constructor(props){
        super(props);
        this.state = {
            data: null,
            loading: false,
            max: "",
            top_count: 5,
            unit: "events",
            selectedApplicationLogData: [],
            selectedApplicationLogDrawerVisible: false,
            selectedApplication: null,
            selectedTimeStamp: null,
            params: {},
            pagination: {},
            chartTitle: null,
            applicationlogColumns: [
                {
                    title:"Source Address",
                    dataIndex:"source_address",
                    key:"source_address",
                    render: (text, record) => (
                        <a onClick={() => this.handleShowSourceIpProfile(record)}>{text}</a>
                    )
                },
                {
                    title:"Destination Address",
                    dataIndex:"destination_address",
                    key:"destination_address",
                    render: (text, record) => (
                        <a onClick={() => this.handleShowDestinationIpProfile(record)}>{text}</a>
                    )
                },
                {
                    title:"Application",
                    dataIndex:"application",
                    key:"application"
                },
                {
                    title:"Destination Port",
                    dataIndex:"destination_port",
                    key:"destination_port"
                },
                {
                    title:"Severity",
                    dataIndex:"severity",
                    key:"severity"
                },
                {
                    title:"Threat Content Type",
                    dataIndex:"threat_content_type",
                    key:"threat_content_type"
                },
                {
                    title:"Logged Date",
                    dataIndex:"received_datetime",
                    key:"received_datetime",
                    render: text => (new Date(parseInt(text)*1000+20700000).toUTCString()).replace(" GMT", "")
                },
            ],
            quickIpView: false
        }
    }

    handleShowSourceIpProfile(record) {
        this.props.dispatchIpSearchValueUpdate(record.source_ip);
        this.setState({ quickIpView: true });
    }

    handleShowDestinationIpProfile(record) {
        this.props.dispatchIpSearchValueUpdate(record.destination_ip);
        this.setState({ quickIpView: true });
    }

    closeQuickIpView = () => {
        this.setState({ quickIpView: false });
    };

    componentDidMount() {
        this.handleFetchData();
        this.chart = this.refs.chart.chart;
        this.chart.component = this;
        if (document.addEventListener) {
            document.addEventListener(
            "webkitfullscreenchange",
            this.exitHandler,
            false
            );
            document.addEventListener("mozfullscreenchange", this.exitHandler, false);
            document.addEventListener("fullscreenchange", this.exitHandler, false);
            document.addEventListener("MSFullscreenChange", this.exitHandler, false);
        }
    }

    handleFetchData = () => {
        this.setState({
            loading: true
        });

        const token = `Token ${this.props.auth_token}`;

        let headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: token
        };

        let bodyFormData = new FormData();
        bodyFormData.set("country", this.props.selectedCountry);
        bodyFormData.set("topcount", this.state.top_count);
        bodyFormData.set("basis", "count");
        bodyFormData.set("start_date", this.props.date_range[0]);
        bodyFormData.set("end_date", this.props.date_range[1]);
        bodyFormData.set("firewall_rule", this.props.firewall_rule);
        bodyFormData.set("application", this.props.application);
        bodyFormData.set("protocol", this.props.protocol);
        bodyFormData.set("source_zone", this.props.source_zone);
        bodyFormData.set("destination_zone", this.props.destination_zone);

        axios.post(FETCH_API, bodyFormData, { headers })
        .then(res => {
            this.setState({
                data: res.data.data,
                max: res.data.max
            })
        });
    };

    exitHandler = () => {
        if (
            document.webkitIsFullScreen ||
            document.mozFullScreen ||
            document.msFullscreenElement
        ) {
            this.chart = this.refs.chart.chart;
            this.chart.update({
            chart: {
                height: null
            }
            });
        }

        if (
            !document.webkitIsFullScreen &&
            !document.mozFullScreen &&
            !document.msFullscreenElement
        ) {
            this.chart = this.refs.chart.chart;
            this.chart.update({
            chart: {
                height: "400px"
            }
            });
        }
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (
            String(prevProps.selectedCountry) !== String(this.props.selectedCountry) ||
            String(prevState.top_count) !== String(this.state.top_count) ||
            String(prevProps.defaultDate) !== String(this.props.defaultDate) ||
            String(prevProps.date_range[0]) !== String(this.props.date_range[0]) ||
            String(prevProps.date_range[1]) !== String(this.props.date_range[1]) ||
            String(prevProps.firewall_rule) !== String(this.props.firewall_rule) ||
            String(prevProps.application) !== String(this.props.application) ||
            String(prevProps.protocol) !== String(this.props.protocol) ||
            String(prevProps.source_zone) !== String(this.props.source_zone) ||
            String(prevProps.destination_zone) !== String(this.props.destination_zone)
        ) {
            {this.props.date_range[0]?this.setState({
                chartTitle:`Threat Application Line Chart from ${this.props.date_range[0]} to ${this.props.date_range[1]}`
                }):
                this.setState({
                    chartTitle:`Threat Application Line Chart for ${this.props.defaultDate}`
                })
            }
            this.handleFetchData();
        }
        if (prevState.data !== this.state.data) {
            let dataSeries = [];
            const v = getDivisionFactorUnitsFromBasis(this.state.max, "count")
            const division_factor = v["division_factor"];
            const unit = v["unit"];
            this.setState({
                unit: unit
            });
            Object.keys(this.state.data).forEach(key => {
                let key_data = this.state.data[key].map(e => [e[0] * 1000, e[1] / division_factor]);
                key_data.sort(function(a, b) {
                    return a[0] > b[0] ? 1 : -1;
                });
                let tempSeries = {
                    name: key,
                    type: "spline",
                    data: key_data
                };
                dataSeries.push(tempSeries);
            });
            this.updateChart(dataSeries,unit);
        }
    }

    updateChart = (data,unit) => {
        this.chart.update({
        title: {
            text: this.state.chartTitle
        },
        tooltip: {
            valueSuffix: unit,
            shared: true,
            followPointer: true,
            snap: 1,
            valueDecimals: 2,
            crosshairs: [
            {
                snap: false,
                zIndex: 10
            }
            ]
        },
        yAxis: [
            {
            min: 0,
            minorTickInterval: 0.1,
            lineWidth: 0,
            offset: 0,
            showLastLabel: true,
            title: {
                text: this.state.basis
            },
            labels: {
                formatter: function() {
                return this.value + " " + unit;
                }
            },
            }
        ]    
        });
        this.chart.redraw();
        const seriesLength = this.chart.series.length;
        for (let i = seriesLength - 1; i > -1; i--) {
            this.chart.series[i].remove();
        }
        this.chart.redraw();
        
        for (let i = 0; i < data.length; i++) {
            this.chart.addSeries({
                name: data[i].name,
                type: "spline",
                data: data[i].data,
                showInNavigator: true,
                events: {
                click: function(e) {
                    const self = this.chart.component;
                    self.handleApplicationLineChartLogView(e.point.x, this.name);
                }
                }
            });
        }
        this.chart.redraw();
        this.setState({
            loading: false
        });
    };

    handleApplicationLineChartLogView = (selectedTimeStamp, selectedApplication) => {
        this.setState({
            selectedApplication: selectedApplication,
            selectedTimeStamp: selectedTimeStamp,
            selectedApplicationLogDrawerVisible: true
        });
        this.fetchApplicationLineChartLog();
    };

    fetchApplicationLineChartLog = (params = {}) => {
        const token = `Token ${this.props.auth_token}`;
        let headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: token
        };

        let bodyFormDataForLog = new FormData();
        bodyFormDataForLog.set("application", this.state.selectedApplication);
        bodyFormDataForLog.set("country", this.props.selectedCountry);
        bodyFormDataForLog.set("timestamp", this.state.selectedTimeStamp/1000);

        axios.post(FETCH_APPLICATION_LOG_API, bodyFormDataForLog, { headers, params })
        .then(res => {
            const page = this.state.pagination;
            page.total = res.data.count;
            this.setState({
                selectedApplicationLogData: res.data.results,
                pagination: page
            });
        });
    };

    handleTableChange = (pagination, filters, sorter) => {
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        (this.state.pagination = pager),
            this.fetchApplicationLineChartLog({
            // results: pagination.pageSize,
            page: pagination.current,
            sortField: sorter.field,
            sortOrder: sorter.order,
            ...filters
        });
    };

    handleCloseApplicationLogDrawer = () => {
        this.setState({
            selectedApplicationLogDrawerVisible: false
        });
    };

    render(){
        const options = {
            plotOptions: {
                arearange: {
                showInLegend: true,
                stickyTracking: true,
                trackByArea: false,
                dataGrouping: {
                    enabled: false
                }
                },
                areaspline: {
                showInLegend: true,
                stickyTracking: true,
                trackByArea: false,
                marker: {
                    enabled: false
                },
                softThreshold: false,
                connectNulls: false,
                dataGrouping: {
                    enabled: false
                }
                },
                series: {
                stickyTracking: false,
                trackByArea: false,
                turboThreshold: 0,
                events: {
                    legendItemClick: () => {
                    return true;
                    }
                },
                dataGrouping: {
                    enabled: false
                }
                }
            },
            xAxis: {
                dateTimeLabelFormats: {
                day: "%Y-%b-%d"
                },
                crosshair:true,
                ordinal: false,
                followPointer: true,
                type: "datetime",
        
                showLastLabel: true,
                tickWidth: 0,
                labels: {
                enabled: true
                }
            },
            yAxis:{
                crosshair:true
            },
            tooltip:{
            },
            time:{
                timezoneOffset: -5*60 - 45
            },
            chart: {
                zoomType: "x"
            },
            title: {
                text: this.state.chartTitle
            },
            responsive: {
                rules: [
                {
                    condition: {
                    maxWidth: 500
                    },
                    chartOptions: {
                    legend: {
                        layout: "horizontal",
                        align: "bottom",
                        verticalAlign: "middle"
                    }
                    }
                }
                ]
            }
        };
        const expandedRowRender = record => <p>
                                      <b>Protocol: </b>{record.ip_protocol}<br/>
                                      <b>Source Zone: </b>{record.source_zone}<br/>
                                      <b>Destination Zone: </b>{record.destination_zone}<br/>
                                      <b>Inbound Interface: </b>{record.inbound_interface}<br/>
                                      <b>Outbound Interface: </b>{record.outbound_interface}<br/>
                                      <b>Action: </b>{record.action}<br/>
                                      <b>Category: </b>{record.category}<br/>
                                      <b>Direction: </b>{record.direction}<br/>
                                      <b>Threat Content Name: </b>{record.threat_content_name}<br/>
                                      <b>Packets Received: </b>{record.packets_received}<br/>
                                      <b>Packets Sent: </b>{record.packets_sent}<br/>
                                      <b>Time Elapsed: </b>{record.time_elapsed}<br/>
                                      <b>Source Country: </b>{record.source_country}<br/>
                                      <b>Destination Country: </b>{record.destination_country}<br/>
                                      <b>Log Name: </b>{record.log_name}<br/>
                                      </p>;
        return(
            <Fragment>
                <Card
                    title ={
                        <Fragment>
                            Application Used (Count)
                            <Select
                                onChange={value => this.setState({ top_count: value })}
                                size={"default"}
                                style={{ width: "35%",float:"right", paddingRight: 10, paddingLeft: 10 }}
                                defaultValue={"5"}
                            >
                                <Option key="5">Top 5</Option>
                                <Option key="10">Top 10</Option>
                                <Option key="15">Top 15</Option>
                                <Option key="0">All</Option>
                            </Select>
                        </Fragment>
                    }
                >
                    <Spin spinning={this.state.loading}>
                        <HighchartsReact
                            highcharts={Highcharts}
                            allowChartUpdate={false}
                            ref={"chart"}
                            options={options}
                        />
                    </Spin>
                </Card>
                <Drawer
                    title={`Event Logs for Application ${
                        this.state.selectedApplication
                    } in time ${(new Date(this.state.selectedTimeStamp+20700000).toUTCString()).replace(" GMT", "")}`}
                    width={1100}
                    visible={this.state.selectedApplicationLogDrawerVisible}
                    closable={true}
                    onClose={this.handleCloseApplicationLogDrawer}
                >
                    {this.state.selectedApplicationLogData ? (
                        <Table
                        rowKey={record => record.id}
                        columns={this.state.applicationlogColumns}
                        expandedRowRender={expandedRowRender}
                        dataSource={this.state.selectedApplicationLogData}
                        pagination={this.state.pagination}
                        onChange={this.handleTableChange}
                        />
                    ) : null}
                </Drawer>
                <Drawer
                    closable={true}
                    width={800}
                    placement={"right"}
                    onClose={this.closeQuickIpView}
                    visible={this.state.quickIpView}
                >
                    <QuickIpView />
                </Drawer>
            </Fragment>
        )
    }
}

ThreatApplicationChart.defaultProps = {
    selectedCountry: ""
}

const mapStateToProps = state => {
    return{
        auth_token: state.auth.auth_token,
        defaultDate: state.filter.defaultDate,
        date_range: state.filter.date_range,
        firewall_rule: state.filter.firewall_rule,
        application: state.filter.application,
        protocol: state.filter.protocol,
        source_zone: state.filter.source_zone,
        destination_zone: state.filter.destination_zone
    }
}

const mapDispatchToProps = dispatch => {
    return {
        dispatchIpSearchValueUpdate: value => dispatch(search(value))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ThreatApplicationChart)