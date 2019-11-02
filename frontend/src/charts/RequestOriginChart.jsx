import React, { Component } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import mapdata from "./mapdata";
import {ROOT_URL} from "../utils";
import {connect} from "react-redux";
import axios from 'axios';

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
      [1.0, "#f00"]
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
      data: [],
    }
  }


  componentDidMount = async () => {
    await this.handleFetchData();
    let chart = this.refs.chart.chart;
    chart.update({
      series: [
        {
          mapData: mapdata,
          name: "World",
          data: this.state.data
        }
      ]

    });
  }


  componentDidUpdate(prevProps, prevState, snapshot) {
    if(prevState.data != this.state.data){
      let chart = this.refs.chart.chart;
      console.log(this.state.data.data);
      chart.update({
        series: [
          {
            mapData: mapdata,
            name: "World",
            data: this.state.data.data
          }
        ]

      });
    }
  }

  handleFetchData = () => {
    const token = `Token ${this.props.auth_token}`;
    let headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Authorization" : token
    };
    axios.post(FETCH_API,null,{headers}).
    then(res => {
      const response = res.data;
      console.log('api data',response);
      this.setState({
        data : response
      })

    });

  }

  render(){
    return (
      <div>
        <HighchartsReact
            constructorType={"mapChart"}
            allowChartUpdate={false}
            highcharts={Highcharts}
            ref = {'chart'}
            options = {options}
        />

      </div>
    );
  }
}
const mapStateToProps = state => {
  return {
    auth_token : state.auth.auth_token
  }
}

export default connect(mapStateToProps,null)(RequestOriginChart);
