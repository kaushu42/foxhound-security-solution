import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import mapdata from "../../charts/mapdata";
import ExportJsonExcel from 'js-export-excel';
import {
  countrySelectedInMapChart,
  fetchCountryListData,
  fetchRequestOriginMapData,
  updateMapAfterExcludingCountries,
  closeMapChartLogDrawer,
  fetchSelectedCountryLog,
  updatePagination
} from "../../actions/requestOriginMapChartAction";
import {
  Drawer,
  Select,
  Spin,
  Table,
  Card,
  Row,
  Col,
  Statistic,
  Icon,
  Button
} from "antd";
import ApplicationLineChart from "./ApplicationLineChart";
import QuickIpView from "../../views/QuickIpView";
import { search } from "../../actions/ipSearchAction";
import { bytesToSize } from "../../utils";

class RequestOriginWorldChart extends Component {
  state = {
    params: {},
    basis: "count",
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
    quickIpView: false,
    chartTitle: null
  };

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

  handleTableChange = (pagination, filters, sorter) => {
    const pager = { ...this.props.requestOriginMapPagination };
    pager.current = pagination.current;
    this.props.dispatchPaginationUpdate(pager);
    this.handlefetchSelectedCountryLog({
      // results: pagination.pageSize,
      page: pagination.current,
      sortField: sorter.field,
      sortOrder: sorter.order,
      ...filters
    });
  };

  handlefetchSelectedCountryLog = (params = {}) => {
    const {
      auth_token,
      defaultDate,
      start_date,
      end_date,
      firewall_rule,
      application,
      protocol,
      source_zone,
      destination_zone,
      excludeCountries,
      requestOriginMapPagination,
      mapChartSelectedCountryCode
    } = this.props;
    this.props.dispatchFetchSelectedCountryLog(
      auth_token,
      start_date,
      end_date,
      firewall_rule,
      application,
      protocol,
      source_zone,
      destination_zone,
      excludeCountries,
      params,
      requestOriginMapPagination,
      mapChartSelectedCountryCode
    );
  };

  componentDidMount = async () => {
    this.chart = this.refs.chart.chart;
    this.chart.component = this;
    const {
      auth_token,
      start_date,
      end_date,
      firewall_rule,
      application,
      protocol,
      source_zone,
      destination_zone,
      dispatchFetchRequestOriginMapData,
      excludeCountries,
      ip_address,
      dispatchFetchCountryListData
    } = this.props;
    dispatchFetchRequestOriginMapData(
      auth_token,
      start_date,
      end_date,
      firewall_rule,
      application,
      protocol,
      source_zone,
      destination_zone,
      excludeCountries,
      ip_address,
      this.state.basis
    );
    dispatchFetchCountryListData(
      auth_token,
      start_date,
      end_date,
      firewall_rule,
      application,
      protocol,
      source_zone,
      destination_zone,
      excludeCountries,
      ip_address
    );
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {
      auth_token,
      start_date,
      end_date,
      firewall_rule,
      application,
      protocol,
      source_zone,
      destination_zone,
      dispatchFetchRequestOriginMapData,
      excludeCountries,
      ip_address
    } = this.props;
    if (
      prevProps.excludeCountries != this.props.excludeCountries ||
      String(prevProps.defaultDate) !== String(this.props.defaultDate) ||
      String(prevProps.start_date) !== String(this.props.start_date) ||
      String(prevProps.end_date) !== String(this.props.end_date) ||
      String(prevProps.firewall_rule) !== String(this.props.firewall_rule) ||
      String(prevProps.application) !== String(this.props.application) ||
      String(prevProps.protocol) !== String(this.props.protocol) ||
      String(prevProps.source_zone) !== String(this.props.source_zone) ||
      String(prevProps.destination_zone) !== String(this.props.destination_zone) ||
      String(prevState.basis) !== String(this.state.basis)
    ) {
      {this.props.start_date?this.setState({
        chartTitle:`Request Origin from ${this.props.start_date} to ${this.props.end_date}`
        }):
        this.setState({
          chartTitle:`Request Origin in${this.props.defaultDate}`
        })
      }
      dispatchFetchRequestOriginMapData(
        auth_token,
        start_date,
        end_date,
        firewall_rule,
        application,
        protocol,
        source_zone,
        destination_zone,
        excludeCountries,
        ip_address,
        this.state.basis
      );
    }
  }

  handleMapChartLogView(e) {
    const {
      auth_token,
      start_date,
      end_date,
      firewall_rule,
      application,
      protocol,
      source_zone,
      destination_zone,
      excludeCountries,
      requestOriginMapPagination
    } = this.props;
    this.props.dispatchCountrySelectedInMapChart(
      e,
      auth_token,
      start_date,
      end_date,
      firewall_rule,
      application,
      protocol,
      source_zone,
      destination_zone,
      excludeCountries,
      {},
      requestOriginMapPagination
    );
  }
  
  toTitleCase(str) {
    if(str == null || str== undefined || str==""){
      return str;
    }
    return str
      .toLowerCase()
      .split(" ")
      .map(function(word) {
        return word.replace(word[0], word[0].toUpperCase());
      })
      .join(" ");
  }

