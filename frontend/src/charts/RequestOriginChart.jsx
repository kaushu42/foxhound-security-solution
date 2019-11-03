import React, {Component, Fragment} from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import mapdata from "./mapdata";
import {ROOT_URL} from "../utils";
import {connect} from "react-redux";
import axios from 'axios';
import '../charts/chart.css';
import {Row, Spin} from "antd";

require("highcharts/modules/map")(Highcharts);

const FETCH_API = `${ROOT_URL}dashboard/map/`;


let options = {
  title: {
    text: "Request Origin"
  },
  mapNavigation: {
    enabled: true,
    buttonOptions: {
      verticalAlign: 'bottom'
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
      name: "World",
      data: null
    }
  ]
}


class RequestOriginChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading : true,
      data: [],
    }
  }


  componentDidMount = () => {
    this.handleFetchData();
    this.chart = this.refs.chart.chart;
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
          name: "World",
          data: this.state.data.data
        }
      ]
    });
    this.setState({
      loading : false
    });

  }

  render(){
    return (
        <Spin tip="Loading..." spinning={this.state.loading}>
          <Row>
            <HighchartsReact
                constructorType={"mapChart"}
                allowChartUpdate={false}
                highcharts={Highcharts}
                ref = {'chart'}
                options = {options}
            />
          </Row>
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
