import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {ROOT_URL, axiosHeader, bytesToSize} from '../../utils'
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import mapdata from "../../charts/mapdata";
import axios from 'axios';
import {Drawer, Spin, Table, Row, Col, Card, Statistic, Select} from 'antd';
import ThreatApplicationChart from './ThreatApplicationChart';
import QuickIpView from '../../views/QuickIpView';
import {search} from '../../actions/ipSearchAction';

const FETCH_API = `${ROOT_URL}dashboard/country/`;
const FETCH_API_COUNTRY_NAMES = `${ROOT_URL}dashboard/country_list/`;
const FETCH_API_COUNTRY_LOGS = `${ROOT_URL}log/request-origin/`;

class ThreatRequestOriginWorldChart extends Component{
  state ={
    params: {},
    pagination: {},
    data: null,
    logData: null,
    mapChartLoading:false,
    basis: "count",
    countryList: [],
    selectedCountryCode: null,
    selectedCountryName:null,
    selectedCountryLog:null,
    logDrawerVisible:false,
    logLoading: false,
    totalEvents:null,
    totalBytesSent:null,
    totalBytesReceived:null,
    excludeCountries: [],
    QuickIpView: false,
    columns: [
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
          title: 'Source Port',
          dataIndex: 'source_port',
          key: 'source_port',
      },
      {
        title: "Destination Port",
        dataIndex: "destination_port",
        key: "destination_port"
      },
      {
        title: "Logged DateTime",
        dataIndex: "logged_datetime",
        key: "logged_datetime",
        render: text => (new Date(text*1000+20700000).toUTCString()).replace(" GMT", "")
      }
    ],
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
  
  componentDidMount = () => {
    this.chart = this.refs.chart.chart;
    this.chart.component = this;

    let headers = axiosHeader(this.props.auth_token);

    axios.post(FETCH_API_COUNTRY_NAMES,null,{headers})
    .then(res => {
      const response = res.data;
      this.setState({
        countryList: response
      })
      console.log('fetched country select List data ', this.state.countryList);
    })

    this.handleFetchData()
  }

  handleFetchData = () => {
    this.setState({
      mapChartLoading:true
    })

    let headers = axiosHeader(this.props.auth_token);
    let bodyFormData = new FormData();
     bodyFormData.set('except_countries', this.state.excludeCountries);
     bodyFormData.set('start_date', this.props.date_range[0]);
     bodyFormData.set('end_date', this.props.date_range[1]);
     bodyFormData.set('firewall_rule', this.props.firewall_rule);
     bodyFormData.set('application', this.props.application);
     bodyFormData.set('protocol', this.props.protocol);
     bodyFormData.set('source_zone', this.props.source_zone);
     bodyFormData.set('destination_zone', this.props.destination_zone);
     bodyFormData.set('basis', this.state.basis);

     axios.post(FETCH_API,bodyFormData,{headers})
    .then(res => {
        const response = res.data;
        let final_data = [];
        
        Object.keys(response).forEach(country => {
          final_data.push({"hc-key":country,"value":response[country]});
        });

        this.setState({
          data: final_data,
          mapChartLoading:false
        })
        console.log('fetched country data ', this.state.data);
    })
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (
      prevState.excludeCountries != this.state.excludeCountries ||
      String(prevProps.start_date) !== String(this.props.start_date) ||
      String(prevProps.end_date) !== String(this.props.end_date) ||
      String(prevProps.firewall_rule) !== String(this.props.firewall_rule) ||
      String(prevProps.application) !== String(this.props.application) ||
      String(prevProps.protocol) !== String(this.props.protocol) ||
      String(prevProps.source_zone) !== String(this.props.source_zone) ||
      String(prevProps.destination_zone) !== String(this.props.destination_zone) ||
      String(prevState.basis) !== String(this.state.basis)
    ){
      this.handleFetchData()
    }
  }
  
  handleMapChartLogView = (e) => {
    this.setState({
      selectedCountryCode: event.point['hc-key'],
      selectedCountryName: event.point.name,
      logDrawerVisible:true
    })
    this.handleFetchSelectedCountryLog()
  }

  handleTableChange = (pagination, filters, sorter) => {
    console.log("pagination", pagination);
    console.log("filter", filters);
    console.log("sorter", sorter);
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    (this.state.pagination = pager),
      this.handleFetchSelectedCountryLog({
      page: pagination.current,
      sortField: sorter.field,
      sortOrder: sorter.order,
      ...filters
    });
  };

  handleFetchSelectedCountryLog = (params = {}) => {
    this.setState({
      logLoading:true,
    })

    let headers = axiosHeader(this.props.auth_token);

    let bodyFormData = new FormData();
    bodyFormData.set('country', this.state.selectedCountryCode);

    axios.post(FETCH_API_COUNTRY_LOGS,bodyFormData,{headers,params})
    .then(res => {
      const response = res.data;
      const page = this.state.pagination;
      page.total = res.data.count;
      let totalBytesReceived = bytesToSize(response.bytes_received)
      let totalBytesSent = bytesToSize(response.bytes_sent)
      this.setState({
        selectedCountryLog: response.results,
        totalEvents:response.rows,
        totalBytesReceived:totalBytesReceived,
        totalBytesSent: totalBytesSent,
        pagination: page,
        logLoading:false
      });
    })
  }

  handleCloseLogDrawer = () => {
    this.setState({
        logDrawerVisible: false
    });
  };

  toTitleCase = (str) => {
    return str
      .toLowerCase()
      .split(" ")
      .map(function(word) {
        return word.replace(word[0], word[0].toUpperCase());
      })
      .join(" ");
  }

  render(){
    const options = {
      chart: {},
      title: {
        text: null
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
          data: this.state.data,
          events: {
            click: function(e) {
              const self = this.chart.component;
              self.handleMapChartLogView(e);
            }
          }
        }
      ]
    };
    return(
      <Fragment>
        <Spin spinning={this.state.mapChartLoading}>
          <Card
            title={
              <Fragment>
                <div>
                Request Origin (Count)
                {this.state.countryList ? (
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
                      this.setState({
                          excludeCountries: exclude_countries
                      })
                    }
                    placeholder="Exclude countries...."
                  >
                    {this.state.countryList.map(data => (
                      <Select.Option key={data[1]}>
                        {this.toTitleCase(data[0])}
                      </Select.Option>
                    ))}
                  </Select>
                ) : null}
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
          title={`Logs With Request originating from ${this.state.selectedCountryName}`}
          width={1100}
          placement="right"
          closable={true}
          onClose={this.handleCloseLogDrawer}
          visible={this.state.logDrawerVisible}
        >
          <Spin spinning={this.state.logLoading}>
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
                      value={this.state.totalEvents}
                      precision={0}
                      valueStyle={{ color: "#cf1322" }}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title={<b>Total Bytes Sent</b>}
                      value={this.state.totalBytesSent}
                      precision={2}
                      valueStyle={{ color: "#cf1322" }}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title={<b>Total Bytes Received</b>}
                      value={this.state.totalBytesReceived}
                      precision={2}
                      valueStyle={{ color: "#cf1322" }}
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
              <ThreatApplicationChart
                selectedCountry={this.state.selectedCountryName}
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
              <Table
                columns={this.state.columns}
                rowKey={record => record.id}
                dataSource={this.state.selectedCountryLog}
                loading={this.state.logLoading}
                pagination={this.state.pagination}
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
    )
  }
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
  return{
    dispatchIpSearchValueUpdate: value => dispatch(search(value))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ThreatRequestOriginWorldChart)