  downloadExcel = () => {
    const data = this.props.mapSelectedCountryLogData ? this.props.mapSelectedCountryLogData : '';//tabular data
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
                        'Time elapsed':data[i].time_elapsed,
                        'Source country':data[i].source_country,
                        'Destination country':data[i].destination_country
           }
           dataTable.push(obj);
         }
       }
     }
        option.fileName = `Log of ${this.props.mapChartSelectedCountryName}`
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
    const { mapChartData } = this.props;
    const options = {
      chart: {},
      title: {
        text: this.state.chartTitle
      },
      mapNavigation: {
        enabled: true,
        buttonOptions: {
          verticalAlign: "middle"
        }
      },
      colorAxis: {
        min: 0,
        stops: [
          [0.1, "#0575E6"],
          [0.2, "#0560E6"],
          [0.4, "#0550E6"],
          [0.3, "#0540E6"],
          [0.5, "#0530E6"],
          [0.6, "#0520E6"],
          [0.7, "#0510E6"],
          [0.8, "#0500E6"],
          [0.9, "#0500E6"],
          [1.0, "#050079"]
        ]
      },
      series: [
        {
          mapData: mapdata,
          name: "Request Origin",
          data: mapChartData,
          events: {
            click: function(e) {
              const self = this.chart.component;
              self.handleMapChartLogView(e);
            }
          }
        }
      ]
    };
    const {
      excludeCountries,
      mapChartLoading,
      countrySelectListData,
      dispatchUpdateMapAfterCountryExcluding,
      mapSelectedCountryLogData,
      mapSelectedCountryTotalBytesReceived,
      mapSelectedCountryTotalBytesSent,
      mapSelectedCountryTotalBytesEvents,
      mapSelectedCountryTotalBytesSentUnit,
      mapSelectedCountryTotalBytesReceivedUnit
    } = this.props;
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
        <Spin spinning={mapChartLoading}>
          <Card
            title={
              <Fragment>
                <div>
                Request Origin 
                {countrySelectListData ? (
                  <Select
                    id="country"
                    mode="multiple"
                    allowClear={true}
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.props.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                    style={{ width: "35%", float:"right", paddingRight: 5, paddingLeft: 5 }}
                    onChange={exclude_countries =>
                      dispatchUpdateMapAfterCountryExcluding(exclude_countries)
                    }
                    placeholder="Exclude countries...."
                  >
                    {countrySelectListData.map(data => (
                      <Select.Option key={data[1]}>
                        {this.toTitleCase(data[0])}
                      </Select.Option>
                    ))}
                  </Select>
                ) : null}
                  <Select
                    onChange={value => this.setState({ basis: value })}
                    size={"default"}
                    style={{ width: "35%", float:"right", paddingRight: 5, paddingLeft: 5 }}
                    defaultValue={"count"}
                  >
                    <Select.Option key={"bytes"}>Bytes</Select.Option>
                    <Select.Option key={"packets"}>Packets</Select.Option>
                    <Select.Option key={"count"}>Count</Select.Option>
                  </Select>
                  </div>
              </Fragment>
            }
            className={{ height: 450 }}
          >
            <HighchartsReact
              constructorType={"mapChart"}
              allowChartUpdate={true}
              highcharts={Highcharts}
              ref={"chart"}
              options={options}
            />
          </Card>
        </Spin>
        <Drawer
          title={`Logs With Request originating from ${this.props.mapChartSelectedCountryName}`}
          width={1100}
          placement="right"
          closable={true}
          onClose={this.props.dispatchCloseMapChartLogDrawer}
          visible={this.props.mapChartLogDrawerVisible}
        >
          <Spin spinning={this.props.countryLogDataLoading}>
            <div
              style={{
                background: "#fbfbfb",
                padding: "24px",
                border: "1px solid #d9d9d9",
                borderRadius: 6
              }}
            >
              <Row gutter={16}>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title={<b>Total Events</b>}
                      value={mapSelectedCountryTotalBytesEvents}
                      precision={0}
                      valueStyle={{ color: "#cf1322" }}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title={<b>Total Bytes Sent</b>}
                      value={mapSelectedCountryTotalBytesSent}
                      precision={2}
                      valueStyle={{ color: "#cf1322" }}
                      suffix={mapSelectedCountryTotalBytesSentUnit}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title={<b>Total Bytes Received</b>}
                      value={mapSelectedCountryTotalBytesReceived}
                      precision={2}
                      valueStyle={{ color: "#cf1322" }}
                      suffix={mapSelectedCountryTotalBytesReceivedUnit}
                    />
                  </Card>
                </Col>
              </Row>
            </div>
            <div
              style={{
                background: "#fbfbfb",
                padding: "24px",
                border: "1px solid #d9d9d9",
                borderRadius: 6
              }}
            >
              <ApplicationLineChart
                selectedCountry={this.props.mapChartSelectedCountryCode}
              />
            </div>
            <div
              style={{
                background: "#fbfbfb",
                padding: "24px",
                border: "1px solid #d9d9d9",
                borderRadius: 6
              }}
            >
              <Button type="primary" shape="round" icon="download"
                                onClick={this.downloadExcel}>Export Excel Table
              </Button>
              <Table
                columns={this.state.columns}
                rowKey={record => record.id}
                expandedRowRender={expandedRowRender}
                dataSource={mapSelectedCountryLogData}
                loading={this.props.countryLogDataLoading}
                pagination={this.props.requestOriginMapPagination}
                onChange={this.handleTableChange}
              />
            </div>
          </Spin>
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
    );
  }
}
const mapStateToProps = state => {
  return {
    auth_token: state.auth.auth_token,

    mapChartLoading: state.requestOriginChart.mapChartLoading,
    mapChartData: state.requestOriginChart.mapChartData,
    countrySelectListData: state.requestOriginChart.countrySelectListData,
    excludeCountries: state.requestOriginChart.excludeCountries,

    countryLogDataLoading: state.requestOriginChart.countryLogDataLoading,

    mapChartSelectedCountryCode:
      state.requestOriginChart.mapChartSelectedCountryCode,
    mapChartSelectedCountryName:
      state.requestOriginChart.mapChartSelectedCountryName,
    mapSelectedCountryLogData:
      state.requestOriginChart.mapSelectedCountryLogData,
    mapChartLogDrawerVisible: state.requestOriginChart.mapChartLogDrawerVisible,
    requestOriginMapPagination:
      state.requestOriginChart.requestOriginMapPagination,

    defaultDate: state.filter.defaultDate,
    start_date: state.filter.date_range[0],
    end_date: state.filter.date_range[1],
    firewall_rule: state.filter.firewall_rule,
    application: state.filter.application,
    protocol: state.filter.protocol,
    source_zone: state.filter.source_zone,
    destination_zone: state.filter.destination_zone,
    ip_address: state.filter.ip_address,

    mapSelectedCountryTotalBytesReceived:
      state.requestOriginChart.mapSelectedCountryTotalBytesReceived,
    mapSelectedCountryTotalBytesSent:
      state.requestOriginChart.mapSelectedCountryTotalBytesSent,
    mapSelectedCountryTotalBytesEvents:
      state.requestOriginChart.mapSelectedCountryTotalBytesEvents,

    mapSelectedCountryTotalBytesSentUnit:
      state.requestOriginChart.mapSelectedCountryTotalBytesSentUnit,
    mapSelectedCountryTotalBytesReceivedUnit:
      state.requestOriginChart.mapSelectedCountryTotalBytesReceivedUnit
  };
};
const mapDispatchToProps = dispatch => {
  return {
    dispatchFetchRequestOriginMapData: (
      auth_token,
      start_date,
      end_date,
      firewall_rule,
      application,
      protocol,
      source_zone,
      destination_zone,
      except_countries,
      ip_address,
      basis
    ) =>
      dispatch(
        fetchRequestOriginMapData(
          auth_token,
          start_date,
          end_date,
          firewall_rule,
          application,
          protocol,
          source_zone,
          destination_zone,
          except_countries,
          ip_address,
          basis
        )
      ),
    dispatchFetchCountryListData: (
      auth_token,
      start_date,
      end_date,
      firewall_rule,
      application,
      protocol,
      source_zone,
      destination_zone,
      except_countries,
      ip_address
    ) =>
      dispatch(
        fetchCountryListData(
          auth_token,
          start_date,
          end_date,
          firewall_rule,
          application,
          protocol,
          source_zone,
          destination_zone,
          except_countries,
          ip_address
        )
      ),
    dispatchUpdateMapAfterCountryExcluding: exclude_countries =>
      dispatch(updateMapAfterExcludingCountries(exclude_countries)),
    dispatchCountrySelectedInMapChart: (
      event,
      auth_token,
      start_date,
      end_date,
      firewall_rule,
      application,
      protocol,
      source_zone,
      destination_zone,
      except_countries,
      params,
      pagination
    ) =>
      dispatch(
        countrySelectedInMapChart(
          event,
          auth_token,
          start_date,
          end_date,
          firewall_rule,
          application,
          protocol,
          source_zone,
          destination_zone,
          except_countries,
          params,
          pagination
        )
      ),
    dispatchCloseMapChartLogDrawer: () => dispatch(closeMapChartLogDrawer()),
    dispatchFetchSelectedCountryLog: (
      auth_token,
      start_date,
      end_date,
      firewall_rule,
      application,
      protocol,
      source_zone,
      destination_zone,
      excludeCountries,
      params,
      pagination,
      mapChartSelectedCountryCode
    ) =>
      dispatch(
        fetchSelectedCountryLog(
          auth_token,
          start_date,
          end_date,
          firewall_rule,
          application,
          protocol,
          source_zone,
          destination_zone,
          excludeCountries,
          params,
          pagination,
          mapChartSelectedCountryCode
        )
      ),
    dispatchPaginationUpdate: pager => dispatch(updatePagination(pager)),
    dispatchIpSearchValueUpdate: value => dispatch(search(value))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RequestOriginWorldChart);
