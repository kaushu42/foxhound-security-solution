import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import "../../charts/chart.css";
import { Card, Spin, Select } from "antd";
import moment from "moment";
import NoDataToDisplay from "highcharts/modules/no-data-to-display";
import { ipUsageDataService } from "../../services/ipUsageService";
import {getDivisionFactorUnitsFromBasis} from '../../utils'
NoDataToDisplay(Highcharts);

class IpUsageTimeSeriesChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: [],
      unit: "",
      basis: "bytes",
      options: {
        title: {
          text: null
        },
        chart: {
          zoomType: "x"
        },
        xAxis: {
          type: "datetime",
          dateTimeLabelFormats: {
            day: "%Y-%b-%d"
          }
        },
        yAxis: {
          labels: {
            formatter: function() {
              return this.value + " MB";
            }
          }
        },
        series: [
          {
            type: "line",
            name: "Bytes Received",
            data: []
          }
        ],
        time:{
          timezoneOffset: -5*60 - 45
        },
        tooltip: {
          valueDecimals: 2
        },
      }
    };
  }

  componentDidMount() {
    this.handleFetchData();
    this.chart = this.refs.chart.chart;
    if (document.addEventListener) {
      document.addEventListener("webkitfullscreenchange", this.exitHandler, false);
      document.addEventListener("mozfullscreenchange", this.exitHandler, false);
      document.addEventListener("fullscreenchange", this.exitHandler, false);
      document.addEventListener("MSFullscreenChange", this.exitHandler, false);
    }
  }

  handleFetchData = () => {
    this.setState({
      loading: true
    });

    const { auth_token, ip_address } = this.props;
    ipUsageDataService(auth_token, ip_address, this.state.basis, this.props).then(res => {
      console.log("fetching current data for ip", ip_address);
      const response = res.data;
      console.log('response', response.data)
      const data = [];
      const v = getDivisionFactorUnitsFromBasis(response["max"],this.state.basis)
      const division_factor = v["division_factor"];
      const unit = v["unit"];
      for (var i = 0; i<response.data.length; i++){
        data.push([response.data[i][0]*1000, (response.data[i][1])/division_factor])
      }
      console.log('data', data)
      this.setState({
        data: data,
        unit: unit
      })
    });
  };

  exitHandler = () => {
    if (document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement) {
      console.log("Inside fullscreen. Doing chart stuff.");
      this.chart = this.refs.chart.chart;
      this.chart.update({
        chart: {
          height: null
        }
      });
    }

    if (!document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
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
      let dataSeries = this.state.data
      console.log("Bandwidth chart dataseries", dataSeries);
      this.updateChart(dataSeries, this.state.unit);
    }
  }
  updateChart = (data, unit) => {
    let bytesReceived = this.state.data;
    if (bytesReceived.length == 0) {
      Highcharts.setOptions({
        lang: {
          noData: "No data is available in the chart"
        }
      });
      this.chart.update({
        series: []
      });
    }
    bytesReceived.sort(function(a, b) {
      return a[0] > b[0] ? 1 : -1;
    });
    console.log("******BYTES RECEIVED*******", bytesReceived)
    this.chart.update({
      title: {
        text: null
      },
      series: [
        {
          type: "spline",
          name : this.state.basis + '(' + unit + ')',
          data: data
        }
      ],
      yAxis:{
        title:{
            text: this.state.basis
          },
          labels :{
              formatter: function () {
                  return this.value + " " + unit;
              }
          }
      },
      tooltip: {
          valueSuffix: unit
      },
    });
    this.setState({
      loading: false
    });
  };

  render() {
    console.log("loading", this.state.loading);
    return (
      <Fragment>
        <Card
            title={
              <Fragment>
              <div>
              {`Bandwidth Usage for ${this.state.basis} of ${this.props.ip_address}`}
                  <Select
                    onChange={value => this.setState({ basis: value })}
                    size={"default"}
                    style={{ width: "35%", float:"right", paddingRight: 10, paddingLeft: 5 }}
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
            <HighchartsReact highcharts={Highcharts} options={this.state.options} ref={"chart"} />
          </Spin>
        </Card>
      </Fragment>
    );
  }
}

const mapStateToProps = state => {
  return {
    auth_token: state.auth.auth_token,

    ip_address: state.ipSearchBar.ip_address,

    date_range: state.filter.date_range,
    firewall_rule: state.filter.firewall_rule,
    application: state.filter.application,
    protocol: state.filter.protocol,
    source_zone: state.filter.source_zone,
    destination_zone: state.filter.destination_zone
  };
};

export default connect(mapStateToProps, null)(IpUsageTimeSeriesChart);
