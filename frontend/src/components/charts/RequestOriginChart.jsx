import React, {Component, Fragment} from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import {connect} from "react-redux";
import axios from 'axios';
import '../../charts/chart.css';
import {Card, Drawer, Row, Select, Spin} from "antd";
import mapdata from "../../charts/mapdata";
import {ROOT_URL} from "../../utils";

require("highcharts/modules/map")(Highcharts);

const FETCH_API = `${ROOT_URL}dashboard/map/`;

class RequestOriginChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading : true,
      data: [],
      mapDrawerVisible : false,
      selectedCountryEvent: null
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
    bodyFormData.set('start_date', this.props.date_range[0]);
    bodyFormData.set('end_date', this.props.date_range[1]);
    bodyFormData.set('firewall_rule', this.props.firewall_rule);
    bodyFormData.set('application', this.props.application);
    bodyFormData.set('protocol', this.props.protocol);
    bodyFormData.set('source_zone', this.props.source_zone);
    bodyFormData.set('destination_zone', this.props.destination_zone);

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
      selectedCountryEvent : e
    })
  }


  render(){
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
              console.log(self);

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
            <Select
                id="ExceptCountry"
                size={"large"}
                mode="multiple"
                allowClear={true}
                style={{ width: "100%" }}
                placeholder="Except Country"
                >
            </Select>
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

            <Drawer title={`Logs With Request originating from ${this.state.selectedCountryEvent.point.name} (Experimental)`}
                              width={600}
                              placement="bottom"
                              closable={true}
                              onClose={this.onClose}
                              visible={this.state.mapDrawerVisible}
                      ></Drawer>
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