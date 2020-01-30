import React, { Component, Fragment } from "react";
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import { Card, Row, Spin, Select } from "antd";
import { connect } from "react-redux";
import axios from "axios";
import { ROOT_URL,getDivisionFactorUnitsFromBasis } from "../utils";
require("highcharts/modules/exporting")(Highcharts);
import "./chart.css";
const FETCH_API = `${ROOT_URL}dashboard/usage/`;
const { Option } = Select;


class BandwidthUsageChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: [],
      unit: "MB",
      basis: "bytes",
      options: {
        title: {
          text: null
        },
        chart: {
          zoomType: "x",
          events: {
            click: function(e) {
              console.log(
                Highcharts.dateFormat("%Y-%m-%d %H:%M", e.xAxis[0].value),
                e.yAxis[0].value
              );
            }
          }
        },
        xAxis: {
          type: "datetime",
          dateTimeLabelFormats: {
            day: "%Y-%b-%d"
          }
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
      }
    };
  }

  componentDidMount() {
    this.handleFetchData();
    this.chart = this.refs.chart.chart;
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
            data: data
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

  render() {
    return (
      <Fragment>
        <Card
            title={
              <Fragment>
                <div>
                  <b>Time Series Usages Chart</b>
                  <br></br>
                  <Select
                    onChange={value => this.setState({ basis: value })}
                    size={"default"}
                    style={{ width: "50%", float:"right", paddingRight: 10, paddingLeft: 10 }}
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
export default connect(mapStateToProps, null)(BandwidthUsageChart);
