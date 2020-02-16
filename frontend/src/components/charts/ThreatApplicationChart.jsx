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
            applicationlogColumns: [
                {
                    title: "ID",
                    dataIndex: "id",
                    key: "id",
                },
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
                        <a onClick={() => this.handleShowDestinationIpProfile(record)}>{text}</a>
                    )
                },
                {
                    title: "Source Port",
                    dataIndex: "source_port",
                    key: "source_port"
                },
                {
                    title: "Destination Port",
                    dataIndex: "destination_port",
                    key: "destination_port"
                },
                {
                    title: "Logged DateTime",
                    dataIndex: "received_datetime",
                    key: "received_datetime",
                    render: text => (new Date(text*1000+20700000).toUTCString()).replace(" GMT", "")
                }
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
        .then(res => this.setState({ 
            data: res.data.data,
            max: res.data.max
        }));
    };

    exitHandler = () => {
        if (
            document.webkitIsFullScreen ||
            document.mozFullScreen ||
            document.msFullscreenElement
        ) {
            console.log("Inside fullscreen. Doing chart stuff.");
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
            console.log("Exiting fullscreen. Doing chart stuff.");
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
            String(prevProps.ip_address) !== String(this.props.ip_address) ||
            String(prevProps.date_range[0]) !== String(this.props.date_range[0]) ||
            String(prevProps.date_range[1]) !== String(this.props.date_range[1]) ||
            String(prevProps.firewall_rule) !== String(this.props.firewall_rule) ||
            String(prevProps.application) !== String(this.props.application) ||
            String(prevProps.protocol) !== String(this.props.protocol) ||
            String(prevProps.source_zone) !== String(this.props.source_zone) ||
            String(prevProps.destination_zone) !== String(this.props.destination_zone)
        ) {
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
            console.log("unit",unit);
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
                    console.log("selected datetime", e.point.x);
                    console.log("selected datetime", new Date(e.point.x * 1000));
                }
                }
            });
        }
        this.chart.redraw();
        this.setState({
            loading: false
        });
        console.log("newSeriesdata", data);
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
        console.log("pagination", pagination);
        console.log("filter", filters);
        console.log("sorter", sorter);
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
                text: null
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