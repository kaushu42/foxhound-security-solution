import React, {Component, Fragment} from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import {connect} from "react-redux";
import axios from 'axios';
import reqwest from "reqwest";
import '../../charts/chart.css';
import {Card, Drawer, Row, Select, Spin, Col, Statistic, Table} from "antd";
import mapdata from "../../charts/mapdata";
import {ROOT_URL} from "../../utils";

require("highcharts/modules/map")(Highcharts);

const FETCH_API = `${ROOT_URL}dashboard/map/`;
const FETCH_API_COUNTRY_NAMES = `${ROOT_URL}dashboard/countries/`;
const FETCH_API_REQUEST_ORIGIN = `${ROOT_URL}log/request-origin/`;

const drawerInfoStyle = {
  paddingBottom : 10,
  paddingTop : 10,
  border: '1px solid rgb(235, 237, 240)'
}

class RequestOriginChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading : true,
      data: [],
      mapDrawerVisible : false,
      selectedCountryEvent: null,
      record : null,
      countries: [],
      exceptcountries: [],
      loadCountrydata: true,
      selectedCountry: "",
      selectedCountryCode: "",
      selectedCountryData: [],
      pagination: {},
      flag: 0,
      columns : [
        {
            title: 'Id',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Source Address',
            dataIndex: 'source_ip.address',
            key: 'source_ip.address',
        },
        {
            title: 'Destination Address',
            dataIndex: 'destination_ip.address',
            key: 'destination_ip.address',
        },
        {
            title: 'Application',
            dataIndex: 'application.name',
            key: 'application.name',
        },
        {
            title: 'Source Port',
            dataIndex: 'source_port',
            key: 'source_port',
        },
        {
            title: 'Destination Port',
            dataIndex: 'destination_port',
            key: 'destination_port',
        },
        {
            title: 'Bytes Sent',
            dataIndex: 'bytes_sent',
            key: 'bytes_sent',
        },
        {
            title: 'Bytes Received',
            dataIndex: 'bytes_received',
            key: 'bytes_received',
        },
        {
            title: 'Logged DateTime',
            dataIndex: 'logged_datetime',
            key: 'logged_datetime',
        },
      ]
    }
  }

  componentDidMount = async () => {
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

  handleFetchData = (params = {}, flag = 0) => {

    (flag == 0) ?
    (this.setState({
      loading : true
    })):
    (null);

    const token = `Token ${this.props.auth_token}`;
    let headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Authorization" : token
    };  

    var bodyFormData = new FormData();
    bodyFormData.set('country', this.state.selectedCountryCode);
    bodyFormData.set('except_countries', this.state.exceptcountries);
    bodyFormData.set('start_date', this.props.date_range[0]);
    bodyFormData.set('end_date', this.props.date_range[1]);
    bodyFormData.set('firewall_rule', this.props.firewall_rule);
    bodyFormData.set('application', this.props.application);
    bodyFormData.set('protocol', this.props.protocol);
    bodyFormData.set('source_zone', this.props.source_zone);
    bodyFormData.set('destination_zone', this.props.destination_zone);
    bodyFormData.set('page', params.page ? params.page : 1);
    bodyFormData.set('offset', 10);
    // console.log('excluded countries', this.state.exceptcountries)

    (flag == 1) ?
    (
        axios.post(FETCH_API_REQUEST_ORIGIN,bodyFormData,{headers,params}).
    then(res => {
      console.log(res);
      const response = res.data;
      const { pagination } = this.state;
      pagination.total = response.count;
      this.setState({
        selectedCountryData: response.results,
        loadCountrydata: false,
        pagination:pagination
      })
    })):

    (axios.post(FETCH_API,bodyFormData,{headers}).
    then(res => {
      const response = res.data;
      console.log('api data',response);
      this.setState({
        data : response,
      })
    }),

    axios.post(FETCH_API_COUNTRY_NAMES,bodyFormData,{headers}).
    then(res => {
      const response = res.data;
      this.setState({
        countries: response
      })
    }));
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
        (String(prevState.exceptcountries)!==String(this.state.exceptcountries)) || 
        (String(prevProps.ip_address)!==String(this.props.ip_address)) ||
        (String(prevProps.date_range[0])!==String(this.props.date_range[0])) ||
        (String(prevProps.date_range[1])!==String(this.props.date_range[1])) ||
        (String(prevProps.firewall_rule)!==String(this.props.firewall_rule)) ||
        (String(prevProps.application)!==String(this.props.application)) ||
        (String(prevProps.protocol)!==String(this.props.protocol)) ||
        (String(prevProps.source_zone)!==String(this.props.source_zone)) ||
        (String(prevProps.destination_zone)!==String(this.props.destination_zone))
    ){
      this.handleFetchData();
    }
    if(prevState.data!==this.state.data){
      this.updateChart();
    }
  }


  updateChart = () => {
    this.chart.update({
      series: [
        {
          mapData: mapdata,
          name: "",
          data: this.state.data.data
        }
      ]
    });
    this.setState({
      loading : false
    });

  }

  onClose = () => {
    this.setState({
      mapDrawerVisible:false
    })

  }

  handleClickEvent = (e)=> {
    this.setState({
      mapDrawerVisible:true
    })
    this.setState({
      selectedCountryEvent : e,
      loadCountrydata: true,
      selectedCountryCode: e.point['hc-key'],
      selectedCountry: e.point.name,
      flag:1
    })
    this.handleFetchData({}, this.state.flag);
    this.setState({
      loadCountrydata: false
    })
  }

  handleTableChange = (pagination, filters, sorter) => {
      console.log('pagination',pagination);
      console.log('filter',filters)
      console.log('sorter',sorter)
      const pager = { ...this.state.pagination };
      pager.current = pagination.current;
      this.setState({
          pagination: pager
      });
      this.handleFetchData({
          // results: pagination.pageSize,
          page: pagination.current,
          sortField: sorter.field,
          sortOrder: sorter.order,
          ...filters
      }, this.state.flag);
  };

  render(){
    const countrySelectListItem = this.state.countries.map(data => <Option key={data['id']}>{data['name']}</Option>);
    const options = {
      title: {
        text: "Request Origin"
      },
      mapNavigation: {
        enabled: true,
        buttonOptions: {
          verticalAlign: 'middle'
        }
      },

      colorAxis: {
        min: 0,
        stops: [
          [0.0, "#fff"],
          [1.0, "#00f"]
        ] // change color according to value
      },
      series: [
        {
          mapData: mapdata,
          name: "Request Origin",
          events: {
            click: function (e) {
              const self = this.chart.component;
              self.handleClickEvent(e);
              let text = this.name +
                  '<br>Request Count: ' + e.point.name + ' '+ e.point.value + ' Requests';
              if (!this.chart.clickLabel) {
                this.chart.clickLabel = this.chart.renderer.label(text, 10, 10)
                    .css({
                      width: '200px',
                      height: '50px'

                    })
                    .add();
              } else {
                this.chart.clickLabel.attr({
                  text: text
                });
              }
            }
          }
        }
      ]
   }

    return (
        <Spin tip="Loading..." spinning={this.state.loading}>
          <Card title={
            <Fragment>
              <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                        <Select
                            id="country"
                            size={"large"}
                            mode="multiple"
                            loading={this.state.loading}
                            allowClear={true}
                            style={{ width: "100%" }}
                            placeholder="Exclude"
                            onChange={(v)=> this.setState({
                              exceptcountries: v,
                              loading:true
                            })}>
                            {
                                countrySelectListItem
                            }
                        </Select>
                    </Col>
            </Fragment>
          }>
            <HighchartsReact
                constructorType={"mapChart"}
                allowChartUpdate={false}
                highcharts={Highcharts}
                ref = {'chart'}
                options = {options}
            />

          </Card>
            {this.state.selectedCountryEvent ?

            <Drawer title={`Logs With Request originating from ${this.state.selectedCountry} (Experimental)`}
                              width={1100}
                              placement="right"
                              closable={true}
                              onClose={this.onClose}
                              visible={this.state.mapDrawerVisible}
                      >
                    <Spin tip={"loading..."} spinning={this.state.loadCountrydata}>
                          <Fragment>
                          <Table
                              columns={this.state.columns}
                              rowKey={record => record.id}
                              dataSource={this.state.selectedCountryData}
                              pagination={this.state.pagination}
                              loading={this.state.loadCountrydata}
                              onChange={this.handleTableChange}
                          />
                          </Fragment>
                    </Spin>
              </Drawer>
                : null
            }
        </Spin>
    );
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

export default connect(mapStateToProps,null)(RequestOriginChart);