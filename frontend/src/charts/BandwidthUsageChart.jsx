import React, { Component, Fragment } from "react";
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import { Card, Row, Spin, Select, Drawer, Table } from "antd";
import { connect } from "react-redux";
import axios from "axios";
import QuickIpView from "../views/QuickIpView"
import {search} from "../actions/ipSearchAction"
import { ROOT_URL,getDivisionFactorUnitsFromBasis, bytesToSize } from "../utils";
require("highcharts/modules/exporting")(Highcharts);
import "./chart.css";

const FETCH_API = `${ROOT_URL}dashboard/usage/`;
const FETCH_LOG_API = `${ROOT_URL}log/application/`;
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
            <a onClick={() => this.handleShowDestinationIpProfile(record)}>
              {text}
            </a>
          )
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
    };
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
      console.log("api data", response.data);
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
      String(prevProps.ip_address) !== String(this.props.ip_address) ||
      String(prevProps.date_range[0]) !== String(this.props.date_range[0]) ||
      String(prevProps.date_range[1]) !== String(this.props.date_range[1]) ||
      String(prevProps.firewall_rule) !== String(this.props.firewall_rule) ||
      String(prevProps.application) !== String(this.props.application) ||
      String(prevProps.protocol) !== String(this.props.protocol) ||
      String(prevProps.source_zone) !== String(this.props.source_zone) ||
      String(prevProps.destination_zone) !== String(this.props.destination_zone) ||
      String(prevState.basis) !== String(this.state.basis)
    ) {
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
    bodyFormDataForLog.set("application", "ssl");
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
    console.log("pagination", pagination);
    console.log("filter", filters);
    console.log("sorter", sorter);
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

  render() {
    return (
      <Fragment>
        <Card
            title={
              <Fragment>
                <div>
                  Time Series Usage
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
          {this.state.logData ? (
            <Table
              rowKey={record => record.id}
              columns={this.state.columns}
              dataSource={this.state.logData}
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
