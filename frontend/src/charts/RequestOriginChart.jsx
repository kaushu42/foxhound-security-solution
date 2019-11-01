import React, { Component } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import mapdata from "./mapdata";

require("highcharts/modules/map")(Highcharts);

const data = [
  ["ru", 40],
  ["pe", 4],
  ["dk", 10],
  ["si", 5],
  ["cz", 10],
  ["sg", 18],
  ["us", 428],
  ["ke", 2],
  ["kr", 26],
  ["jp", 21],
  ["nz", 2],
  ["kz", 3],
  ["ve", 2],
  ["hn", 1],
  ["iq", 1],
  ["au", 7],
  ["ir", 13],
  ["cl", 4],
  ["qa", 1],
  ["nl", 57],
  ["in", 27],
  ["cn", 86],
  ["at", 31],
  ["vn", 18],
  ["ar", 4],
  ["zm", 1],
  ["br", 95],
  ["pl", 14],
  ["my", 3],
  ["hk", 43],
  ["np", 92],
  ["mq", 1],
  ["eg", 2],
  ["se", 12],
  ["kn", 1],
  ["ch", 17],
  ["sc", 1],
  ["pk", 1],
  ["de", 118],
  ["lu", 3],
  ["tw", 29],
  ["ca", 22],
  ["sk", 28],
  ["lt", 2],
  ["fr", 37],
  ["lv", 1],
  ["---", 9],
  ["mx", 4],
  ["ro", 6],
  ["hu", 5],
  ["ph", 1],
  ["fi", 2],
  ["rs", 7],
  ["ec", 2],
  ["ie", 10],
  ["id", 5],
  ["mn", 2],
  ["am", 1],
  ["bd", 9],
  ["pa", 1],
  ["lb", 3],
  ["za", 4],
  ["ua", 7],
  ["pt", 2],
  ["es", 6],
  ["ng", 1],
  ["no", 10],
  ["th", 7],
  ["bg", 7],
  ["gb", 27],
  ["tn", 2],
  ["it", 29],
  ["tr", 11],
  ["ps", 2],
  ["cr", 1],
  ["ma", 2],
  ["al", 2],
  ["gr", 2],
  ["kh", 3],
  ["be", 1],
  ["co", 3],
  ["np", 251]
];

class RequestOriginChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mapOptions: {
        title: {
          text: ""
        },
        colorAxis: {
          min: 0,
          stops: [
            [0.0, "#0000ff"],
            // [0.5, "#00ff00"],
            // [0.4, "#00bfff"],
            // [0.6, "#00ffbf"],
            // [0.8, "#bfff00"],
            [1.0, "#ff0000"]
          ] // change color according to value
        },
        series: [
          {
            mapData: mapdata,
            name: "World",
            data: data
          }
        ]
      }
    };
  }

  render() {
    return (
      <HighchartsReact
        options={this.state.mapOptions}
        constructorType={"mapChart"}
        highcharts={Highcharts}
      />
    );
  }
}

export default RequestOriginChart;
