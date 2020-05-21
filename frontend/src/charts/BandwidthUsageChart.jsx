import React, { Component, Fragment } from "react";
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import { Card, Row, Spin, Select, Drawer, Table, Button } from "antd";
import { connect } from "react-redux";
import axios from "axios";
import QuickIpView from "../views/QuickIpView"
import {search} from "../actions/ipSearchAction"
import ExportJsonExcel from 'js-export-excel';
import { ROOT_URL,getDivisionFactorUnitsFromBasis, bytesToSize,timeElapsedToString } from "../utils";
require("highcharts/modules/exporting")(Highcharts);
import "./chart.css";

const FETCH_API = `${ROOT_URL}dashboard/usage/`;
const FETCH_LOG_API = `${ROOT_URL}log/detail/`;
const { Option } = Select;


class BandwidthUsageChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: [],
      unit: "MB",
      basis: "bytes",
      selectedTimeStamp: null,
      logDrawerVisible: false,
      logData: null,
      params: {},
      pagination: {},
      quickIpView: false,
      chartTitle: null,
      options: {
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
        title: {
          text: null
        },
        chart: {
          zoomType: "x",
        },
        xAxis: {
          type: "datetime",
          dateTimeLabelFormats: {
            day: "%Y-%b-%d"
          },
          crosshair:true,
          labels: {
            enabled: true
          }
        },
        yAxis:{
          crosshair:true
        },
        series: [
          {
            type: "spline",
            name: "Bytes",
            data: []
          }
        ],
        time:{
          timezoneOffset: -5*60 - 45
        },
        tooltip: {
          valueDecimals: 2
        }
      },
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
          render: text => (new Date(text*1000+20700000).toUTCString()).replace(" GMT", "")
        }
      ],
    };
  }

  handleShowSourceIpProfile(record) {
    this.props.dispatchIpSearchValueUpdate(record.source_address);
    this.setState({ quickIpView: true });
  }

  handleShowDestinationIpProfile(record) {
    this.props.dispatchIpSearchValueUpdate(record.destination_address);
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

    const { auth_token } = this.props;

    const authorization = `Token ${auth_token}`;

    let headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: authorization
    };

    let bodyFormData = new FormData();
    bodyFormData.set("basis", this.state.basis);
    bodyFormData.set("start_date", this.props.date_range[0]);
    bodyFormData.set("end_date", this.props.date_range[1]);
    bodyFormData.set("ip_address", this.props.ip_address);
    bodyFormData.set("firewall_rule", this.props.firewall_rule);
    bodyFormData.set("application", this.props.application);
    bodyFormData.set("protocol", this.props.protocol);
    bodyFormData.set("source_zone", this.props.source_zone);
    bodyFormData.set("destination_zone", this.props.destination_zone);

    axios.post(FETCH_API, bodyFormData, { headers }).then(res => {
      const response = res.data;
      const data = [];
      const v = getDivisionFactorUnitsFromBasis(response["max"],this.state.basis)
      const division_factor = v["division_factor"];
      const unit = v["unit"];
      for (var i = 0; i<response.data.length; i++){
        data.push([response.data[i][0]*1000, (response.data[i][1])/division_factor])
      }
      this.setState({
        data: data,
        unit: unit
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
      String(prevProps.defaultDate) !== String(this.props.defaultDate) ||
      String(prevProps.date_range[0]) !== String(this.props.date_range[0]) ||
      String(prevProps.date_range[1]) !== String(this.props.date_range[1]) ||
      String(prevProps.firewall_rule) !== String(this.props.firewall_rule) ||
      String(prevProps.application) !== String(this.props.application) ||
      String(prevProps.protocol) !== String(this.props.protocol) ||
      String(prevProps.source_zone) !== String(this.props.source_zone) ||
      String(prevProps.destination_zone) !== String(this.props.destination_zone) ||
      String(prevState.basis) !== String(this.state.basis)
    ) {
      {this.props.date_range[0]?this.setState({
        chartTitle:`Traffic breakdown by time from ${this.props.date_range[0]} to ${this.props.date_range[1]}`
        }):
        this.setState({
          chartTitle:`Traffic breakdown by time for ${this.props.defaultDate}`
        })
      }
      this.handleFetchData();
    }
    if (prevState.data !== this.state.data) {
      let dataSeries = this.state.data;
      dataSeries.sort(function(a, b) {
        return a[0] > b[0] ? 1 : -1;
      });
      this.updateChart(dataSeries, this.state.unit);
    }
  }

  updateChart = (data, unit) => {
    if (data != undefined) {
      this.chart.update({
        title: {
          text: this.state.chartTitle
        },
        series: [
          {
            id: this.state.basis,
            type: "areaspline",
            name: this.state.basis + "(" + unit + ")",
            data: data,
            events: {
              click: function(e) {
                const self = this.chart.component;
                self.handleChartLogView(e.point.x);
              }
            }
          }
        ],
        yAxis: {
          title: {
            text: this.state.basis
          },
          labels: {
            formatter: function() {
              return this.value + " " + unit;
            }
          }
        },
        tooltip: {
          valueSuffix: unit
        }
      });
      this.setState({
        loading: false
      });
    }
  };

  handleChartLogView = (
    selectedTimeStamp
  ) => {
    this.setState({
      selectedTimeStamp: selectedTimeStamp,
      logDrawerVisible: true
    });
    this.fetchChartLog();
  };

  fetchChartLog = (params = {}) => {
    const token = `Token ${this.props.auth_token}`;
    let headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: token
    };

    let bodyFormDataForLog = new FormData();
    bodyFormDataForLog.set("timestamp", this.state.selectedTimeStamp/1000);

    axios
      .post(FETCH_LOG_API, bodyFormDataForLog, { headers, params })
      .then(res => {
        const page = this.state.pagination;
        page.total = res.data.count;
        this.setState({
          logData: res.data.results,
          pagination: page
        });
      });
  };

  handleTableChange = (pagination, filters, sorter) => {
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    (this.state.pagination = pager),
      this.fetchChartLog({
        // results: pagination.pageSize,
        page: pagination.current,
        sortField: sorter.field,
        sortOrder: sorter.order,
        ...filters
      });
  };

  handleCloseLogDrawer = () => {
    this.setState({
      logDrawerVisible: false,
      logData: null
    });
  };

  downloadExcel = () => {
    const data = this.state.logData ? this.state.logData : '';//tabular data
     var option={};
     let dataTable = [];
     if (data) {
       for (let i in data) {
         if(data){
           let obj = {
                        'Logged datetime': (new Date(parseInt(data[i].logged_datetime)*1000+20700000).toUTCString()).replace(" GMT", ""),
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
                        'Time elapsed':data[i].sum_time_elapsed,
                        'Source country':data[i].source_country,
                        'Destination country':data[i].destination_country
           }
           dataTable.push(obj);
         }
       }
     }
        option.fileName = `Event Logs for time ${(new Date(this.state.selectedTimeStamp+20700000).toUTCString()).replace(" GMT", "")}`
     option.datas=[
       {
         sheetData:dataTable,
         sheetName:'sheet',
                sheetFilter:['Logged datetime','Source address','Destination address','Application','Bytes sent','Bytes received','Destination Port','Firewall rule','Protocol','Source zone','Destination zone','Inbound interface','Outbound interface','Action','Category','Session end reason','Packets received','Packets sent','Time elapsed','Source country','Destination country'],
                sheetHeader:['Logged datetime','Source address','Destination address','Application','Bytes sent','Bytes received','Destination Port','Firewall rule','Protocol','Source zone','Destination zone','Inbound interface','Outbound interface','Action','Category','Session end reason','Packets received','Packets sent','Time elapsed','Source country','Destination country']
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
                                      <b>Packets Received: </b>{record.sum_packets_received}<br/>
                                      <b>Packets Sent: </b>{record.sum_packets_sent}<br/>
                                      <b>Time Elapsed: </b>{timeElapsedToString(record.sum_time_elapsed)}<br/>
                                      <b>Source Country: </b>{record.source_country}<br/>
                                      <b>Destination Country: </b>{record.destination_country}<br/>
                                      </p>;
    return (
      <Fragment>
        <Card
            title={
              <Fragment>
                <div>
                  Traffic breakdown by Time
                  <Select
                    onChange={value => this.setState({ basis: value })}
                    size={"default"}
                    style={{ width: "50%", float:"right", paddingRight: 5, paddingLeft: 5 }}
                    defaultValue={"bytes"}
                  >
                    <Option key={"bytes"}>Bytes</Option>
                    <Option key={"packets"}>Packets</Option>
                    <Option key={"count"}>Count</Option>
                  </Select>
                </div>
              </Fragment>
            }
          >
          <Spin tip={"loading..."} spinning={this.state.loading}>
            <HighchartsReact
              highcharts={Highcharts}
              options={this.state.options}
              ref={"chart"}
            />
          </Spin>
          </Card>
          <Drawer
          title={`Event Logs for time ${(new Date(this.state.selectedTimeStamp+20700000).toUTCString()).replace(" GMT", "")}`}
          width={1100}
          visible={this.state.logDrawerVisible}
          closable={true}
          onClose={this.handleCloseLogDrawer}
        >
          <Button type="primary" shape="round" icon="download"
                                onClick={this.downloadExcel}>Export Excel Table
              </Button>
          {this.state.logData ? (
            <Table
              rowKey={record => record.id}
              columns={this.state.columns}
              dataSource={this.state.logData}
              expandedRowRender={expandedRowRender}
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
        ><QuickIpView />
        </Drawer>
      </Fragment>
    );
  }
}

const mapStateToProps = state => {
  return {
    auth_token: state.auth.auth_token,

    ip_address: state.filter.ip_address,

    defaultDate: state.filter.defaultDate,
    date_range: state.filter.date_range,
    firewall_rule: state.filter.firewall_rule,
    application: state.filter.application,
    protocol: state.filter.protocol,
    source_zone: state.filter.source_zone,
    destination_zone: state.filter.destination_zone
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatchIpSearchValueUpdate: value => dispatch(search(value))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(BandwidthUsageChart);
